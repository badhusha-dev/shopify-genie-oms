import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type Query {
    # Auth
    me: User!
    
    # Orders
    orders(filters: OrderFilters, limit: Int, offset: Int): OrdersResponse!
    order(id: ID!): Order!
    orderAnalytics(storeId: ID, startDate: DateTime, endDate: DateTime): OrderAnalytics!
    
    # Fulfillments
    fulfillments(filters: FulfillmentFilters, limit: Int, offset: Int): FulfillmentsResponse!
    fulfillment(id: ID!): Fulfillment!
    
    # Inventory
    inventoryItems(filters: InventoryFilters, limit: Int, offset: Int): InventoryItemsResponse!
    inventoryItem(id: ID!): InventoryItem!
    lowStockItems(storeId: ID): [InventoryItem!]!
    reorderSuggestions(storeId: ID): [ReorderSuggestion!]!
    inventoryAnalytics(storeId: ID): InventoryAnalytics!
    
    # Returns
    returnRequests(filters: ReturnFilters, limit: Int, offset: Int): ReturnRequestsResponse!
    returnRequest(id: ID!): ReturnRequest!
    returnAnalytics(storeId: ID, startDate: DateTime, endDate: DateTime): ReturnAnalytics!
    
    # Products
    products(storeId: ID, limit: Int, offset: Int): ProductsResponse!
    product(id: ID!): Product!
    
    # Stores
    stores: [Store!]!
    store(id: ID!): Store!
    
    # Notifications
    notifications(filters: NotificationFilters, limit: Int, offset: Int): NotificationsResponse!
  }

  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthResponse!
    register(input: RegisterInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): SuccessResponse!
    
    # Orders
    createOrder(input: CreateOrderInput!): Order!
    updateOrder(id: ID!, input: UpdateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    cancelOrder(id: ID!, reason: String!): Order!
    addOrderNote(orderId: ID!, note: String!): Order!
    addOrderTags(orderId: ID!, tags: [String!]!): Order!
    syncOrderFromShopify(storeId: ID!, shopifyOrderId: String!): Order!
    
    # Fulfillments
    createFulfillment(input: CreateFulfillmentInput!): Fulfillment!
    updateFulfillment(id: ID!, input: UpdateFulfillmentInput!): Fulfillment!
    updateFulfillmentStatus(id: ID!, status: FulfillmentStatus!): Fulfillment!
    shipFulfillment(id: ID!): Fulfillment!
    addTrackingInfo(id: ID!, trackingNumber: String!, carrier: String!, trackingUrl: String): Fulfillment!
    cancelFulfillment(id: ID!, reason: String): Fulfillment!
    
    # Inventory
    updateInventoryQuantity(id: ID!, quantity: Int!, operation: InventoryOperation!): InventoryItem!
    reserveInventory(productId: ID!, quantity: Int!, warehouseId: ID): InventoryItem!
    releaseReservedInventory(productId: ID!, quantity: Int!, warehouseId: ID): InventoryItem!
    setReorderPoint(id: ID!, reorderPoint: Int!, reorderQuantity: Int!): InventoryItem!
    
    # Returns
    createReturnRequest(input: CreateReturnInput!): ReturnRequest!
    updateReturnStatus(id: ID!, status: ReturnStatus!, notes: String): ReturnRequest!
    approveReturn(id: ID!, refundAmount: Float, restockFee: Float): ReturnRequest!
    rejectReturn(id: ID!, reason: String!): ReturnRequest!
    processRefund(id: ID!, refundAmount: Float!, refundMethod: String!): ReturnRequest!
    addReturnNotes(id: ID!, notes: String!): ReturnRequest!
    
    # Stores
    createStore(input: CreateStoreInput!): Store!
    updateStore(id: ID!, input: UpdateStoreInput!): Store!
  }

  # Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    isActive: Boolean!
    createdAt: DateTime!
  }

  enum UserRole {
    ADMIN
    MANAGER
    FULFILLMENT
    SUPPORT
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Order {
    id: ID!
    shopifyOrderId: String
    orderNumber: String!
    storeId: String!
    customerId: String
    customerName: String!
    customerEmail: String
    customerPhone: String
    financialStatus: FinancialStatus!
    fulfillmentStatus: OrderFulfillmentStatus!
    orderStatus: OrderStatus!
    totalAmount: Float!
    currency: String!
    taxAmount: Float
    shippingAmount: Float
    discountAmount: Float
    tags: [String!]!
    notes: String
    shippingAddress: JSON
    billingAddress: JSON
    isManualOrder: Boolean!
    cancelledAt: DateTime
    cancelReason: String
    processedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    store: Store!
    orderItems: [OrderItem!]!
    fulfillments: [Fulfillment!]!
    returnRequests: [ReturnRequest!]!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    productId: String
    sku: String
    name: String!
    quantity: Int!
    price: Float!
    totalAmount: Float!
    taxAmount: Float
    discountAmount: Float
    fulfillmentStatus: OrderItemFulfillmentStatus!
    product: Product
  }

  enum FinancialStatus {
    PENDING
    AUTHORIZED
    PARTIALLY_PAID
    PAID
    PARTIALLY_REFUNDED
    REFUNDED
    VOIDED
  }

  enum OrderFulfillmentStatus {
    UNFULFILLED
    PARTIALLY_FULFILLED
    FULFILLED
    SCHEDULED
  }

  enum OrderStatus {
    PENDING
    PROCESSED
    SHIPPED
    DELIVERED
    CANCELLED
    ON_HOLD
  }

  enum OrderItemFulfillmentStatus {
    UNFULFILLED
    FULFILLED
    RETURNED
  }

  type Fulfillment {
    id: ID!
    shopifyFulfillmentId: String
    orderId: String!
    warehouseId: String
    status: FulfillmentStatus!
    trackingNumber: String
    trackingUrl: String
    carrier: String
    shippingMethod: String
    shippingLabel: String
    estimatedDelivery: DateTime
    actualDelivery: DateTime
    shippedAt: DateTime
    deliveredAt: DateTime
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    order: Order!
    warehouse: Warehouse
    fulfillmentItems: [FulfillmentItem!]!
  }

  type FulfillmentItem {
    id: ID!
    fulfillmentId: String!
    orderItemId: String!
    quantity: Int!
    orderItem: OrderItem!
  }

  enum FulfillmentStatus {
    PENDING
    PROCESSING
    READY_TO_SHIP
    SHIPPED
    IN_TRANSIT
    OUT_FOR_DELIVERY
    DELIVERED
    FAILED
    CANCELLED
  }

  type Product {
    id: ID!
    shopifyProductId: String
    storeId: String!
    sku: String!
    name: String!
    description: String
    price: Float!
    compareAtPrice: Float
    costPrice: Float
    barcode: String
    weight: Float
    weightUnit: String
    imageUrl: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    store: Store!
    inventoryItems: [InventoryItem!]!
  }

  type InventoryItem {
    id: ID!
    productId: String!
    storeId: String!
    warehouseId: String
    quantity: Int!
    reservedQuantity: Int!
    availableQuantity: Int!
    reorderPoint: Int
    reorderQuantity: Int
    lastRestockedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    product: Product!
    store: Store!
    warehouse: Warehouse
  }

  type Warehouse {
    id: ID!
    name: String!
    code: String!
    address: JSON
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ReturnRequest {
    id: ID!
    orderId: String!
    returnNumber: String!
    status: ReturnStatus!
    reason: String!
    customerNotes: String
    internalNotes: String
    refundAmount: Float
    restockFee: Float
    refundMethod: String
    approvedAt: DateTime
    completedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    order: Order!
    returnItems: [ReturnItem!]!
  }

  type ReturnItem {
    id: ID!
    returnRequestId: String!
    orderItemId: String!
    quantity: Int!
    condition: String
    orderItem: OrderItem!
  }

  enum ReturnStatus {
    PENDING
    APPROVED
    REJECTED
    RECEIVED
    INSPECTING
    COMPLETED
    CANCELLED
  }

  type Store {
    id: ID!
    name: String!
    shopifyDomain: String!
    shopifyStoreId: String!
    isActive: Boolean!
    lastSyncAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Notification {
    id: ID!
    type: NotificationType!
    channel: NotificationChannel!
    recipient: String!
    subject: String
    message: String!
    metadata: JSON
    status: NotificationStatus!
    sentAt: DateTime
    error: String
    createdAt: DateTime!
  }

  enum NotificationType {
    ORDER_CREATED
    ORDER_FULFILLED
    ORDER_SHIPPED
    ORDER_DELIVERED
    ORDER_CANCELLED
    RETURN_REQUESTED
    INVENTORY_LOW
    SHIPMENT_DELAYED
  }

  enum NotificationChannel {
    EMAIL
    SLACK
    WHATSAPP
    SMS
  }

  enum NotificationStatus {
    PENDING
    SENT
    FAILED
  }

  # Inputs
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole
  }

  input CreateOrderInput {
    storeId: ID!
    customerName: String!
    customerEmail: String
    customerPhone: String
    totalAmount: Float!
    currency: String
    shippingAddress: JSON
    billingAddress: JSON
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: ID
    sku: String
    name: String!
    quantity: Int!
    price: Float!
  }

  input UpdateOrderInput {
    customerName: String
    customerEmail: String
    customerPhone: String
    notes: String
    shippingAddress: JSON
    billingAddress: JSON
  }

  input CreateFulfillmentInput {
    orderId: ID!
    warehouseId: ID
    trackingNumber: String
    carrier: String
    shippingMethod: String
    items: [FulfillmentItemInput!]!
  }

  input FulfillmentItemInput {
    orderItemId: ID!
    quantity: Int!
  }

  input UpdateFulfillmentInput {
    trackingNumber: String
    carrier: String
    shippingMethod: String
    estimatedDelivery: DateTime
    notes: String
  }

  input CreateReturnInput {
    orderId: ID!
    reason: String!
    customerNotes: String
    items: [ReturnItemInput!]!
  }

  input ReturnItemInput {
    orderItemId: ID!
    quantity: Int!
    condition: String
  }

  input CreateStoreInput {
    name: String!
    shopifyDomain: String!
    shopifyStoreId: String!
    accessToken: String!
    scopes: String!
  }

  input UpdateStoreInput {
    name: String
    isActive: Boolean
  }

  # Filters
  input OrderFilters {
    storeId: ID
    status: OrderStatus
    fulfillmentStatus: OrderFulfillmentStatus
    startDate: DateTime
    endDate: DateTime
    search: String
  }

  input FulfillmentFilters {
    orderId: ID
    status: FulfillmentStatus
    warehouseId: ID
    startDate: DateTime
    endDate: DateTime
  }

  input InventoryFilters {
    productId: ID
    storeId: ID
    warehouseId: ID
    lowStock: Boolean
  }

  input ReturnFilters {
    orderId: ID
    status: ReturnStatus
    startDate: DateTime
    endDate: DateTime
  }

  input NotificationFilters {
    status: NotificationStatus
    type: NotificationType
    channel: NotificationChannel
  }

  enum InventoryOperation {
    SET
    ADD
    SUBTRACT
  }

  # Responses
  type OrdersResponse {
    orders: [Order!]!
    total: Int!
  }

  type FulfillmentsResponse {
    fulfillments: [Fulfillment!]!
    total: Int!
  }

  type InventoryItemsResponse {
    items: [InventoryItem!]!
    total: Int!
  }

  type ReturnRequestsResponse {
    returns: [ReturnRequest!]!
    total: Int!
  }

  type ProductsResponse {
    products: [Product!]!
    total: Int!
  }

  type NotificationsResponse {
    notifications: [Notification!]!
    total: Int!
  }

  type OrderAnalytics {
    totalOrders: Int!
    totalRevenue: Float!
    avgOrderValue: Float!
    ordersByStatus: JSON!
  }

  type InventoryAnalytics {
    totalItems: Int!
    totalQuantity: Int!
    totalAvailable: Int!
    totalReserved: Int!
    lowStockCount: Int!
    outOfStockCount: Int!
  }

  type ReturnAnalytics {
    totalReturns: Int!
    returnsByStatus: JSON!
    totalRefundAmount: Float!
  }

  type ReorderSuggestion {
    inventoryItemId: ID!
    productId: ID!
    productName: String!
    sku: String!
    currentQuantity: Int!
    reorderPoint: Int!
    suggestedOrderQuantity: Int!
    warehouseId: ID
    warehouseName: String
  }

  type SuccessResponse {
    success: Boolean!
    message: String
  }
`;

