import { Router, Response } from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import prisma from '../utils/prisma';
import { decryptToken } from '../utils/shopify';
import { logger } from '../utils/logger';
import axios from 'axios';

const router = Router();

/**
 * POST /api/admin/webhooks/register
 * Register Shopify webhooks for a store
 * 
 * Body: { storeId: string }
 * 
 * Registers these webhooks:
 * - products/create
 * - products/update
 * - products/delete
 */
router.post('/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Store ID is required' 
      });
    }

    // Find store
    const store = await prisma.store.findUnique({ 
      where: { id: storeId } 
    });

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    // Decrypt token
    const token = decryptToken(store.encryptedToken);
    const shop = store.shopifyDomain;

    // Webhook base URL (must be publicly accessible HTTPS)
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3001';
    
    if (!webhookBaseUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
      logger.warn('Webhook URL should be HTTPS in production');
    }

    // Topics to register
    const topics = [
      'products/create',
      'products/update',
      'products/delete',
      // Uncomment if you want inventory updates
      // 'inventory_levels/update',
    ];

    const created: any[] = [];
    const errors: any[] = [];

    for (const topic of topics) {
      try {
        const payload = {
          webhook: {
            topic,
            address: `${webhookBaseUrl}/api/shopify/webhooks/${topic}`,
            format: 'json',
          }
        };

        const url = `https://${shop}/admin/api/2024-10/webhooks.json`;
        
        logger.info(`Registering webhook: ${topic} for store ${shop}`);
        
        const response = await axios.post(url, payload, {
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
          },
        });

        created.push({
          topic,
          id: response.data.webhook.id,
          address: response.data.webhook.address,
        });

        logger.info(`Successfully registered webhook: ${topic} (ID: ${response.data.webhook.id})`);
      } catch (err: any) {
        logger.error(`Failed to register webhook ${topic}:`, err.response?.data || err.message);
        errors.push({
          topic,
          error: err.response?.data || err.message,
        });
      }
    }

    return res.json({
      success: true,
      message: `Registered ${created.length} webhook(s) for store ${store.name}`,
      data: {
        created,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err: any) {
    logger.error('Error registering webhooks:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to register webhooks', 
      error: err.message 
    });
  }
});

/**
 * GET /api/admin/webhooks/list/:storeId
 * List all registered webhooks for a store
 */
router.get('/list/:storeId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ 
      where: { id: storeId } 
    });

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    const token = decryptToken(store.encryptedToken);
    const shop = store.shopifyDomain;

    const url = `https://${shop}/admin/api/2024-10/webhooks.json`;
    
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const webhooks = response.data.webhooks;

    return res.json({
      success: true,
      count: webhooks.length,
      data: webhooks.map((wh: any) => ({
        id: wh.id,
        topic: wh.topic,
        address: wh.address,
        format: wh.format,
        createdAt: wh.created_at,
        updatedAt: wh.updated_at,
      })),
    });
  } catch (err: any) {
    logger.error('Error listing webhooks:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to list webhooks', 
      error: err.response?.data || err.message 
    });
  }
});

/**
 * DELETE /api/admin/webhooks/:storeId/:webhookId
 * Delete a specific webhook
 */
router.delete('/:storeId/:webhookId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, webhookId } = req.params;

    const store = await prisma.store.findUnique({ 
      where: { id: storeId } 
    });

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    const token = decryptToken(store.encryptedToken);
    const shop = store.shopifyDomain;

    const url = `https://${shop}/admin/api/2024-10/webhooks/${webhookId}.json`;
    
    await axios.delete(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    logger.info(`Deleted webhook ${webhookId} for store ${shop}`);

    return res.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (err: any) {
    logger.error('Error deleting webhook:', err);
    
    if (err.response?.status === 404) {
      return res.status(404).json({ 
        success: false, 
        message: 'Webhook not found' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete webhook', 
      error: err.response?.data || err.message 
    });
  }
});

/**
 * DELETE /api/admin/webhooks/unregister/:storeId
 * Unregister all webhooks for a store
 */
router.delete('/unregister/:storeId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ 
      where: { id: storeId } 
    });

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    const token = decryptToken(store.encryptedToken);
    const shop = store.shopifyDomain;

    // Get all webhooks
    const listUrl = `https://${shop}/admin/api/2024-10/webhooks.json`;
    const response = await axios.get(listUrl, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const webhooks = response.data.webhooks;
    const deleted: number[] = [];
    const errors: any[] = [];

    // Delete each webhook
    for (const webhook of webhooks) {
      try {
        const deleteUrl = `https://${shop}/admin/api/2024-10/webhooks/${webhook.id}.json`;
        await axios.delete(deleteUrl, {
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
          },
        });
        deleted.push(webhook.id);
        logger.info(`Deleted webhook ${webhook.id} (${webhook.topic})`);
      } catch (err: any) {
        logger.error(`Failed to delete webhook ${webhook.id}:`, err.message);
        errors.push({
          id: webhook.id,
          topic: webhook.topic,
          error: err.message,
        });
      }
    }

    return res.json({
      success: true,
      message: `Deleted ${deleted.length} webhook(s)`,
      data: {
        deleted,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err: any) {
    logger.error('Error unregistering webhooks:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to unregister webhooks', 
      error: err.response?.data || err.message 
    });
  }
});

/**
 * GET /api/admin/webhooks/test/:storeId
 * Test webhook connectivity
 */
router.get('/test/:storeId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ 
      where: { id: storeId } 
    });

    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }

    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3001';

    return res.json({
      success: true,
      data: {
        storeId: store.id,
        storeName: store.name,
        shopDomain: store.shopifyDomain,
        webhookBaseUrl,
        expectedWebhookUrl: `${webhookBaseUrl}/api/shopify/webhooks/:topic`,
        isHttps: webhookBaseUrl.startsWith('https://'),
        warning: !webhookBaseUrl.startsWith('https://') && process.env.NODE_ENV === 'production' 
          ? 'Webhook URL should be HTTPS in production' 
          : null,
      },
    });
  } catch (err: any) {
    logger.error('Error testing webhooks:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to test webhooks', 
      error: err.message 
    });
  }
});

export default router;

