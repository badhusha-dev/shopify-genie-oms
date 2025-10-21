import nodemailer from 'nodemailer';
import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import prisma from '../utils/prisma';
import { NotificationType, NotificationChannel, NotificationStatus } from '@prisma/client';

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendNotification(data: {
    type: NotificationType;
    channel: NotificationChannel;
    recipient: string;
    subject?: string;
    message: string;
    metadata?: any;
  }) {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        channel: data.channel,
        recipient: data.recipient,
        subject: data.subject,
        message: data.message,
        metadata: data.metadata,
        status: 'PENDING',
      },
    });

    try {
      switch (data.channel) {
        case 'EMAIL':
          await this.sendEmail(data.recipient, data.subject || '', data.message);
          break;
        case 'SLACK':
          await this.sendSlack(data.message, data.metadata);
          break;
        case 'WHATSAPP':
          await this.sendWhatsApp(data.recipient, data.message);
          break;
        default:
          throw new Error(`Unsupported notification channel: ${data.channel}`);
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      logger.info(`Notification sent via ${data.channel} to ${data.recipient}`);
      return { success: true, notificationId: notification.id };
    } catch (error) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      logger.error(`Failed to send notification via ${data.channel}:`, error);
      throw error;
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!config.email.host) {
      logger.warn('Email configuration not set, skipping email send');
      return;
    }

    try {
      await this.emailTransporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  private async sendSlack(message: string, metadata?: any) {
    if (!config.slack.webhookUrl) {
      logger.warn('Slack webhook URL not configured, skipping Slack notification');
      return;
    }

    try {
      await axios.post(config.slack.webhookUrl, {
        text: message,
        ...metadata,
      });
    } catch (error) {
      logger.error('Error sending Slack notification:', error);
      throw error;
    }
  }

  private async sendWhatsApp(to: string, message: string) {
    if (!config.whatsapp.apiUrl || !config.whatsapp.apiKey) {
      logger.warn('WhatsApp configuration not set, skipping WhatsApp send');
      return;
    }

    try {
      await axios.post(
        config.whatsapp.apiUrl,
        {
          to,
          message,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.whatsapp.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async notifyOrderCreated(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) return;

    const message = `
      <h2>New Order Received</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Total:</strong> ${order.currency} ${order.totalAmount}</p>
      <p><strong>Items:</strong> ${order.orderItems.length}</p>
    `;

    if (order.customerEmail) {
      await this.sendNotification({
        type: 'ORDER_CREATED',
        channel: 'EMAIL',
        recipient: order.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        message,
        metadata: { orderId: order.id },
      });
    }

    // Send to Slack for internal notification
    if (config.slack.webhookUrl) {
      await this.sendNotification({
        type: 'ORDER_CREATED',
        channel: 'SLACK',
        recipient: 'orders',
        message: `New order ${order.orderNumber} from ${order.customerName} - ${order.currency} ${order.totalAmount}`,
        metadata: { orderId: order.id },
      });
    }
  }

  async notifyOrderShipped(orderId: string, trackingNumber: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || !order.customerEmail) return;

    const message = `
      <h2>Your Order Has Been Shipped!</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p>Your order is on its way and should arrive soon.</p>
    `;

    await this.sendNotification({
      type: 'ORDER_SHIPPED',
      channel: 'EMAIL',
      recipient: order.customerEmail,
      subject: `Order Shipped - ${order.orderNumber}`,
      message,
      metadata: { orderId: order.id, trackingNumber },
    });
  }

  async notifyLowStock(productId: string, currentStock: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return;

    const message = `⚠️ Low Stock Alert: ${product.name} (SKU: ${product.sku}) - Current stock: ${currentStock}`;

    if (config.slack.webhookUrl) {
      await this.sendNotification({
        type: 'INVENTORY_LOW',
        channel: 'SLACK',
        recipient: 'inventory',
        message,
        metadata: { productId, currentStock },
      });
    }
  }

  async notifyReturnRequested(returnId: string) {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: true },
    });

    if (!returnRequest) return;

    const message = `New return request ${returnRequest.returnNumber} for order ${returnRequest.order.orderNumber}`;

    if (config.slack.webhookUrl) {
      await this.sendNotification({
        type: 'RETURN_REQUESTED',
        channel: 'SLACK',
        recipient: 'returns',
        message,
        metadata: { returnId, orderId: returnRequest.orderId },
      });
    }
  }

  async getNotifications(filters?: {
    status?: NotificationStatus;
    type?: NotificationType;
    channel?: NotificationChannel;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.channel) where.channel = filters.channel;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }
}

export const notificationService = new NotificationService();

