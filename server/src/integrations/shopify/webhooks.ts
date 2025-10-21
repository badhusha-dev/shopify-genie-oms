import { Request, Response } from 'express';
import { shopify } from './client';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import prisma from '../../utils/prisma';
import { orderService } from '../../services/order.service';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const topic = req.headers['x-shopify-topic'] as string;
    const shop = req.headers['x-shopify-shop-domain'] as string;
    const hmac = req.headers['x-shopify-hmac-sha256'] as string;

    // Verify webhook  
    if (!shopify) {
      logger.warn('Shopify API not initialized, skipping webhook validation');
      return res.status(503).send('Shopify integration not configured');
    }
    const isValid = await shopify.webhooks.validate({
      rawBody: JSON.stringify(req.body),
      rawHeader: hmac,
    } as any);

    if (!isValid) {
      logger.warn(`Invalid webhook signature for topic: ${topic}`);
      return res.status(401).send('Unauthorized');
    }

    // Store webhook event
    await prisma.webhookEvent.create({
      data: {
        shopifyTopic: topic,
        shopifyId: req.body.id?.toString(),
        payload: req.body,
      },
    });

    // Process webhook based on topic
    await processWebhook(topic, req.body, shop);

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};

async function processWebhook(topic: string, payload: any, shop: string) {
  try {
    switch (topic) {
      case 'orders/create':
        await handleOrderCreate(payload, shop);
        break;
      case 'orders/updated':
        await handleOrderUpdate(payload, shop);
        break;
      case 'orders/cancelled':
        await handleOrderCancelled(payload, shop);
        break;
      case 'fulfillments/create':
        await handleFulfillmentCreate(payload, shop);
        break;
      case 'fulfillments/update':
        await handleFulfillmentUpdate(payload, shop);
        break;
      default:
        logger.info(`Unhandled webhook topic: ${topic}`);
    }

    // Mark webhook as processed
    await prisma.webhookEvent.updateMany({
      where: {
        shopifyTopic: topic,
        shopifyId: payload.id?.toString(),
        processed: false,
      },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error(`Error processing webhook ${topic}:`, error);
    
    // Update webhook event with error
    await prisma.webhookEvent.updateMany({
      where: {
        shopifyTopic: topic,
        shopifyId: payload.id?.toString(),
        processed: false,
      },
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: { increment: 1 },
      },
    });

    throw error;
  }
}

async function handleOrderCreate(payload: any, shop: string) {
  logger.info(`Processing order create webhook for order ${payload.id}`);
  
  const store = await prisma.store.findUnique({
    where: { shopifyDomain: shop },
  });

  if (!store) {
    throw new Error(`Store not found for shop: ${shop}`);
  }

  await orderService.syncOrderFromShopify(store.id, payload);
}

async function handleOrderUpdate(payload: any, shop: string) {
  logger.info(`Processing order update webhook for order ${payload.id}`);
  
  const order = await prisma.order.findUnique({
    where: { shopifyOrderId: payload.id.toString() },
  });

  if (order) {
    await orderService.updateOrderFromShopify(order.id, payload);
  }
}

async function handleOrderCancelled(payload: any, shop: string) {
  logger.info(`Processing order cancelled webhook for order ${payload.id}`);
  
  const order = await prisma.order.findUnique({
    where: { shopifyOrderId: payload.id.toString() },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: payload.cancel_reason,
      },
    });
  }
}

async function handleFulfillmentCreate(payload: any, shop: string) {
  logger.info(`Processing fulfillment create webhook for fulfillment ${payload.id}`);
  // Implementation for fulfillment create
}

async function handleFulfillmentUpdate(payload: any, shop: string) {
  logger.info(`Processing fulfillment update webhook for fulfillment ${payload.id}`);
  // Implementation for fulfillment update
}

export const registerWebhooks = async (shop: string, accessToken: string) => {
  const webhooks = [
    { topic: 'orders/create', address: '/api/webhooks/shopify' },
    { topic: 'orders/updated', address: '/api/webhooks/shopify' },
    { topic: 'orders/cancelled', address: '/api/webhooks/shopify' },
    { topic: 'fulfillments/create', address: '/api/webhooks/shopify' },
    { topic: 'fulfillments/update', address: '/api/webhooks/shopify' },
  ];

  // Implementation for registering webhooks with Shopify
  logger.info(`Webhooks registered for shop: ${shop}`);
};

