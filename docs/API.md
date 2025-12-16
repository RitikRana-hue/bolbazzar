# InstaSell API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/signup
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "buyer"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  },
  "token": "eyJhbGc..."
}
```

### POST /auth/login
Login user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  },
  "token": "eyJhbGc..."
}
```

### GET /auth/me
Get current user profile.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "avatar_url": "https://...",
  "bio": "..."
}
```

---

## Listings Endpoints

### GET /listings
Get all listings with filters.

**Query Parameters:**
- `category` - Filter by category ID
- `type` - Filter by type (direct/auction)
- `condition` - Filter by condition (new/refurbished)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "seller_id": "uuid",
    "title": "iPhone 13 Pro",
    "description": "...",
    "category_id": "uuid",
    "type": "direct",
    "condition": "new",
    "price": 999.99,
    "stock": 5,
    "images": ["url1", "url2"],
    "is_open_box_required": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /listings/:id
Get listing details.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "seller_id": "uuid",
  "title": "iPhone 13 Pro",
  "description": "...",
  "category_id": "uuid",
  "type": "direct",
  "condition": "new",
  "price": 999.99,
  "stock": 5,
  "images": ["url1", "url2"],
  "is_open_box_required": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### POST /listings
Create new listing. **Requires authentication.**

**Request:**
```json
{
  "title": "iPhone 13 Pro",
  "description": "Brand new, sealed box",
  "categoryId": "uuid",
  "type": "direct",
  "condition": "new",
  "price": 999.99,
  "stock": 5,
  "images": ["url1", "url2"]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "seller_id": "uuid",
  "title": "iPhone 13 Pro",
  ...
}
```

### PUT /listings/:id
Update listing. **Requires authentication (seller only).**

**Request:**
```json
{
  "title": "iPhone 13 Pro - Updated",
  "price": 899.99,
  "stock": 3
}
```

**Response:** `200 OK`

### DELETE /listings/:id
Delete listing. **Requires authentication (seller only).**

**Response:** `200 OK`
```json
{
  "message": "Listing deleted"
}
```

---

## Auctions Endpoints

### POST /auctions
Create auction. **Requires authentication (seller only).**

**Request:**
```json
{
  "listingId": "uuid",
  "minBid": 100.00,
  "durationMinutes": 30
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "listing_id": "uuid",
  "seller_id": "uuid",
  "start_at": "2024-01-01T00:00:00Z",
  "end_at": "2024-01-01T00:30:00Z",
  "min_bid": 100.00,
  "current_bid": 100.00,
  "current_bidder_id": null,
  "status": "live",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /auctions/:id/bid
Place bid on auction. **Requires authentication.**

**Request:**
```json
{
  "bidderId": "uuid",
  "amount": 150.00
}
```

**Response:** `200 OK`
```json
{
  "bid": {
    "id": "uuid",
    "auction_id": "uuid",
    "bidder_id": "uuid",
    "amount": 150.00,
    "created_at": "2024-01-01T00:05:00Z"
  },
  "auctionExtended": false
}
```

### GET /auctions/:id/status
Get auction status.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "listing_id": "uuid",
  "seller_id": "uuid",
  "start_at": "2024-01-01T00:00:00Z",
  "end_at": "2024-01-01T00:30:00Z",
  "min_bid": 100.00,
  "current_bid": 150.00,
  "current_bidder_id": "uuid",
  "status": "live",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /auctions/live
Get all live auctions.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "listing_id": "uuid",
    "current_bid": 150.00,
    "end_at": "2024-01-01T00:30:00Z",
    ...
  }
]
```

### GET /auctions/:id/bids
Get bid history for auction.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "auction_id": "uuid",
    "bidder_id": "uuid",
    "amount": 150.00,
    "created_at": "2024-01-01T00:05:00Z"
  },
  {
    "id": "uuid",
    "auction_id": "uuid",
    "bidder_id": "uuid",
    "amount": 120.00,
    "created_at": "2024-01-01T00:02:00Z"
  }
]
```

---

## Orders Endpoints

### POST /orders
Create order (direct purchase or auction win). **Requires authentication.**

