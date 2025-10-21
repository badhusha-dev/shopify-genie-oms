import prisma from '../utils/prisma';
import { AppError } from '../middleware/error';
import { ReturnStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export class ReturnService {
  async createReturnRequest(data: {
    orderId: string;
    reason: string;
    customerNotes?: string;
    items: Array<{ orderItemId: string; quantity: number; condition?: string }>;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Generate return number
    const returnNumber = `RMA-${Date.now()}`;

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: data.orderId,
        returnNumber,
        reason: data.reason,
        customerNotes: data.customerNotes,
        status: 'PENDING',
        returnItems: {
          create: data.items,
        },
      },
      include: {
        returnItems: {
          include: {
            orderItem: true,
          },
        },
        order: true,
      },
    });

    logger.info(`Return request created: ${returnNumber} for order ${order.orderNumber}`);
    return returnRequest;
  }

  async getReturnRequests(filters?: {
    orderId?: string;
    status?: ReturnStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          order: true,
          returnItems: {
            include: {
              orderItem: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return { returns, total };
  }

  async getReturnRequestById(id: string) {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: true,
            store: true,
          },
        },
        returnItems: {
          include: {
            orderItem: {
              include: {
                product: true,
              },
            },
          },
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!returnRequest) {
      throw new AppError('Return request not found', 404);
    }

    return returnRequest;
  }

  async updateReturnStatus(id: string, status: ReturnStatus, userId?: string, notes?: string) {
    const updateData: any = { status };

    if (status === 'APPROVED') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    if (notes) {
      updateData.internalNotes = notes;
    }

    const returnRequest = await prisma.returnRequest.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        returnItems: true,
      },
    });

    logger.info(`Return request ${returnRequest.returnNumber} status updated to ${status}`);
    return returnRequest;
  }

  async approveReturn(id: string, userId: string, refundAmount?: number, restockFee?: number) {
    const returnRequest = await this.getReturnRequestById(id);

    if (returnRequest.status !== 'PENDING') {
      throw new AppError('Return request cannot be approved in current status', 400);
    }

    const updateData: any = {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    };

    if (refundAmount !== undefined) {
      updateData.refundAmount = refundAmount;
    }

    if (restockFee !== undefined) {
      updateData.restockFee = restockFee;
    }

    return prisma.returnRequest.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        returnItems: true,
      },
    });
  }

  async rejectReturn(id: string, userId: string, reason: string) {
    const returnRequest = await this.updateReturnStatus(id, 'REJECTED', userId, reason);
    
    logger.info(`Return request ${returnRequest.returnNumber} rejected: ${reason}`);
    return returnRequest;
  }

  async processRefund(id: string, refundAmount: number, refundMethod: string, userId?: string) {
    const returnRequest = await this.getReturnRequestById(id);

    if (returnRequest.status !== 'APPROVED' && returnRequest.status !== 'RECEIVED') {
      throw new AppError('Return must be approved or received before refund', 400);
    }

    const updatedReturn = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        refundAmount,
        refundMethod,
        completedAt: new Date(),
      },
      include: {
        order: true,
      },
    });

    // Update order items to returned status
    for (const item of returnRequest.returnItems) {
      await prisma.orderItem.update({
        where: { id: item.orderItemId },
        data: { fulfillmentStatus: 'RETURNED' },
      });
    }

    logger.info(`Refund processed for return ${returnRequest.returnNumber}: ${refundAmount}`);
    return updatedReturn;
  }

  async addInternalNotes(id: string, notes: string) {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      throw new AppError('Return request not found', 404);
    }

    const updatedNotes = returnRequest.internalNotes 
      ? `${returnRequest.internalNotes}\n${notes}` 
      : notes;

    return prisma.returnRequest.update({
      where: { id },
      data: { internalNotes: updatedNotes },
    });
  }

  async getReturnAnalytics(filters?: { startDate?: Date; endDate?: Date; storeId?: string }) {
    const where: any = {};
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.storeId) {
      where.order = { storeId: filters.storeId };
    }

    const [totalReturns, returnsByStatus, totalRefundAmount] = await Promise.all([
      prisma.returnRequest.count({ where }),
      prisma.returnRequest.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.returnRequest.aggregate({
        where: {
          ...where,
          refundAmount: { not: null },
        },
        _sum: { refundAmount: true },
      }),
    ]);

    return {
      totalReturns,
      returnsByStatus,
      totalRefundAmount: totalRefundAmount._sum.refundAmount || 0,
    };
  }
}

export const returnService = new ReturnService();

