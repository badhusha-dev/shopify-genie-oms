import prisma from '../utils/prisma';
import { logger } from '../utils/logger';
import { decryptToken } from '../utils/shopify';
import axios from 'axios';

export class ProductService {
  /**
   * Get all Shopify products for a store
   */
  async getProducts(storeId?: string, includeVariants: boolean = true) {
    try {
      const where = storeId ? { storeId } : {};
      
      const products = await prisma.shopifyProduct.findMany({
        where,
        include: includeVariants ? { variants: true, store: true } : { store: true },
        orderBy: { createdAt: 'desc' },
      });

      return products;
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a single product by ID with variants
   */
  async getProductById(id: string) {
    try {
      const product = await prisma.shopifyProduct.findUnique({
        where: { id },
        include: { variants: true, store: true },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get a single product by Shopify ID
   */
  async getProductByShopifyId(shopifyId: string) {
    try {
      const product = await prisma.shopifyProduct.findUnique({
        where: { shopifyId },
        include: { variants: true, store: true },
      });

      return product;
    } catch (error) {
      logger.error('Error fetching product by Shopify ID:', error);
      throw error;
    }
  }

  /**
   * Sync products from Shopify for a specific store
   */
  async syncProductsFromShopify(storeId: string) {
    try {
      const store = await prisma.store.findUnique({ 
        where: { id: storeId } 
      });

      if (!store) {
        throw new Error('Store not found');
      }

      if (!store.isActive) {
        throw new Error('Store is not active');
      }

      const token = decryptToken(store.encryptedToken);
      const shopDomain = store.shopifyDomain;

      logger.info(`Syncing products from Shopify store: ${shopDomain}`);

      // Shopify REST Admin API endpoint with pagination
      let allProducts: any[] = [];
      let url = `https://${shopDomain}/admin/api/2024-10/products.json?limit=250`;
      let hasMore = true;

      while (hasMore) {
        const response = await axios.get(url, {
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
          },
        });

        const shopifyProducts = response.data.products;
        allProducts = allProducts.concat(shopifyProducts);

        // Check for pagination
        const linkHeader = response.headers['link'];
        if (linkHeader && linkHeader.includes('rel="next"')) {
          const nextUrlMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          if (nextUrlMatch) {
            url = nextUrlMatch[1];
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      logger.info(`Found ${allProducts.length} products to sync`);

      let syncedCount = 0;
      let variantCount = 0;

      // Process each product
      for (const p of allProducts) {
        try {
          // Upsert product
          const product = await prisma.shopifyProduct.upsert({
            where: { shopifyId: String(p.id) },
            update: {
              title: p.title,
              handle: p.handle,
              productType: p.product_type || null,
              vendor: p.vendor || null,
              status: p.status || 'active',
              tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
              imageUrl: p.image?.src || null,
              description: p.body_html || null,
              updatedAt: new Date(),
            },
            create: {
              shopifyId: String(p.id),
              storeId: store.id,
              title: p.title,
              handle: p.handle,
              productType: p.product_type || null,
              vendor: p.vendor || null,
              status: p.status || 'active',
              tags: p.tags ? p.tags.split(',').map((t: string) => t.trim()) : [],
              imageUrl: p.image?.src || null,
              description: p.body_html || null,
            },
          });

          syncedCount++;

          // Sync variants
          if (p.variants && Array.isArray(p.variants)) {
            for (const v of p.variants) {
              await prisma.shopifyProductVariant.upsert({
                where: { shopifyId: String(v.id) },
                update: {
                  title: v.title,
                  sku: v.sku || null,
                  price: parseFloat(v.price) || 0,
                  compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
                  inventoryQty: v.inventory_quantity || 0,
                  inventoryPolicy: v.inventory_policy || null,
                  barcode: v.barcode || null,
                  weight: v.weight ? parseFloat(v.weight) : null,
                  weightUnit: v.weight_unit || 'kg',
                  position: v.position || null,
                  imageUrl: v.image_id ? p.images?.find((img: any) => img.id === v.image_id)?.src : null,
                  updatedAt: new Date(),
                },
                create: {
                  shopifyId: String(v.id),
                  productId: product.id,
                  title: v.title,
                  sku: v.sku || null,
                  price: parseFloat(v.price) || 0,
                  compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
                  inventoryQty: v.inventory_quantity || 0,
                  inventoryPolicy: v.inventory_policy || null,
                  barcode: v.barcode || null,
                  weight: v.weight ? parseFloat(v.weight) : null,
                  weightUnit: v.weight_unit || 'kg',
                  position: v.position || null,
                  imageUrl: v.image_id ? p.images?.find((img: any) => img.id === v.image_id)?.src : null,
                },
              });
              variantCount++;
            }
          }
        } catch (error) {
          logger.error(`Error syncing product ${p.id}:`, error);
          // Continue with next product
        }
      }

      // Update last sync time
      await prisma.store.update({
        where: { id: storeId },
        data: { lastSyncAt: new Date() },
      });

      logger.info(`Sync completed: ${syncedCount} products, ${variantCount} variants`);

      return {
        success: true,
        productsCount: syncedCount,
        variantsCount: variantCount,
        totalProducts: allProducts.length,
      };
    } catch (error: any) {
      logger.error('Error syncing products from Shopify:', error);
      throw new Error(`Failed to sync products: ${error.message}`);
    }
  }

  /**
   * Update product details
   */
  async updateProduct(id: string, data: {
    title?: string;
    productType?: string;
    status?: string;
    vendor?: string;
    tags?: string[];
    description?: string;
  }) {
    try {
      const product = await prisma.shopifyProduct.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: { variants: true },
      });

      return product;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Update variant details
   */
  async updateVariant(id: string, data: {
    price?: number;
    compareAtPrice?: number;
    inventoryQty?: number;
    sku?: string;
    barcode?: string;
  }) {
    try {
      const variant = await prisma.shopifyProductVariant.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return variant;
    } catch (error) {
      logger.error('Error updating variant:', error);
      throw new Error('Failed to update variant');
    }
  }

  /**
   * Get variant by ID
   */
  async getVariantById(id: string) {
    try {
      const variant = await prisma.shopifyProductVariant.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!variant) {
        throw new Error('Variant not found');
      }

      return variant;
    } catch (error) {
      logger.error('Error fetching variant:', error);
      throw error;
    }
  }

  /**
   * Get all variants for a product
   */
  async getProductVariants(productId: string) {
    try {
      const variants = await prisma.shopifyProductVariant.findMany({
        where: { productId },
        orderBy: { position: 'asc' },
      });

      return variants;
    } catch (error) {
      logger.error('Error fetching product variants:', error);
      throw new Error('Failed to fetch product variants');
    }
  }

  /**
   * Search products by keyword
   */
  async searchProducts(keyword: string, storeId?: string) {
    try {
      const where: any = {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { productType: { contains: keyword, mode: 'insensitive' } },
          { vendor: { contains: keyword, mode: 'insensitive' } },
          { variants: { some: { sku: { contains: keyword, mode: 'insensitive' } } } },
        ],
      };

      if (storeId) {
        where.storeId = storeId;
      }

      const products = await prisma.shopifyProduct.findMany({
        where,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return products;
    } catch (error) {
      logger.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get product statistics for a store
   */
  async getProductStats(storeId: string) {
    try {
      const totalProducts = await prisma.shopifyProduct.count({
        where: { storeId },
      });

      const totalVariants = await prisma.shopifyProductVariant.count({
        where: { product: { storeId } },
      });

      const activeProducts = await prisma.shopifyProduct.count({
        where: { storeId, status: 'active' },
      });

      const lowStockVariants = await prisma.shopifyProductVariant.count({
        where: {
          product: { storeId },
          inventoryQty: { lte: 10 },
        },
      });

      const outOfStockVariants = await prisma.shopifyProductVariant.count({
        where: {
          product: { storeId },
          inventoryQty: 0,
        },
      });

      return {
        totalProducts,
        totalVariants,
        activeProducts,
        lowStockVariants,
        outOfStockVariants,
      };
    } catch (error) {
      logger.error('Error fetching product stats:', error);
      throw new Error('Failed to fetch product statistics');
    }
  }

  /**
   * Delete a product (soft delete by setting status to archived)
   */
  async deleteProduct(id: string) {
    try {
      const product = await prisma.shopifyProduct.update({
        where: { id },
        data: { status: 'archived' },
      });

      return product;
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}

export const productService = new ProductService();

