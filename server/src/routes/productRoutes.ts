import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { productService } from '../services/product.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/products
 * List all products (optionally filter by store)
 * Query params: storeId, includeVariants
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, includeVariants } = req.query;
    
    const products = await productService.getProducts(
      storeId as string | undefined,
      includeVariants === 'false' ? false : true
    );

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
});

/**
 * GET /api/products/search
 * Search products by keyword
 * Query params: q (query), storeId
 */
router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { q, storeId } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required',
      });
    }

    const products = await productService.searchProducts(
      q,
      storeId as string | undefined
    );

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    logger.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message,
    });
  }
});

/**
 * GET /api/products/stats/:storeId
 * Get product statistics for a store
 */
router.get('/stats/:storeId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const stats = await productService.getProductStats(storeId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message,
    });
  }
});

/**
 * GET /api/products/:id
 * Get single product with variants by ID
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    logger.error('Error fetching product:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
});

/**
 * POST /api/products/sync
 * Sync products from Shopify for a store
 * Body: { storeId: string }
 */
router.post('/sync', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'Store ID is required',
      });
    }

    logger.info(`Starting product sync for store: ${storeId} by user: ${req.user?.email}`);

    const result = await productService.syncProductsFromShopify(storeId);

    res.json({
      success: true,
      message: 'Products synced successfully',
      data: result,
    });
  } catch (error: any) {
    logger.error('Error syncing products:', error);

    if (error.message === 'Store not found') {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    if (error.message === 'Store is not active') {
      return res.status(400).json({
        success: false,
        message: 'Store is not active',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to sync products',
      error: error.message,
    });
  }
});

/**
 * PUT /api/products/:id
 * Update product details (manual edit)
 * Body: { title, productType, status, vendor, tags, description }
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, productType, status, vendor, tags, description } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (productType !== undefined) updateData.productType = productType;
    if (status !== undefined) updateData.status = status;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (tags !== undefined) updateData.tags = tags;
    if (description !== undefined) updateData.description = description;

    const product = await productService.updateProduct(id, updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    logger.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete (archive) a product
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await productService.deleteProduct(id);

    res.json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error: any) {
    logger.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
});

/**
 * GET /api/products/:productId/variants
 * Get all variants for a specific product
 */
router.get('/:productId/variants', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const variants = await productService.getProductVariants(productId);

    res.json({
      success: true,
      count: variants.length,
      data: variants,
    });
  } catch (error: any) {
    logger.error('Error fetching product variants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product variants',
      error: error.message,
    });
  }
});

/**
 * GET /api/products/variants/:id
 * Get single variant by ID
 */
router.get('/variants/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const variant = await productService.getVariantById(id);

    res.json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    logger.error('Error fetching variant:', error);

    if (error.message === 'Variant not found') {
      return res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch variant',
      error: error.message,
    });
  }
});

/**
 * PUT /api/products/variants/:id
 * Update variant price or inventory
 * Body: { price, compareAtPrice, inventoryQty, sku, barcode }
 */
router.put('/variants/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { price, compareAtPrice, inventoryQty, sku, barcode } = req.body;

    const updateData: any = {};
    if (price !== undefined) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) updateData.compareAtPrice = parseFloat(compareAtPrice);
    if (inventoryQty !== undefined) updateData.inventoryQty = parseInt(inventoryQty, 10);
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode;

    const variant = await productService.updateVariant(id, updateData);

    res.json({
      success: true,
      message: 'Variant updated successfully',
      data: variant,
    });
  } catch (error: any) {
    logger.error('Error updating variant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variant',
      error: error.message,
    });
  }
});

export default router;

