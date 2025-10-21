import { GraphQLScalarType, Kind } from 'graphql';
import { authService } from '../../services/auth.service';
import { orderService } from '../../services/order.service';
import { fulfillmentService } from '../../services/fulfillment.service';
import { inventoryService } from '../../services/inventory.service';
import { returnService } from '../../services/return.service';
import { notificationService } from '../../services/notification.service';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/error';

// Custom scalars
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      return ast;
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,

  Query: {
    // Auth
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AppError('Not authenticated', 401);
      }
      return authService.getUserById(context.user.id);
    },

    // Orders
    orders: async (_: any, { filters, limit, offset }: any) => {
      return orderService.getOrders({ ...filters, limit, offset });
    },
    order: async (_: any, { id }: any) => {
      return orderService.getOrderById(id);
    },
    orderAnalytics: async (_: any, { storeId, startDate, endDate }: any) => {
      return orderService.getOrderAnalytics(storeId, startDate, endDate);
    },

    // Fulfillments
    fulfillments: async (_: any, { filters, limit, offset }: any) => {
      return fulfillmentService.getFulfillments({ ...filters, limit, offset });
    },
    fulfillment: async (_: any, { id }: any) => {
      return fulfillmentService.getFulfillmentById(id);
    },

    // Inventory
    inventoryItems: async (_: any, { filters, limit, offset }: any) => {
      return inventoryService.getInventoryItems({ ...filters, limit, offset });
    },
    inventoryItem: async (_: any, { id }: any) => {
      return inventoryService.getInventoryItemById(id);
    },
    lowStockItems: async (_: any, { storeId }: any) => {
      return inventoryService.getLowStockItems(storeId);
    },
    reorderSuggestions: async (_: any, { storeId }: any) => {
      return inventoryService.getReorderSuggestions(storeId);
    },
    inventoryAnalytics: async (_: any, { storeId }: any) => {
      return inventoryService.getInventoryAnalytics(storeId);
    },

    // Returns
    returnRequests: async (_: any, { filters, limit, offset }: any) => {
      return returnService.getReturnRequests({ ...filters, limit, offset });
    },
    returnRequest: async (_: any, { id }: any) => {
      return returnService.getReturnRequestById(id);
    },
    returnAnalytics: async (_: any, { storeId, startDate, endDate }: any) => {
      return returnService.getReturnAnalytics({ storeId, startDate, endDate });
    },

    // Products
    products: async (_: any, { storeId, limit, offset }: any) => {
      const where: any = {};
      if (storeId) where.storeId = storeId;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            store: true,
            inventoryItems: true,
          },
          take: limit || 50,
          skip: offset || 0,
        }),
        prisma.product.count({ where }),
      ]);

      return { products, total };
    },
    product: async (_: any, { id }: any) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          store: true,
          inventoryItems: {
            include: {
              warehouse: true,
            },
          },
        },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      return product;
    },

    // Stores
    stores: async () => {
      return prisma.store.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },
    store: async (_: any, { id }: any) => {
      const store = await prisma.store.findUnique({
        where: { id },
      });

      if (!store) {
        throw new AppError('Store not found', 404);
      }

      return store;
    },

    // Notifications
    notifications: async (_: any, { filters, limit, offset }: any) => {
      return notificationService.getNotifications({ ...filters, limit, offset });
    },
  },

  Mutation: {
    // Auth
    login: async (_: any, { email, password }: any) => {
      return authService.login(email, password);
    },
    register: async (_: any, { input }: any) => {
      return authService.register(input);
    },
    changePassword: async (_: any, { currentPassword, newPassword }: any, context: any) => {
      if (!context.user) {
        throw new AppError('Not authenticated', 401);
      }
      return authService.changePassword(context.user.id, currentPassword, newPassword);
    },

    // Orders
    createOrder: async (_: any, { input }: any, context: any) => {
      const orderData = {
        storeId: input.storeId,
        orderNumber: `ORD-${Date.now()}`,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        financialStatus: 'PENDING',
        fulfillmentStatus: 'UNFULFILLED',
        orderStatus: 'PENDING',
        totalAmount: input.totalAmount,
        currency: input.currency || 'USD',
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        isManualOrder: true,
        orderItems: {
          create: input.items.map((item: any) => ({
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalAmount: item.price * item.quantity,
          })),
        },
      };

      return orderService.createOrder(orderData, context.user?.id);
    },
    updateOrder: async (_: any, { id, input }: any, context: any) => {
      return orderService.updateOrder(id, input, context.user?.id);
    },
    updateOrderStatus: async (_: any, { id, status }: any, context: any) => {
      return orderService.updateOrderStatus(id, status, context.user?.id);
    },
    cancelOrder: async (_: any, { id, reason }: any, context: any) => {
      return orderService.cancelOrder(id, reason, context.user?.id);
    },
    addOrderNote: async (_: any, { orderId, note }: any) => {
      return orderService.addOrderNote(orderId, note);
    },
    addOrderTags: async (_: any, { orderId, tags }: any) => {
      return orderService.addOrderTags(orderId, tags);
    },

    // Fulfillments
    createFulfillment: async (_: any, { input }: any, context: any) => {
      return fulfillmentService.createFulfillment({
        ...input,
        userId: context.user?.id,
      });
    },
    updateFulfillment: async (_: any, { id, input }: any) => {
      return fulfillmentService.updateFulfillment(id, input);
    },
    updateFulfillmentStatus: async (_: any, { id, status }: any, context: any) => {
      return fulfillmentService.updateFulfillmentStatus(id, status, context.user?.id);
    },
    shipFulfillment: async (_: any, { id }: any, context: any) => {
      return fulfillmentService.shipFulfillment(id, context.user?.id);
    },
    addTrackingInfo: async (_: any, { id, trackingNumber, carrier, trackingUrl }: any) => {
      return fulfillmentService.addTrackingInfo(id, trackingNumber, carrier, trackingUrl);
    },
    cancelFulfillment: async (_: any, { id, reason }: any) => {
      return fulfillmentService.cancelFulfillment(id, reason);
    },

    // Inventory
    updateInventoryQuantity: async (_: any, { id, quantity, operation }: any) => {
      const op = operation.toLowerCase();
      return inventoryService.updateInventoryQuantity(id, quantity, op);
    },
    reserveInventory: async (_: any, { productId, quantity, warehouseId }: any) => {
      return inventoryService.reserveInventory(productId, quantity, warehouseId);
    },
    releaseReservedInventory: async (_: any, { productId, quantity, warehouseId }: any) => {
      return inventoryService.releaseReservedInventory(productId, quantity, warehouseId);
    },
    setReorderPoint: async (_: any, { id, reorderPoint, reorderQuantity }: any) => {
      return inventoryService.setReorderPoint(id, reorderPoint, reorderQuantity);
    },

    // Returns
    createReturnRequest: async (_: any, { input }: any) => {
      return returnService.createReturnRequest(input);
    },
    updateReturnStatus: async (_: any, { id, status, notes }: any, context: any) => {
      return returnService.updateReturnStatus(id, status, context.user?.id, notes);
    },
    approveReturn: async (_: any, { id, refundAmount, restockFee }: any, context: any) => {
      return returnService.approveReturn(id, context.user?.id, refundAmount, restockFee);
    },
    rejectReturn: async (_: any, { id, reason }: any, context: any) => {
      return returnService.rejectReturn(id, context.user?.id, reason);
    },
    processRefund: async (_: any, { id, refundAmount, refundMethod }: any, context: any) => {
      return returnService.processRefund(id, refundAmount, refundMethod, context.user?.id);
    },
    addReturnNotes: async (_: any, { id, notes }: any) => {
      return returnService.addInternalNotes(id, notes);
    },

    // Stores
    createStore: async (_: any, { input }: any) => {
      return prisma.store.create({
        data: input,
      });
    },
    updateStore: async (_: any, { id, input }: any) => {
      return prisma.store.update({
        where: { id },
        data: input,
      });
    },
  },
};

