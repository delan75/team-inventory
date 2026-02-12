# StockFlow Backend API - Inventory Management System

A robust Django REST Framework API for inventory and point-of-sale (POS) management. This backend provides comprehensive endpoints for product management, sales processing, inventory tracking, and analytics reporting with multi-shop support.

## 📋 Overview

StockFlow Backend is a RESTful API built with Django 5.0 and Django REST Framework. It implements a service-repository pattern with JWT authentication, shop-based multi-tenancy, and comprehensive business logic for retail operations.

### Key Features

- **🔐 JWT Authentication**: Secure token-based authentication with refresh tokens
- **🏢 Multi-Shop Architecture**: Shop-based data isolation with context middleware
- **📦 Product Management**: Full CRUD with categories, suppliers, and image support
- **💰 Sales Processing**: POS transactions with multiple payment methods
- **📊 Inventory Tracking**: Stock movements, adjustments, and purchase orders
- **📈 Analytics & Reports**: Dashboard metrics, sales reports, and inventory valuation
- **🔄 Automatic Stock Updates**: Real-time inventory updates on sales
- **💳 Credit Sales**: Customer debt tracking and payment management
- **🎯 Stock Alerts**: Low stock and out-of-stock notifications
- **📸 Product Images**: Multiple image support with primary image selection

## 🏗️ Architecture

### Technology Stack

- **Framework**: Django 5.0
- **API**: Django REST Framework 3.14+
- **Authentication**: djangorestframework-simplejwt 5.3+
- **Database**: SQLite (development) / PostgreSQL (production)
- **Documentation**: drf-spectacular (OpenAPI/Swagger)
- **CORS**: django-cors-headers 4.3+
- **Image Processing**: Pillow 10.0+
- **Task Queue**: Celery 5.3+ with Redis 5.0+
- **Cloud Storage**: django-storages 1.14+ with Cloudinary 1.36+

### Project Structure

```
backend/
├── apps/                           # Django applications
│   ├── authentication/             # User authentication & JWT
│   │   ├── models.py              # Custom User model
│   │   ├── serializers.py         # Auth serializers
│   │   ├── views.py               # Login, register, profile
│   │   └── managers.py            # Custom user manager
│   ├── core/                       # Core utilities
│   │   ├── middleware.py          # Shop context middleware
│   │   ├── responses.py           # Standardized API responses
│   │   ├── permissions.py         # Custom permissions
│   │   └── shop_context.py        # Shop context helpers
│   ├── shops/                      # Shop management
│   │   ├── models.py              # Shop, ShopMember
│   │   ├── services.py            # Business logic
│   │   └── views.py               # Shop CRUD
│   ├── products/                   # Product management
│   │   ├── models.py              # Product, Category, Supplier
│   │   ├── repositories.py        # Data access layer
│   │   ├── services.py            # Business logic
│   │   └── views.py               # Product CRUD
│   ├── sales/                      # Sales & POS
│   │   ├── models.py              # Sale, SaleItem, Payment, Customer
│   │   ├── repositories.py        # Data access layer
│   │   ├── services.py            # Transaction processing
│   │   └── views.py               # Sales endpoints
│   ├── inventory/                  # Inventory management
│   │   ├── models.py              # StockMovement, PurchaseOrder
│   │   ├── services.py            # Stock operations
│   │   └── views.py               # Inventory endpoints
│   └── reports/                    # Analytics & reporting
│       ├── views.py               # Dashboard, sales reports
│       └── urls.py                # Report endpoints
├── config/                         # Django configuration
│   ├── settings/                   # Split settings
│   │   ├── base.py                # Base settings
│   │   ├── development.py         # Dev settings
│   │   └── production.py          # Prod settings
│   ├── urls.py                    # URL routing
│   ├── wsgi.py                    # WSGI config
│   └── asgi.py                    # ASGI config
├── requirements/                   # Dependencies
│   ├── base.txt                   # Base requirements
│   ├── development.txt            # Dev requirements
│   └── production.txt             # Prod requirements
├── manage.py                       # Django management
└── db.sqlite3                      # SQLite database (dev)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- pip and virtualenv
- PostgreSQL (production) or SQLite (development)
- Redis (for Celery tasks)

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements/development.txt
   ```

