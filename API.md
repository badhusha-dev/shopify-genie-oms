# ShopifyGenie OMS - API Documentation

Complete API reference for the ShopifyGenie Order Management System GraphQL API.

## Base URL

```
http://localhost:4000/graphql  (Development)
https://your-domain.com/graphql  (Production)
```

## Authentication

All requests (except `login` and `register`) require a JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## User Roles

- **ADMIN** - Full system access
- **MANAGER** - Order and fulfillment management
- **FULFILLMENT** - Fulfillment and shipping operations only
- **SUPPORT** - Read-only access

---

## Authentication

### Login

```graphql
mutation Login {
  login(email: "user@example.com", password: "password123") {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

### Register User

```graphql
mutation Register {
  register(input: {
    email: "newuser@example.com"
    password: "SecurePass123!"
    firstName: "John"
    lastName: "Doe"
    role: SUPPORT
  }) {
    id
    email
    firstName
    lastName
    role
  }
}
```

### Get Current User

```graphql
query Me {
  me {
    id
    email
    firstName
    lastName
    role
    isActive
    createdAt
  }
}
```

### Change Password

```graphql
mutation ChangePassword {
  changePassword(
    currentPassword: "OldPass123!"
    newPassword: "NewPass123!"
  ) {
    success
    message
  }
}
```

---

## Orders

### Get Orders List

```graphql
query GetOrders {
  orders(
    filters: {
      status: PENDING
      fulfillmentStatus: UNFULFILLED
      startDate: "2024-01-01T00:00:00Z"
      endDate: "2024-12-31T23:59:59Z"
      search: "John"
    }
    limit: 20
    offset: 0
  ) {
    orders {
      id
      orderNumber
      customerName
      customerEmail
      totalAmount
      currency
      orderStatus
      fulfillmentStatus
      tags
      createdAt
      orderItems {
        id
        name
        quantity
        price
      }
    }
    total
  }
}
```

### Get Single Order

```graphql
query GetOrder {
  order(id: "order-id-here") {
    id
    orderNumber
    shopifyOrderId
    customerName
    customerEmail
    customerPhone
    financialStatus
    fulfillmentStatus
    orderStatus
    totalAmount
    currency
    taxAmount
    shippingAmount
    discountAmount
    tags
    notes
    shippingAddress
    billingAddress
    createdAt
    updatedAt
    orderItems {
      id
      name
      sku
      quantity
      price
      totalAmount
      product {
        id
        name
      }
    }
    fulfillments {
      id
      status
      trackingNumber
      carrier
      shippedAt
    }
    returnRequests {
      id
      returnNumber
      status
      reason
    }
  }
}
```

### Create Manual Order

```graphql
mutation CreateOrder {
  createOrder(input: {
    storeId: "store-id"
    customerName: "John Doe"
    customerEmail: "john@example.com"
    customerPhone: "+1234567890"
    totalAmount: 150.00
    currency: "USD"
    shippingAddress: {
      address1: "123 Main St"
      city: "New York"
      province: "NY"
      zip: "10001"
      country: "United States"
    }
    items: [
      {
        name: "Product 1"
        sku: "SKU-001"
        quantity: 2
        price: 50.00
      }
      {
        name: "Product 2"
        sku: "SKU-002"
        quantity: 1
        price: 50.00
      }
    ]
  }) {
    id
    orderNumber
    customerName
    totalAmount
    orderStatus
  }
}
```

### Update Order

```graphql
mutation UpdateOrder {
  updateOrder(
    id: "order-id"
    input: {
      customerEmail: "newemail@example.com"
      notes: "Customer requested expedited shipping"
    }
  ) {
    id
    orderNumber
    customerEmail
    notes
  }
}
```

### Update Order Status

```graphql
mutation UpdateOrderStatus {
  updateOrderStatus(id: "order-id", status: PROCESSED) {
    id
    orderNumber
    orderStatus
  }
}
```

### Cancel Order

```graphql
mutation CancelOrder {
  cancelOrder(
    id: "order-id"
    reason: "Customer requested cancellation"
  ) {
    id
    orderNumber
    orderStatus
    cancelledAt
    cancelReason
  }
}
```

### Add Order Notes

```graphql
mutation AddOrderNote {
  addOrderNote(
    orderId: "order-id"
    note: "Customer called to confirm delivery address"
  ) {
    id
    notes
  }
}
```

### Add Order Tags

```graphql
mutation AddOrderTags {
  addOrderTags(
    orderId: "order-id"
    tags: ["priority", "expedited"]
  ) {
    id
    tags
  }
}
```

### Get Order Analytics

```graphql
query OrderAnalytics {
  orderAnalytics(
    storeId: "store-id"
    startDate: "2024-01-01T00:00:00Z"
    endDate: "2024-12-31T23:59:59Z"
  ) {
    totalOrders
    totalRevenue
    avgOrderValue
    ordersByStatus
  }
}
```

---

## Fulfillments

### Get Fulfillments

```graphql
query GetFulfillments {
  fulfillments(
    filters: {
      orderId: "order-id"
      status: PENDING
      warehouseId: "warehouse-id"
    }
    limit: 50
    offset: 0
  ) {
    fulfillments {
      id
      status
      trackingNumber
      carrier
      shippingMethod
      estimatedDelivery
      shippedAt
      deliveredAt
      order {
        id
        orderNumber
      }
      fulfillmentItems {
        id
        quantity
        orderItem {
          name
        }
      }
    }
    total
  }
}
```

### Create Fulfillment

```graphql
mutation CreateFulfillment {
  createFulfillment(input: {
    orderId: "order-id"
    warehouseId: "warehouse-id"
    trackingNumber: "1Z999AA10123456784"
    carrier: "UPS"
    shippingMethod: "Ground"
    items: [
      {
        orderItemId: "item-1"
        quantity: 2
      }
      {
        orderItemId: "item-2"
        quantity: 1
      }
    ]
  }) {
    id
    status
    trackingNumber
    order {
      orderNumber
    }
  }
}
```

### Update Fulfillment Status

```graphql
mutation UpdateFulfillmentStatus {
  updateFulfillmentStatus(id: "fulfillment-id", status: SHIPPED) {
    id
    status
    shippedAt
  }
}
```

### Ship Fulfillment

```graphql
mutation ShipFulfillment {
  shipFulfillment(id: "fulfillment-id") {
    id
    status
    shippedAt
    order {
      orderStatus
    }
  }
}
```

### Add Tracking Info

```graphql
mutation AddTrackingInfo {
  addTrackingInfo(
    id: "fulfillment-id"
    trackingNumber: "1Z999AA10123456784"
    carrier: "UPS"
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784"
  ) {
    id
    trackingNumber
    carrier
    trackingUrl
  }
}
```

---

## Inventory

### Get Inventory Items

```graphql
query GetInventory {
  inventoryItems(
    filters: {
      productId: "product-id"
      storeId: "store-id"
      warehouseId: "warehouse-id"
      lowStock: true
    }
    limit: 100
    offset: 0
  ) {
    items {
      id
      quantity
      availableQuantity
      reservedQuantity
      reorderPoint
      reorderQuantity
      lastRestockedAt
      product {
        id
        name
        sku
      }
      warehouse {
        id
        name
      }
    }
    total
  }
}
```

### Update Inventory Quantity

```graphql
mutation UpdateInventoryQuantity {
  updateInventoryQuantity(
    id: "inventory-id"
    quantity: 100
    operation: SET  # or ADD, SUBTRACT
  ) {
    id
    quantity
    availableQuantity
    reservedQuantity
  }
}
```

### Reserve Inventory

```graphql
mutation ReserveInventory {
  reserveInventory(
    productId: "product-id"
    quantity: 5
    warehouseId: "warehouse-id"
  ) {
    id
    quantity
    availableQuantity
    reservedQuantity
  }
}
```

### Release Reserved Inventory

```graphql
mutation ReleaseInventory {
  releaseReservedInventory(
    productId: "product-id"
    quantity: 5
    warehouseId: "warehouse-id"
  ) {
    id
    quantity
    availableQuantity
    reservedQuantity
  }
}
```

### Set Reorder Point

```graphql
mutation SetReorderPoint {
  setReorderPoint(
    id: "inventory-id"
    reorderPoint: 10
    reorderQuantity: 50
  ) {
    id
    reorderPoint
    reorderQuantity
  }
}
```

### Get Low Stock Items

```graphql
query LowStockItems {
  lowStockItems(storeId: "store-id") {
    id
    quantity
    availableQuantity
    reorderPoint
    product {
      name
      sku
    }
  }
}
```

### Get Reorder Suggestions

```graphql
query ReorderSuggestions {
  reorderSuggestions(storeId: "store-id") {
    inventoryItemId
    productId
    productName
    sku
    currentQuantity
    reorderPoint
    suggestedOrderQuantity
    warehouseName
  }
}
```

### Get Inventory Analytics

```graphql
query InventoryAnalytics {
  inventoryAnalytics(storeId: "store-id") {
    totalItems
    totalQuantity
    totalAvailable
    totalReserved
    lowStockCount
    outOfStockCount
  }
}
```

---

## Returns

### Get Return Requests

```graphql
query GetReturns {
  returnRequests(
    filters: {
      orderId: "order-id"
      status: PENDING
      startDate: "2024-01-01T00:00:00Z"
      endDate: "2024-12-31T23:59:59Z"
    }
    limit: 50
    offset: 0
  ) {
    returns {
      id
      returnNumber
      status
      reason
      customerNotes
      internalNotes
      refundAmount
      restockFee
      refundMethod
      approvedAt
      completedAt
      createdAt
      order {
        id
        orderNumber
      }
      returnItems {
        id
        quantity
        condition
        orderItem {
          name
        }
      }
    }
    total
  }
}
```

### Create Return Request

```graphql
mutation CreateReturn {
  createReturnRequest(input: {
    orderId: "order-id"
    reason: "Product defective"
    customerNotes: "Item arrived damaged"
    items: [
      {
        orderItemId: "item-id"
        quantity: 1
        condition: "damaged"
      }
    ]
  }) {
    id
    returnNumber
    status
    reason
  }
}
```

### Approve Return

```graphql
mutation ApproveReturn {
  approveReturn(
    id: "return-id"
    refundAmount: 50.00
    restockFee: 5.00
  ) {
    id
    returnNumber
    status
    refundAmount
    restockFee
    approvedAt
  }
}
```

### Reject Return

```graphql
mutation RejectReturn {
  rejectReturn(
    id: "return-id"
    reason: "Item not eligible for return"
  ) {
    id
    returnNumber
    status
  }
}
```

### Process Refund

```graphql
mutation ProcessRefund {
  processRefund(
    id: "return-id"
    refundAmount: 45.00
    refundMethod: "original_payment_method"
  ) {
    id
    returnNumber
    status
    refundAmount
    refundMethod
    completedAt
  }
}
```

### Get Return Analytics

```graphql
query ReturnAnalytics {
  returnAnalytics(
    storeId: "store-id"
    startDate: "2024-01-01T00:00:00Z"
    endDate: "2024-12-31T23:59:59Z"
  ) {
    totalReturns
    returnsByStatus
    totalRefundAmount
  }
}
```

---

## Products

### Get Products

```graphql
query GetProducts {
  products(storeId: "store-id", limit: 50, offset: 0) {
    products {
      id
      shopifyProductId
      sku
      name
      description
      price
      compareAtPrice
      costPrice
      barcode
      weight
      weightUnit
      imageUrl
      isActive
      store {
        name
      }
      inventoryItems {
        quantity
        availableQuantity
      }
    }
    total
  }
}
```

---

## Stores

### Get All Stores

```graphql
query GetStores {
  stores {
    id
    name
    shopifyDomain
    shopifyStoreId
    isActive
    lastSyncAt
    createdAt
  }
}
```

### Create Store

```graphql
mutation CreateStore {
  createStore(input: {
    name: "My Shopify Store"
    shopifyDomain: "my-store.myshopify.com"
    shopifyStoreId: "12345678"
    accessToken: "shpat_..."
    scopes: "read_orders,write_orders,read_products"
  }) {
    id
    name
    shopifyDomain
    isActive
  }
}
```

---

## Notifications

### Get Notifications

```graphql
query GetNotifications {
  notifications(
    filters: {
      status: SENT
      type: ORDER_SHIPPED
      channel: EMAIL
    }
    limit: 50
    offset: 0
  ) {
    notifications {
      id
      type
      channel
      recipient
      subject
      message
      status
      sentAt
      error
      createdAt
    }
    total
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE",
        "statusCode": 400
      }
    }
  ]
}
```

### Common Error Codes

- `UNAUTHENTICATED` - No valid authentication token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `BAD_USER_INPUT` - Invalid input data
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

API requests are rate-limited to:
- 100 requests per 15 minutes per IP
- 10 requests per second for GraphQL endpoint

Exceeded limits return:
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Webhooks

### Shopify Webhook Endpoint

```
POST /api/webhooks/shopify
```

The system automatically processes these Shopify webhook topics:
- `orders/create`
- `orders/updated`
- `orders/cancelled`
- `fulfillments/create`
- `fulfillments/update`

---

## Best Practices

1. **Always use variables** instead of inline arguments
2. **Request only needed fields** to minimize payload
3. **Implement pagination** for list queries
4. **Handle errors gracefully** with try-catch
5. **Cache responses** when appropriate
6. **Use batch operations** for bulk updates

### Example with Variables

```graphql
query GetOrders($filters: OrderFilters!, $limit: Int) {
  orders(filters: $filters, limit: $limit) {
    orders {
      id
      orderNumber
    }
  }
}
```

Variables:
```json
{
  "filters": {
    "status": "PENDING"
  },
  "limit": 20
}
```

---

## Support

For API support or questions:
- Check the [README.md](./README.md)
- Review [SETUP.md](./SETUP.md) for configuration
- Open an issue on GitHub

---

Last updated: 2024

