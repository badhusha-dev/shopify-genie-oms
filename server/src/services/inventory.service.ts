import prisma from '../utils/prisma';
import { AppError } from '../middleware/error';
import { logger } from '../utils/logger';

export class InventoryService {
  async getInventoryItems(filters?: {
    productId?: string;
    storeId?: string;
    warehouseId?: string;
    lowStock?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.productId) where.productId = filters.productId;
    if (filters?.storeId) where.storeId = filters.storeId;
    if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
    
    if (filters?.lowStock) {
      where.AND = [
        { reorderPoint: { not: null } },
        { availableQuantity: { lte: prisma.inventoryItem.fields.reorderPoint } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          product: true,
          warehouse: true,
          store: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return { items, total };
  }

  async getInventoryItemById(id: string) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        store: true,
      },
    });

    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    return item;
  }

  async updateInventoryQuantity(id: string, quantity: number, operation: 'set' | 'add' | 'subtract' = 'set') {
    const item = await this.getInventoryItemById(id);

    let newQuantity = quantity;
    if (operation === 'add') {
      newQuantity = item.quantity + quantity;
    } else if (operation === 'subtract') {
      newQuantity = item.quantity - quantity;
      if (newQuantity < 0) {
        throw new AppError('Insufficient inventory quantity', 400);
      }
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity: newQuantity,
        availableQuantity: newQuantity - item.reservedQuantity,
        lastRestockedAt: operation === 'add' ? new Date() : item.lastRestockedAt,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    logger.info(`Inventory updated for product ${item.product.sku}: ${item.quantity} -> ${newQuantity}`);
    return updatedItem;
  }

  async reserveInventory(productId: string, quantity: number, warehouseId?: string) {
    const where: any = { productId };
    if (warehouseId) where.warehouseId = warehouseId;

    const item = await prisma.inventoryItem.findFirst({ where });

    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    if (item.availableQuantity < quantity) {
      throw new AppError('Insufficient available inventory', 400);
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        reservedQuantity: item.reservedQuantity + quantity,
        availableQuantity: item.availableQuantity - quantity,
      },
    });

    logger.info(`Reserved ${quantity} units of product ${productId}`);
    return updatedItem;
  }

  async releaseReservedInventory(productId: string, quantity: number, warehouseId?: string) {
    const where: any = { productId };
    if (warehouseId) where.warehouseId = warehouseId;

    const item = await prisma.inventoryItem.findFirst({ where });

    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        reservedQuantity: Math.max(0, item.reservedQuantity - quantity),
        availableQuantity: Math.min(item.quantity, item.availableQuantity + quantity),
      },
    });

    logger.info(`Released ${quantity} reserved units of product ${productId}`);
    return updatedItem;
  }

  async setReorderPoint(id: string, reorderPoint: number, reorderQuantity: number) {
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        reorderPoint,
        reorderQuantity,
      },
    });

    logger.info(`Reorder point set for inventory item ${id}: ${reorderPoint} / ${reorderQuantity}`);
    return item;
  }

  async getLowStockItems(storeId?: string) {
    const where: any = {
      reorderPoint: { not: null },
    };

    if (storeId) where.storeId = storeId;

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
    });

    // Filter items where available quantity is at or below reorder point
    const lowStockItems = items.filter(
      item => item.reorderPoint && item.availableQuantity <= item.reorderPoint
    );

    return lowStockItems;
  }

  async getReorderSuggestions(storeId?: string) {
    const lowStockItems = await this.getLowStockItems(storeId);

    return lowStockItems.map(item => ({
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      currentQuantity: item.availableQuantity,
      reorderPoint: item.reorderPoint,
      suggestedOrderQuantity: item.reorderQuantity || 0,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse?.name,
    }));
  }

  async syncInventoryWithShopify(storeId: string) {
    // Implementation for syncing inventory with Shopify
    logger.info(`Syncing inventory for store ${storeId}`);
    // This would use the Shopify client to sync inventory levels
    return { success: true };
  }

  async getInventoryAnalytics(storeId?: string) {
    const where: any = {};
    if (storeId) where.storeId = storeId;

    const [totalItems, totalQuantity, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.aggregate({
        where,
        _sum: { quantity: true, availableQuantity: true, reservedQuantity: true },
      }),
      prisma.inventoryItem.count({
        where: {
          ...where,
          reorderPoint: { not: null },
          availableQuantity: { lte: prisma.inventoryItem.fields.reorderPoint },
        },
      }),
      prisma.inventoryItem.count({
        where: {
          ...where,
          availableQuantity: 0,
        },
      }),
    ]);

    return {
      totalItems,
      totalQuantity: totalQuantity._sum.quantity || 0,
      totalAvailable: totalQuantity._sum.availableQuantity || 0,
      totalReserved: totalQuantity._sum.reservedQuantity || 0,
      lowStockCount,
      outOfStockCount,
    };
  }
}

export const inventoryService = new InventoryService();