4. **Environment variables**
   
   Create a `.env` file in the backend root:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database (optional for dev, uses SQLite by default)
   DATABASE_URL=postgresql://user:password@localhost:5432/stockflow
   
   # Redis (for Celery)
   REDIS_URL=redis://localhost:6379/0
   
   # Cloudinary (for image storage)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the API**
   - API Base: `http://localhost:8000/api/v1/`
   - Admin Panel: `http://localhost:8000/admin/`
   - Swagger Docs: `http://localhost:8000/api/schema/swagger-ui/`
   - ReDoc: `http://localhost:8000/api/schema/redoc/`

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1/
```

### Authentication

All endpoints (except auth) require JWT authentication:
```http
Authorization: Bearer <access_token>
```

#### Endpoints

**Register**
```http
POST /api/v1/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Login**
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Refresh Token**
```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Get Profile**
```http
GET /api/v1/auth/me/
Authorization: Bearer <access_token>
```

### Shop Context

All shop-specific endpoints require the `X-Shop-ID` header:
```http
X-Shop-ID: <shop-uuid>
```

### Products

**List Products**
```http
GET /api/v1/products/
GET /api/v1/products/?search=coca
Authorization: Bearer <token>
X-Shop-ID: <shop-uuid>
```

**Create Product**
```http
POST /api/v1/products/
Authorization: Bearer <token>
X-Shop-ID: <shop-uuid>
Content-Type: application/json

{
  "name": "Coca Cola 500ml",
  "sku": "CC500",
  "barcode": "1234567890123",
  "description": "Refreshing cola drink",
  "unit_price": 15.00,
  "cost_price": 10.00,
  "tax_rate": 15.00,
  "current_stock": 100,
  "minimum_stock": 20,
  "unit": "pcs",
  "category": "<category-uuid>",
  "is_active": true
}
```

**Get Product**
```http
GET /api/v1/products/<product-id>/
```

**Update Product**
```http
PUT /api/v1/products/<product-id>/
Content-Type: application/json

{
  "unit_price": 16.00,
  "current_stock": 150
}
```

**Delete Product**
```http
DELETE /api/v1/products/<product-id>/
```

**Upload Product Image**
```http
POST /api/v1/products/<product-id>/images/
Content-Type: multipart/form-data

image: <file>
is_primary: true
```

### Categories

**List Categories**
```http
GET /api/v1/products/categories/
```

**Create Category**
```http
POST /api/v1/products/categories/
Content-Type: application/json

{
  "name": "Beverages",
  "description": "Drinks and refreshments"
}
```

**Update Category**
```http
PUT /api/v1/products/categories/<category-id>/
```

**Delete Category**
```http
DELETE /api/v1/products/categories/<category-id>/
```

### Sales (POS)

**Create Sale**
```http
POST /api/v1/sales/
Authorization: Bearer <token>
X-Shop-ID: <shop-uuid>
Content-Type: application/json

{
  "items": [
    {
      "product_id": "<product-uuid>",
      "quantity": 2,
      "price": 15.00
    }
  ],
  "payment": {
    "amount_paid": 30.00,
    "method": "CASH"
  },
  "customer_id": "<customer-uuid>"  // Optional, required for CREDIT
}

Response:
{
  "success": true,
  "data": {
    "id": "<sale-uuid>",
    "total_amount": 30.00,
    "paid_amount": 30.00,
    "change_amount": 0.00,
    "status": "COMPLETED",
    "payment_method": "CASH",
    "items": [...]
  },
  "message": "Sale recorded successfully"
}
```

**List Sales**
```http
GET /api/v1/sales/
```

**Add Payment to Credit Sale**
```http
POST /api/v1/sales/<sale-id>/payments/
Content-Type: application/json

{
  "amount": 50.00,
  "method": "CASH"
}
```

### Customers

**List Customers**
```http
GET /api/v1/sales/customers/
```

**Create Customer**
```http
POST /api/v1/sales/customers/
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+27123456789",
  "email": "john@example.com"
}
```

### Reports & Analytics

**Dashboard Summary**
```http
GET /api/v1/reports/dashboard/
Authorization: Bearer <token>
X-Shop-ID: <shop-uuid>

