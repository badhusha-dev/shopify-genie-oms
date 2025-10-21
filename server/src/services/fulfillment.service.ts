import prisma from '../utils/prisma';
import { AppError } from '../middleware/error';
import { FulfillmentStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { createShopifyClient } from '../integrations/shopify/client';

export class FulfillmentService {
  async createFulfillment(data: {
    orderId: string;
    warehouseId?: string;
    trackingNumber?: string;
    carrier?: string;
    shippingMethod?: string;
    userId?: string;
    items: Array<{ orderItemId: string; quantity: number }>;
  }) {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        orderItems: true,
        store: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Create fulfillment
    const fulfillment = await prisma.fulfillment.create({
      data: {
        orderId: data.orderId,
        warehouseId: data.warehouseId,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        shippingMethod: data.shippingMethod,
        status: 'PENDING',
        fulfilledBy: data.userId,
        fulfillmentItems: {
          create: data.items,
        },
      },
      include: {
        fulfillmentItems: {
          include: {
            orderItem: true,
          },
        },
      },
    });

    // Update order fulfillment status
    await this.updateOrderFulfillmentStatus(data.orderId);

    logger.info(`Fulfillment created for order ${order.orderNumber}`);
    return fulfillment;
  }

  async getFulfillments(filters?: {
    orderId?: string;
    status?: FulfillmentStatus;
    warehouseId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.status) where.status = filters.status;
    if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [fulfillments, total] = await Promise.all([
      prisma.fulfillment.findMany({
        where,
        include: {
          order: true,
          warehouse: true,
          fulfillmentItems: {
            include: {
              orderItem: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.fulfillment.count({ where }),
    ]);

    return { fulfillments, total };
  }

  async getFulfillmentById(id: string) {
    const fulfillment = await prisma.fulfillment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            store: true,
          },
        },
        warehouse: true,
        fulfillmentItems: {
          include: {
            orderItem: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!fulfillment) {
      throw new AppError('Fulfillment not found', 404);
    }

    return fulfillment;
  }

  async updateFulfillment(id: string, data: Partial<any>) {
    const fulfillment = await prisma.fulfillment.update({
      where: { id },
      data,
      include: {
        order: true,
        fulfillmentItems: true,
      },
    });

    // Update order fulfillment status
    await this.updateOrderFulfillmentStatus(fulfillment.orderId);

    logger.info(`Fulfillment updated: ${id}`);
    return fulfillment;
  }

  async updateFulfillmentStatus(id: string, status: FulfillmentStatus, userId?: string) {
    const updateData: any = { status };

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
      updateData.actualDelivery = new Date();
    }

    const fulfillment = await this.updateFulfillment(id, updateData);

    // Update order status based on fulfillment
    if (status === 'SHIPPED') {
      await prisma.order.update({
        where: { id: fulfillment.orderId },
        data: { orderStatus: 'SHIPPED' },
      });
    } else if (status === 'DELIVERED') {
      await prisma.order.update({
        where: { id: fulfillment.orderId },
        data: { orderStatus: 'DELIVERED' },
      });
    }

    return fulfillment;
  }

  async addTrackingInfo(id: string, trackingNumber: string, carrier: string, trackingUrl?: string) {
    return this.updateFulfillment(id, {
      trackingNumber,
      carrier,
      trackingUrl,
    });
  }

  async shipFulfillment(id: string, userId?: string) {
    const fulfillment = await this.getFulfillmentById(id);

    if (!fulfillment.trackingNumber) {
      throw new AppError('Cannot ship fulfillment without tracking number', 400);
    }

    // Sync with Shopify if order has shopifyOrderId
    if (fulfillment.order.shopifyOrderId && fulfillment.order.store) {
      const shopifyClient = createShopifyClient(
        fulfillment.order.store.shopifyDomain,
        fulfillment.order.store.accessToken
      );

      const shopifyFulfillment = await shopifyClient.createFulfillment(
        fulfillment.order.shopifyOrderId,
        {
          tracking_number: fulfillment.trackingNumber,
          tracking_company: fulfillment.carrier,
          notify_customer: true,
        }
      );

      await this.updateFulfillment(id, {
        shopifyFulfillmentId: shopifyFulfillment.id,
      });
    }

    return this.updateFulfillmentStatus(id, 'SHIPPED', userId);
  }

  async cancelFulfillment(id: string, reason?: string) {
    const fulfillment = await this.updateFulfillmentStatus(id, 'CANCELLED');
    
    logger.info(`Fulfillment cancelled: ${id}${reason ? ` - ${reason}` : ''}`);
    return fulfillment;
  }

  private async updateOrderFulfillmentStatus(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        fulfillments: {
          include: {
            fulfillmentItems: true,
          },
        },
      },
    });

    if (!order) return;

    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const fulfilledItems = order.fulfillments
      .filter(f => f.status === 'SHIPPED' || f.status === 'DELIVERED')
      .reduce((sum, f) => {
        return sum + f.fulfillmentItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);

    let fulfillmentStatus;
    if (fulfilledItems === 0) {
      fulfillmentStatus = 'UNFULFILLED';
    } else if (fulfilledItems >= totalItems) {
      fulfillmentStatus = 'FULFILLED';
    } else {
      fulfillmentStatus = 'PARTIALLY_FULFILLED';
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: fulfillmentStatus as any },
    });
  }

  async getFulfillmentAnalytics(filters?: { startDate?: Date; endDate?: Date; warehouseId?: string }) {
    const where: any = {};
    
    if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [totalFulfillments, fulfillmentsByStatus, avgProcessingTime] = await Promise.all([
      prisma.fulfillment.count({ where }),
      prisma.fulfillment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      // TODO: Calculate average time between creation and shipping
      Promise.resolve({}),
    ]);

    return {
      totalFulfillments,
      fulfillmentsByStatus,
    };
  }
}

export const fulfillmentService = new FulfillmentService();

