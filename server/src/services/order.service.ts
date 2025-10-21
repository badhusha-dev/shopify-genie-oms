import prisma from '../utils/prisma';
import { AppError } from '../middleware/error';
import { OrderStatus, FinancialStatus, OrderFulfillmentStatus, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

export class OrderService {
  async createOrder(data: any, userId?: string) {
    const order = await prisma.order.create({
      data: {
        ...data,
        processedBy: userId,
      },
      include: {
        orderItems: true,
        store: true,
      },
    });

    logger.info(`Order created: ${order.orderNumber}`);
    return order;
  }

  async getOrders(filters?: {
    storeId?: string;
    status?: OrderStatus;
    fulfillmentStatus?: OrderFulfillmentStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.status) where.orderStatus = filters.status;
    if (filters?.fulfillmentStatus) where.fulfillmentStatus = filters.fulfillmentStatus;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          store: true,
          fulfillments: true,
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
            fulfillmentItems: true,
          },
        },
        store: true,
        fulfillments: {
          include: {
            warehouse: true,
          },
        },
        returnRequests: {
          include: {
            returnItems: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async updateOrder(id: string, data: Partial<any>, userId?: string) {
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...data,
        processedBy: userId,
        processedAt: new Date(),
      },
      include: {
        orderItems: true,
        fulfillments: true,
      },
    });

    logger.info(`Order updated: ${order.orderNumber}`);
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus, userId?: string) {
    return this.updateOrder(id, { orderStatus: status }, userId);
  }

  async cancelOrder(id: string, reason: string, userId?: string) {
    const order = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
        processedBy: userId,
      },
    });

    logger.info(`Order cancelled: ${order.orderNumber}`);
    return order;
  }

  async addOrderNote(orderId: string, note: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updatedNotes = order.notes ? `${order.notes}\n${note}` : note;

    return prisma.order.update({
      where: { id: orderId },
      data: { notes: updatedNotes },
    });
  }

  async addOrderTags(orderId: string, tags: string[]) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updatedTags = [...new Set([...order.tags, ...tags])];

    return prisma.order.update({
      where: { id: orderId },
      data: { tags: updatedTags },
    });
  }

  async syncOrderFromShopify(storeId: string, shopifyOrder: any) {
    const existingOrder = await prisma.order.findUnique({
      where: { shopifyOrderId: shopifyOrder.id.toString() },
    });

    if (existingOrder) {
      return this.updateOrderFromShopify(existingOrder.id, shopifyOrder);
    }

    // Map Shopify order to our schema
    const orderData = {
      shopifyOrderId: shopifyOrder.id.toString(),
      orderNumber: shopifyOrder.order_number.toString(),
      storeId,
      customerId: shopifyOrder.customer?.id?.toString(),
      customerName: shopifyOrder.customer
        ? `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`
        : 'Guest',
      customerEmail: shopifyOrder.customer?.email || shopifyOrder.email,
      customerPhone: shopifyOrder.customer?.phone,
      financialStatus: this.mapFinancialStatus(shopifyOrder.financial_status),
      fulfillmentStatus: this.mapFulfillmentStatus(shopifyOrder.fulfillment_status),
      orderStatus: 'PENDING' as OrderStatus,
      totalAmount: parseFloat(shopifyOrder.total_price),
      currency: shopifyOrder.currency,
      taxAmount: parseFloat(shopifyOrder.total_tax || '0'),
      shippingAmount: parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || '0'),
      discountAmount: parseFloat(shopifyOrder.total_discounts || '0'),
      tags: shopifyOrder.tags ? shopifyOrder.tags.split(',').map((t: string) => t.trim()) : [],
      shippingAddress: shopifyOrder.shipping_address,
      billingAddress: shopifyOrder.billing_address,
      orderItems: {
        create: shopifyOrder.line_items.map((item: any) => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: parseFloat(item.price),
          totalAmount: parseFloat(item.price) * item.quantity,
          taxAmount: parseFloat(item.total_tax || '0'),
          discountAmount: parseFloat(item.total_discount || '0'),
        })),
      },
    };

    const order = await prisma.order.create({
      data: orderData,
      include: {
        orderItems: true,
      },
    });

    logger.info(`Order synced from Shopify: ${order.orderNumber}`);
    return order;
  }

  async updateOrderFromShopify(orderId: string, shopifyOrder: any) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        financialStatus: this.mapFinancialStatus(shopifyOrder.financial_status),
        fulfillmentStatus: this.mapFulfillmentStatus(shopifyOrder.fulfillment_status),
        totalAmount: parseFloat(shopifyOrder.total_price),
        taxAmount: parseFloat(shopifyOrder.total_tax || '0'),
        shippingAmount: parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || '0'),
        discountAmount: parseFloat(shopifyOrder.total_discounts || '0'),
      },
    });

    logger.info(`Order updated from Shopify: ${order.orderNumber}`);
    return order;
  }

  private mapFinancialStatus(status: string): FinancialStatus {
    const statusMap: { [key: string]: FinancialStatus } = {
      pending: 'PENDING',
      authorized: 'AUTHORIZED',
      partially_paid: 'PARTIALLY_PAID',
      paid: 'PAID',
      partially_refunded: 'PARTIALLY_REFUNDED',
      refunded: 'REFUNDED',
      voided: 'VOIDED',
    };
    return statusMap[status] || 'PENDING';
  }

  private mapFulfillmentStatus(status: string | null): OrderFulfillmentStatus {
    if (!status || status === 'unfulfilled') return 'UNFULFILLED';
    if (status === 'fulfilled') return 'FULFILLED';
    if (status === 'partial') return 'PARTIALLY_FULFILLED';
    return 'UNFULFILLED';
  }

  async getOrderAnalytics(storeId?: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (storeId) where.storeId = storeId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalOrders, totalRevenue, avgOrderValue, ordersByStatus] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where,
        _avg: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ['orderStatus'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      avgOrderValue: avgOrderValue._avg.totalAmount || 0,
      ordersByStatus,
    };
  }
}

export const orderService = new OrderService();