Response:
{
  "success": true,
  "data": {
    "sales": {
      "today": 1500.00,
      "this_week": 8500.00,
      "this_month": 35000.00
    },
    "alerts": {
      "low_stock_count": 5,
      "out_of_stock_count": 2
    },
    "credit": {
      "pending_sales_count": 3,
      "total_outstanding_debt": 2500.00
    },
    "top_products_today": [
      {
        "product__name": "Coca Cola 500ml",
        "quantity_sold": 50,
        "revenue": 750.00
      }
    ]
  }
}
```

**Sales Report**
```http
GET /api/v1/reports/sales/?start_date=2024-01-01&end_date=2024-01-31
```

**Inventory Valuation**
```http
GET /api/v1/reports/inventory-valuation/
```

**Stock Alerts**
```http
GET /api/v1/reports/stock-alerts/
```

**Top Products**
```http
GET /api/v1/reports/top-products/?period=week&limit=10
```

### Shops

**List Shops**
```http
GET /api/v1/shops/
```

**Create Shop**
```http
POST /api/v1/shops/
Content-Type: application/json

{
  "name": "My Store",
  "address": "123 Main St",
  "phone": "+27123456789",
  "currency": "ZAR"
}
```

## 🔒 Security & Authentication

### JWT Token Flow

1. **Login**: User provides email/password → Receives access & refresh tokens
2. **Access Token**: Short-lived (1 hour), used for API requests
3. **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
4. **Token Rotation**: New refresh token issued on refresh (configurable)

### Shop Context Middleware

The `ShopContextMiddleware` automatically:
- Extracts shop ID from `X-Shop-ID` header
- Validates user has access to the shop
- Attaches shop object to request
- Returns 403 if user lacks access

**Priority Order**:
1. `X-Shop-ID` header (production)
2. `shop_id` query parameter (debugging)
3. User's first owned shop (convenience)
4. User's first membership shop

### Permissions

- **IsAuthenticated**: All endpoints require authentication
- **Shop Access**: Validated via middleware
- **Owner/Manager/Staff**: Role-based permissions (future enhancement)

## 💾 Database Models

### User Model
```python
- id: UUID (primary key)
- email: EmailField (unique, username)
- first_name: CharField
- last_name: CharField
- phone_number: CharField (optional)
- role: CharField (OWNER, MANAGER, STAFF)
- password: Hashed
```

### Shop Model
```python
- id: UUID
- name: CharField
- owner: ForeignKey(User)
- address: TextField
- phone: CharField
- currency: CharField (default: ZAR)
- created_at: DateTimeField
```

### Product Model
```python
- id: UUID
- shop: ForeignKey(Shop)
- name: CharField
- sku: CharField (unique per shop)
- barcode: CharField (optional, unique per shop)
- description: TextField
- category: ForeignKey(Category)
- supplier: ForeignKey(Supplier)
- unit_price: DecimalField
- cost_price: DecimalField
- tax_rate: DecimalField
- current_stock: IntegerField
- minimum_stock: IntegerField
- unit: CharField (default: pcs)
- image: ImageField
- is_active: BooleanField
- created_at: DateTimeField
```

### Sale Model
```python
- id: UUID
- shop: ForeignKey(Shop)
- customer: ForeignKey(Customer, optional)
- seller: ForeignKey(User)
- total_amount: DecimalField
- paid_amount: DecimalField
- change_amount: DecimalField
- status: CharField (COMPLETED, PENDING, CANCELLED)
- payment_method: CharField (CASH, CARD, EFT, CREDIT)
- created_at: DateTimeField
```

### SaleItem Model
```python
- id: UUID
- sale: ForeignKey(Sale)
- product: ForeignKey(Product)
- quantity: IntegerField
- price_at_sale: DecimalField
- total: DecimalField (auto-calculated)
```

## 🔄 Business Logic

### Sale Processing Flow

1. **Validation**:
   - Verify all products exist and belong to shop
   - Check stock availability for each item
   - Validate payment method and customer (for CREDIT)

2. **Transaction Creation**:
   - Create Sale record
   - Create SaleItem records for each product
   - Calculate totals and change

3. **Stock Updates**:
   - Deduct quantities from product stock
   - Create StockMovement records for audit trail

4. **Payment Processing**:
   - Create Payment record
   - Update customer debt (for CREDIT sales)
   - Calculate change (for CASH)

5. **Response**:
   - Return complete sale details
   - Include items, totals, and payment info

### Stock Management

**Stock Movement Types**:
- `SALE`: Stock deduction from sale
- `PURCHASE`: Stock addition from purchase order
- `ADJUSTMENT`: Manual stock adjustment
- `RETURN`: Stock addition from return
- `INITIAL`: Initial stock entry

**Automatic Stock Updates**:
- Sales automatically deduct stock
- Purchase orders add stock when completed
- All movements logged for audit trail

### Credit Sales

**Flow**:
1. Sale created with `payment_method=CREDIT`
2. Customer required (validation)
3. Sale status set to `PENDING`
4. Customer debt increased by sale amount
5. Payments can be added later to reduce debt

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...} or [...],
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {...}
  }
}
```

### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field_name": ["Error message"]
    }
  }
}
```

## 🧪 Testing

### Run Tests
```bash
python manage.py test
```

### Test Coverage
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Manual API Testing

**Using cURL**:
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create Product
curl -X POST http://localhost:8000/api/v1/products/ \
  -H "Authorization: Bearer <token>" \
  -H "X-Shop-ID: <shop-uuid>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","sku":"TEST001","unit_price":10.00,"cost_price":5.00,"current_stock":100,"minimum_stock":10}'
```

**Using Postman**:
1. Import OpenAPI schema from `/api/schema/`
2. Set environment variables for token and shop_id
3. Test all endpoints

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG=False` in production settings
- [ ] Configure PostgreSQL database
- [ ] Set strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up Redis for Celery
- [ ] Configure Cloudinary for media storage
- [ ] Enable HTTPS
- [ ] Set up Sentry for error tracking
- [ ] Configure CORS for frontend domain
- [ ] Run `collectstatic` for static files
- [ ] Set up database backups
- [ ] Configure logging

### Environment Variables (Production)
```env
SECRET_KEY=<strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=api.stockflow.com,www.stockflow.com

DATABASE_URL=postgresql://user:password@db-host:5432/stockflow
REDIS_URL=redis://redis-host:6379/0

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

SENTRY_DSN=<sentry-dsn>
CORS_ALLOWED_ORIGINS=https://app.stockflow.com
```

### Deployment Commands
```bash
# Install production dependencies
pip install -r requirements/production.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Start Celery worker
celery -A config worker -l info
```

## 🐛 Known Issues & Limitations

1. **SQLite in Development**: Not suitable for production, use PostgreSQL
2. **No Rate Limiting**: Implement rate limiting for production
3. **Basic Permissions**: Role-based permissions not fully implemented
4. **No Email Verification**: Email verification on registration not implemented
5. **Limited Reporting**: Advanced analytics and exports not yet available
6. **No Webhooks**: No webhook support for external integrations
7. **Single Currency**: Multi-currency support not implemented

## 🔮 Future Enhancements

### Planned Features
- [ ] Advanced role-based permissions (Owner, Manager, Staff)
- [ ] Email notifications (low stock, sales reports)
- [ ] Webhook support for integrations
- [ ] Advanced analytics and custom reports
- [ ] Data export (CSV, Excel, PDF)
- [ ] Barcode generation API
- [ ] Multi-currency support
- [ ] Tax calculation engine
- [ ] Discount and promotion system
- [ ] Loyalty program integration
- [ ] API rate limiting
- [ ] GraphQL API option
- [ ] Real-time updates via WebSockets
- [ ] Audit log for all operations

### Technical Improvements
- [ ] Comprehensive test coverage (>80%)
- [ ] API versioning strategy
- [ ] Database query optimization
- [ ] Caching layer (Redis)
- [ ] Background task processing (Celery)
- [ ] API documentation improvements
- [ ] Performance monitoring
- [ ] Security hardening
- [ ] CI/CD pipeline
- [ ] Docker containerization

## 📄 License

This project is proprietary software developed for Chisolution Inc.

## 👥 Team - Team Inventory (AIS - UJ)

## Dilane Muluh
## Sulivan Nyirongo
## Nick

## 📞 Support

For issues, questions, or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Python**: 3.10+  
**Django**: 5.0+  
**API Version**: v1