**Request:**
```json
{
  "buyerId": "uuid",
  "sellerId": "uuid",
  "listingId": "uuid",
  "quantity": 1,
  "totalAmount": 999.99
}
```

**Response:** `201 Created`
```json
{
  "order": {
    "id": "uuid",
    "buyer_id": "uuid",
    "seller_id": "uuid",
    "listing_id": "uuid",
    "quantity": 1,
    "total_amount": 999.99,
    "status": "pending",
    "escrow_release_at": "2024-01-08T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "clientSecret": "pi_1234567890"
}
```

### GET /orders/:id
Get order details. **Requires authentication.**

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "buyer_id": "uuid",
  "seller_id": "uuid",
  "listing_id": "uuid",
  "quantity": 1,
  "total_amount": 999.99,
  "status": "processing",
  "escrow_release_at": "2024-01-08T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### POST /orders/:id/confirm-payment
Confirm payment received. **Requires authentication.**

**Request:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response:** `200 OK`
```json
{
  "message": "Payment confirmed"
}
```

### POST /orders/:id/confirm-delivery
Confirm delivery received. **Requires authentication (buyer only).**

**Request:**
```json
{
  "photos": ["url1", "url2"],
  "signatureUrl": "url"
}
```

**Response:** `200 OK`
```json
{
  "message": "Delivery confirmed"
}
```

### POST /orders/:id/refund
Request refund. **Requires authentication.**

**Request:**
```json
{
  "amount": 999.99,
  "reason": "Item not as described"
}
```

**Response:** `200 OK`
```json
{
  "message": "Refund processed"
}
```

---

## Wallet Endpoints

### GET /wallet/:userId
Get wallet balance. **Requires authentication.**

**Response:** `200 OK`
```json
{
  "user_id": "uuid",
  "balance": 5000.00,
  "gas_balance": 500,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### POST /wallet/:userId/topup
Top up wallet balance. **Requires authentication.**

**Request:**
```json
{
  "amount": 1000.00
}
```

**Response:** `200 OK`
```json
{
  "message": "Wallet topped up"
}
```

### POST /wallet/:userId/use-gas
Deduct gas fee. **Requires authentication.**

**Request:**
```json
{
  "amount": 100
}
```

**Response:** `200 OK`
```json
{
  "message": "Gas used"
}
```

### POST /wallet/:userId/withdraw
Withdraw funds. **Requires authentication.**

**Request:**
```json
{
  "amount": 1000.00
}
```

**Response:** `200 OK`
```json
{
  "message": "Withdrawal processed"
}
```

---

## Admin Endpoints

### GET /admin/disputes
Get all disputes. **Requires authentication (admin only).**

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "order_id": "uuid",
    "buyer_id": "uuid",
    "reason": "Item not as described",
    "status": "open",
    "evidence": {...},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /admin/disputes/:id/resolve
Resolve dispute. **Requires authentication (admin only).**

**Request:**
```json
{
  "resolution": "refund",
  "refundAmount": 999.99
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "resolved",
  ...
}
```

### GET /admin/analytics
Get platform analytics. **Requires authentication (admin only).**

**Response:** `200 OK`
```json
{
  "totalOrders": 150,
  "totalRevenue": 50000.00,
  "activeAuctions": 25,
  "totalUsers": 500
}
```

### GET /admin/users
Get all users. **Requires authentication (admin only).**

**Query Parameters:**
- `role` - Filter by role (buyer/seller/admin)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer",
    "verification_status": "verified",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /admin/users/:id/suspend
Suspend user. **Requires authentication (admin only).**

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "verification_status": "suspended",
  ...
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining`

---

## Pagination
List endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

---

## Socket.IO Events

### Client → Server
```javascript
socket.emit('join_auction', auctionId)
socket.emit('place_bid', { auctionId, amount })
socket.emit('leave_auction', auctionId)
```

### Server → Client
```javascript
socket.on('bid_placed', { bid, auctionExtended })
socket.on('auction_ended', { auctionId, winner })
socket.on('new_message', message)
socket.on('notification', payload)
```

---

For implementation examples, see the frontend code in `apps/web/app`
