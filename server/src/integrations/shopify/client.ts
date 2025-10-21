import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import { config } from '../../config';
import { logger } from '../../utils/logger';

// Initialize Shopify API only if credentials are provided
export const shopify = config.shopify.apiKey && config.shopify.apiSecret
  ? shopifyApi({
      apiKey: config.shopify.apiKey,
      apiSecretKey: config.shopify.apiSecret,
      scopes: config.shopify.scopes.split(',').filter(s => s),
      hostName: config.server.host,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
    })
  : null;

export class ShopifyClient {
  private session: Session;

  constructor(shop: string, accessToken: string) {
    this.session = new Session({
      id: `offline_${shop}`,
      shop,
      state: 'offline',
      isOnline: false,
      accessToken,
    });
  }

  async getOrders(params?: { status?: string; limit?: number; since_id?: string }) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: 'orders',
        query: params,
      });

      return response.body;
    } catch (error) {
      logger.error('Error fetching orders from Shopify:', error);
      throw error;
    }
  }

  async getOrder(orderId: string) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: `orders/${orderId}`,
      });

      return response.body;
    } catch (error) {
      logger.error(`Error fetching order ${orderId} from Shopify:`, error);
      throw error;
    }
  }

  async getProducts(params?: { limit?: number; since_id?: string }) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: 'products',
        query: params,
      });

      return response.body;
    } catch (error) {
      logger.error('Error fetching products from Shopify:', error);
      throw error;
    }
  }

  async createFulfillment(orderId: string, fulfillmentData: any) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.post({
        path: `orders/${orderId}/fulfillments`,
        data: { fulfillment: fulfillmentData },
      });

      return response.body;
    } catch (error) {
      logger.error(`Error creating fulfillment for order ${orderId}:`, error);
      throw error;
    }
  }

  async updateFulfillment(orderId: string, fulfillmentId: string, data: any) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.put({
        path: `orders/${orderId}/fulfillments/${fulfillmentId}`,
        data: { fulfillment: data },
      });

      return response.body;
    } catch (error) {
      logger.error(`Error updating fulfillment ${fulfillmentId}:`, error);
      throw error;
    }
  }

  async getInventoryLevels(locationId: string) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: 'inventory_levels',
        query: { location_ids: locationId },
      });

      return response.body;
    } catch (error) {
      logger.error('Error fetching inventory levels:', error);
      throw error;
    }
  }

  async updateInventoryLevel(inventoryItemId: string, locationId: string, available: number) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.post({
        path: 'inventory_levels/set',
        data: {
          location_id: locationId,
          inventory_item_id: inventoryItemId,
          available,
        },
      });

      return response.body;
    } catch (error) {
      logger.error('Error updating inventory level:', error);
      throw error;
    }
  }

  async createRefund(orderId: string, refundData: any) {
    try {
      if (!shopify) throw new Error('Shopify API not initialized');
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.post({
        path: `orders/${orderId}/refunds`,
        data: { refund: refundData },
      });

      return response.body;
    } catch (error) {
      logger.error(`Error creating refund for order ${orderId}:`, error);
      throw error;
    }
  }
}

export const createShopifyClient = (shop: string, accessToken: string) => {
  return new ShopifyClient(shop, accessToken);
};

