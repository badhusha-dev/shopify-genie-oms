import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { verifyShopifyWebhook } from '../utils/shopify';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Shopify Webhook Handler
 * 
 * NOTE: This route expects express.raw body middleware when mounted
 * Example: app.post('/api/shopify/webhooks/:topic', express.raw({ type: 'application/json' }), webhookRouter)
 * 
 * Supported topics:
 * - products/create
 * - products/update
 * - products/delete
 */
router.post('/:topic', async (req: Request, res: Response) => {
  const topic = req.params.topic;
  const shopDomain = req.header('x-shopify-shop-domain') || req.header('x-shopify-shop-origin') || '';
  const hmac = req.header('x-shopify-hmac-sha256') || '';
  const secret = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_WEBHOOK_SECRET || '';

  logger.info(`Received webhook: ${topic} from ${shopDomain}`);

  // Verify HMAC signature
  const rawBody: Buffer = req.body as Buffer;
  if (!verifyShopifyWebhook(hmac, rawBody, secret)) {
    logger.warn(`Invalid Shopify webhook HMAC from ${shopDomain} for topic: ${topic}`);
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    logger.error('Failed to parse webhook body:', err);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  try {
    // Find the store by shop domain
    const store = await prisma.store.findUnique({ 
      where: { shopifyDomain: shopDomain } 
    });

    if (!store) {
      logger.warn(`Store not found for shop domain: ${shopDomain}`);
      // Still return 200 to prevent Shopify from retrying
      return res.status(200).json({ message: 'Store not found, webhook ignored' });
    }

    // Handle product create/update
    if (topic === 'products/create' || topic === 'products/update') {
      await handleProductUpsert(payload, store.id, topic);
      logger.info(`Successfully processed ${topic} webhook for product: ${payload.id}`);
      return res.status(200).json({ message: 'Product synced successfully' });
    }

    // Handle product delete
    if (topic === 'products/delete') {
      await handleProductDelete(payload, store.id);
      logger.info(`Successfully processed products/delete webhook for product: ${payload.id}`);
      return res.status(200).json({ message: 'Product deleted successfully' });
    }

    // Handle inventory level updates (optional)
    if (topic === 'inventory_levels/update') {
      await handleInventoryUpdate(payload, store.id);
      logger.info(`Successfully processed inventory_levels/update webhook`);
      return res.status(200).json({ message: 'Inventory updated successfully' });
    }

    // For unhandled topics, acknowledge and ignore
    logger.info(`Webhook topic ${topic} received but not handled`);
    return res.status(200).json({ message: 'Webhook received but not handled' });

  } catch (err: any) {
    logger.error('Webhook handler error:', err);
    // Return 200 to prevent Shopify from retrying (log the error for manual review)
    return res.status(200).json({ error: 'Error processing webhook', message: err.message });
  }
});

/**
 * Handle product create/update webhook
 */
async function handleProductUpsert(payload: any, storeId: string, topic: string) {
  const p = payload;

  // Upsert product
  const product = await prisma.shopifyProduct.upsert({
    where: { shopifyId: String(p.id) },
    update: {
      title: p.title,
      handle: p.handle || null,
      productType: p.product_type || null,
      vendor: p.vendor || null,
      status: p.status || 'active',
      tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags) : [],
      imageUrl: p.image?.src || null,
      description: p.body_html || null,
      updatedAt: new Date(),
    },
    create: {
      shopifyId: String(p.id),
      storeId: storeId,
      title: p.title,
      handle: p.handle || null,
      productType: p.product_type || null,
      vendor: p.vendor || null,
      status: p.status || 'active',
      tags: p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags) : [],
      imageUrl: p.image?.src || null,
      description: p.body_html || null,
    },
  });

  // Sync variants
  const incomingVariants = Array.isArray(p.variants) ? p.variants : [];
  const incomingVariantIds: string[] = [];

  for (const v of incomingVariants) {
    incomingVariantIds.push(String(v.id));
    
    await prisma.shopifyProductVariant.upsert({
      where: { shopifyId: String(v.id) },
      update: {
        title: v.title,
        sku: v.sku || null,
        price: parseFloat(v.price || '0'),
        compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        inventoryQty: v.inventory_quantity ?? 0,
        inventoryPolicy: v.inventory_policy || null,
        barcode: v.barcode || null,
        weight: v.weight ? parseFloat(v.weight) : null,
        weightUnit: v.weight_unit || 'kg',
        position: v.position || null,
        imageUrl: v.image_id && p.images 
          ? p.images.find((img: any) => img.id === v.image_id)?.src 
          : null,
        updatedAt: new Date(),
      },
      create: {
        shopifyId: String(v.id),
        productId: product.id,
        title: v.title,
        sku: v.sku || null,
        price: parseFloat(v.price || '0'),
        compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        inventoryQty: v.inventory_quantity ?? 0,
        inventoryPolicy: v.inventory_policy || null,
        barcode: v.barcode || null,
        weight: v.weight ? parseFloat(v.weight) : null,
        weightUnit: v.weight_unit || 'kg',
        position: v.position || null,
        imageUrl: v.image_id && p.images 
          ? p.images.find((img: any) => img.id === v.image_id)?.src 
          : null,
      },
    });
  }

  // Remove variants that were deleted on Shopify
  if (incomingVariantIds.length > 0) {
    await prisma.shopifyProductVariant.deleteMany({
      where: { 
        productId: product.id, 
        shopifyId: { notIn: incomingVariantIds } 
      }
    });
  }

  logger.info(`Upserted product ${p.id} with ${incomingVariants.length} variants`);
}

/**
 * Handle product delete webhook
 */
async function handleProductDelete(payload: any, storeId: string) {
  const p = payload;
  const shopifyId = String(p.id);

  // Find the product
  const product = await prisma.shopifyProduct.findUnique({
    where: { shopifyId },
  });

  if (!product) {
    logger.warn(`Product ${shopifyId} not found for deletion`);
    return;
  }

  // Delete variants first (cascade should handle this, but being explicit)
  await prisma.shopifyProductVariant.deleteMany({
    where: { productId: product.id }
  });

  // Delete product (or soft delete by setting status to 'archived')
  // Using hard delete here, but you can change to soft delete if needed:
  await prisma.shopifyProduct.delete({
    where: { id: product.id }
  });

  logger.info(`Deleted product ${shopifyId} and its variants`);
}

/**
 * Handle inventory level update webhook
 * This is optional - requires inventory_levels/update webhook subscription
 */
async function handleInventoryUpdate(payload: any, storeId: string) {
  // Shopify sends inventory_item_id and available quantity
  // You'll need to map inventory_item_id to variant
  // This is a simplified example - you may need to store inventory_item_id in your variant model
  
  const inventoryItemId = String(payload.inventory_item_id);
  const available = payload.available ?? 0;

  logger.info(`Inventory update for item ${inventoryItemId}: ${available} available`);

  // TODO: Map inventory_item_id to variant and update inventory
  // For now, just log it
  // You might need to fetch the variant from Shopify API to get the mapping
}

export default router;

