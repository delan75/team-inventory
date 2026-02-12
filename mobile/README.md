# StockFlow Mobile - Inventory Management System

A modern, cross-platform mobile application for inventory and point-of-sale (POS) management built with React Native and Expo. StockFlow provides businesses with a comprehensive solution to manage products, track sales, monitor stock levels, and process transactions on the go.

## 📱 Overview

StockFlow Mobile is a feature-rich inventory management application designed for retail businesses, shops, and warehouses. It offers real-time inventory tracking, POS functionality, sales analytics, and multi-shop support—all accessible from iOS, Android, and web platforms.

### Key Features

- **🔐 Authentication & Authorization**: Secure JWT-based authentication with automatic token refresh
- **📦 Product Management**: Complete CRUD operations for products with barcode scanning support
- **🏪 Point of Sale (POS)**: Intuitive cart-based checkout system with multiple payment methods
- **📊 Dashboard Analytics**: Real-time sales metrics, stock alerts, and top-performing products
- **🏷️ Category Management**: Organize products into customizable categories
- **🔔 Stock Alerts**: Automatic notifications for low stock and out-of-stock items
- **🏢 Multi-Shop Support**: Manage multiple shop locations from a single account
- **🌓 Theme Support**: Light and dark mode with customizable color schemes
- **📱 Cross-Platform**: Runs on iOS, Android, and web with a single codebase

## 🏗️ Architecture

### Technology Stack

- **Framework**: React Native 0.81.5 with React 19.1.0
- **Navigation**: Expo Router 6.0 (file-based routing)
- **State Management**: Zustand 5.0 (lightweight, performant state management)
- **UI Library**: Tamagui 1.142 (universal design system)
- **HTTP Client**: Axios 1.13 with interceptors for authentication
- **Storage**: Expo SecureStore (native) / AsyncStorage (web)
- **Camera**: Expo Camera with barcode scanning capabilities
- **Animations**: React Native Reanimated 4.1

### Project Structure

```
mobile/
├── app/                          # File-based routing (Expo Router)
│   ├── (auth)/                   # Authentication group
│   │   ├── login.tsx            # Login screen
│   │   └── register.tsx         # Registration screen
│   ├── (tabs)/                   # Main app tabs
│   │   ├── index.tsx            # Dashboard/Home
│   │   ├── pos.tsx              # Point of Sale
│   │   ├── products.tsx         # Product listing
│   │   └── settings.tsx         # Settings & preferences
│   ├── categories/               # Category management
│   │   └── index.tsx
│   ├── product/                  # Product screens
│   │   ├── [id].tsx             # Product detail/edit
│   │   └── add.tsx              # Add new product
│   └── _layout.tsx              # Root layout with auth routing
├── components/                   # Reusable components
│   └── ui/                      # UI component library
│       ├── Button.tsx           # Custom button component
│       ├── Card.tsx             # Card components (StatCard, ListCard)
│       └── Input.tsx            # Form input component
├── stores/                       # Zustand state stores
│   ├── authStore.ts             # Authentication state
│   ├── productsStore.ts         # Product management
│   ├── posStore.ts              # POS cart & checkout
│   ├── categoriesStore.ts       # Category management
│   ├── dashboardStore.ts        # Dashboard analytics
│   └── shopStore.ts             # Multi-shop management
├── services/                     # API services
│   └── api.ts                   # Axios instance with interceptors
├── utils/                        # Utility functions
│   └── storage.ts               # Platform-aware secure storage
├── constants/                    # App constants
│   └── Colors.ts                # Color definitions
├── assets/                       # Static assets
│   ├── fonts/                   # Custom fonts
│   └── images/                  # App icons & images
├── tamagui.config.ts            # UI theme configuration
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Studio (for emulators)
- Backend API running (default: `http://localhost:8000/api/v1`)

### Installation

1. **Clone the repository**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Edit `services/api.ts` to point to your backend:
   ```typescript
   const BASE_URL = 'http://YOUR_IP:8000/api/v1';
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on platform**
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`
   - Web: Press `w` or run `npm run web`

### Environment Setup

For physical device testing, update the API base URL in `services/api.ts`:
```typescript
// For Android emulator
const BASE_URL = 'http://10.0.2.2:8000/api/v1';

// For iOS simulator
const BASE_URL = 'http://localhost:8000/api/v1';

// For physical devices (use your computer's IP)
const BASE_URL = 'http://192.168.1.X:8000/api/v1';
```

## 📚 Core Features & Business Logic

### 1. Authentication System

**Location**: `stores/authStore.ts`, `app/(auth)/`

**Features**:
- Email/password authentication
- JWT token management with automatic refresh
- Secure token storage (platform-aware)
- Auto-login on app launch
- Protected route navigation

**Flow**:
1. User enters credentials
2. API returns access & refresh tokens
3. Tokens stored securely (SecureStore on native, AsyncStorage on web)
4. Access token attached to all API requests via interceptor
5. Automatic token refresh on 401 responses
6. Logout clears all stored credentials

**User Roles**: Supports role-based access (stored in user object)

### 2. Product Management

**Location**: `stores/productsStore.ts`, `app/(tabs)/products.tsx`, `app/product/`

**Features**:
- Create, read, update, delete products
- Barcode scanning for quick product entry
- Product search functionality
- Stock level tracking with alerts
- Category assignment
- Image upload support
- Pricing (unit price, cost price, tax rate)
- SKU and barcode management

**Product Schema**:
```typescript
{
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  unit_price: number;
  cost_price: number;
  current_stock: number;
  minimum_stock: number;
  category?: { id: string; name: string };
  is_active: boolean;
}
```

**Stock Status Logic**:
- **Out of Stock**: `current_stock === 0`
- **Low Stock**: `current_stock <= minimum_stock`
- **In Stock**: `current_stock > minimum_stock`

### 3. Point of Sale (POS)

**Location**: `stores/posStore.ts`, `app/(tabs)/pos.tsx`

**Features**:
- Shopping cart management
- Multiple payment methods (Cash, Card, EFT, Credit)
- Real-time total calculation
- Stock validation before adding to cart
- Customer selection for credit sales
- Transaction processing

**POS Workflow**:
1. **Product Selection**: Browse products and add to cart
2. **Cart Management**: Adjust quantities, remove items
3. **Checkout**: Select payment method
4. **Payment**: Process sale with amount paid
5. **Completion**: Clear cart and return to product selection

**Payment Methods**:
- **CASH**: Immediate payment
- **CARD**: Card payment
- **EFT**: Electronic funds transfer
- **CREDIT**: Customer credit (requires customer selection)

**Business Rules**:
- Cannot add out-of-stock products to cart
- Credit sales require customer association
- Stock is validated at checkout
- Sale creates transaction record and updates inventory

### 4. Dashboard & Analytics

**Location**: `stores/dashboardStore.ts`, `app/(tabs)/index.tsx`

**Metrics Displayed**:
- **Sales Overview**:
  - Today's sales
  - This week's sales
  - This month's sales
- **Stock Alerts**:
  - Low stock count
  - Out of stock count
- **Credit Sales**:
  - Pending sales count
  - Total outstanding debt
- **Top Products**: Best-selling products for the day

**Data Refresh**: Pull-to-refresh functionality for real-time updates

### 5. Category Management

**Location**: `stores/categoriesStore.ts`, `app/categories/`

**Features**:
- Create, update, delete categories
- Product count per category
- Category descriptions
- Modal-based editing interface

**Use Case**: Organize products (e.g., Beverages, Snacks, Electronics)

### 6. Multi-Shop Support

**Location**: `stores/shopStore.ts`

**Features**:
- Manage multiple shop locations
- Switch between shops
- Shop-specific inventory and sales
- Active shop context for all operations

**Implementation**:
- Shop ID sent in `X-Shop-ID` header with every API request
- Auto-select first shop on login
- Shop context persisted in secure storage

## 🔒 Security Features

### Token Management
- **Access Token**: Short-lived, attached to all authenticated requests
- **Refresh Token**: Long-lived, used to obtain new access tokens
- **Automatic Refresh**: Interceptor handles 401 responses and refreshes tokens
- **Queue Management**: Prevents multiple simultaneous refresh requests

### Secure Storage
- **Native Platforms**: Expo SecureStore (encrypted keychain/keystore)
- **Web Platform**: AsyncStorage (browser localStorage)
- **Platform Detection**: Automatic selection based on `Platform.OS`

### API Security
- Bearer token authentication
- Request/response interceptors
- Error handling and retry logic
- Timeout configuration (15 seconds)

## 🎨 UI/UX Design

### Design System (Tamagui)

**Theme Colors**:
- **Primary**: Indigo (#6366F1) - Main brand color
- **Success**: Emerald (#10B981) - Positive actions
- **Warning**: Amber (#F59E0B) - Alerts and cautions
- **Danger**: Red (#EF4444) - Errors and destructive actions
- **Info**: Blue (#3B82F6) - Informational elements

**Component Library**:
- **Button**: 5 variants (primary, secondary, success, danger, ghost)
- **Card**: Elevated cards with hover states
- **StatCard**: Dashboard metric display
- **ListCard**: List item with icon and actions
- **Input**: Form input with label, error, and icon support

### Animations
- **React Native Reanimated**: Smooth, performant animations
- **Entry Animations**: FadeIn, SlideIn with spring physics
- **Gesture Animations**: Press, hover, and swipe interactions
- **Staggered Animations**: Sequential item animations in lists

### Responsive Design
- Adapts to different screen sizes
- Safe area handling for notched devices
- Platform-specific UI adjustments
- Keyboard-aware scrolling

## 📡 API Integration

### Base Configuration

```typescript
baseURL: 'http://10.0.2.2:8000/api/v1'
timeout: 15000
headers: { 'Content-Type': 'application/json' }
```

### Endpoints Used

**Authentication**:
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `POST /auth/refresh/` - Token refresh
- `GET /auth/me/` - Get current user

**Products**:
- `GET /products/` - List products (with search)
- `GET /products/:id/` - Get product details
- `POST /products/` - Create product
- `PUT /products/:id/` - Update product
- `DELETE /products/:id/` - Delete product
- `POST /products/:id/images/` - Upload product image

**Categories**:
- `GET /products/categories/` - List categories
- `POST /products/categories/` - Create category
- `PUT /products/categories/:id/` - Update category
- `DELETE /products/categories/:id/` - Delete category

**Sales**:
- `POST /sales/` - Create sale transaction

**Shops**:
- `GET /shops/` - List shops
- `POST /shops/` - Create shop

**Reports**:
- `GET /reports/dashboard/` - Dashboard analytics

### Request/Response Handling

**Request Interceptor**:
- Attaches access token to Authorization header
- Adds shop ID to X-Shop-ID header
- Logs requests in development mode

**Response Interceptor**:
- Handles 401 errors with automatic token refresh
- Queues failed requests during refresh
- Retries failed requests after successful refresh
- Clears tokens and redirects to login on refresh failure

## 🧪 Testing

### Manual Testing Checklist

**Authentication**:
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Auto-login on app restart
- [ ] Logout functionality

**Products**:
- [ ] Create product with barcode scan
- [ ] Create product manually
- [ ] Edit product details
- [ ] Delete product
- [ ] Search products
- [ ] View product details

**POS**:
- [ ] Add products to cart
- [ ] Update quantities
- [ ] Remove items from cart
- [ ] Process cash sale
- [ ] Process card sale
- [ ] Validate stock levels

**Dashboard**:
- [ ] View sales metrics
- [ ] Check stock alerts
- [ ] View top products
- [ ] Pull to refresh

**Categories**:
- [ ] Create category
- [ ] Edit category
- [ ] Delete category

## 🐛 Known Issues & Limitations

1. **Credit Sales**: Customer selection not yet implemented (feature coming soon)
2. **Image Upload**: Product images can be uploaded but not displayed in all views
3. **Offline Mode**: No offline support; requires active internet connection
4. **Receipt Printing**: Not implemented
5. **Barcode Generation**: Cannot generate barcodes for products
6. **Multi-currency**: Only ZAR (South African Rand) supported
7. **Reports**: Limited to dashboard; no detailed reports or exports

## 🔮 Future Enhancements

### Planned Features
- [ ] Customer management module
- [ ] Credit sales with customer accounts
- [ ] Receipt generation and printing
- [ ] Offline mode with sync
- [ ] Advanced reporting and analytics
- [ ] Barcode generation
- [ ] Multi-currency support
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Stock adjustments and transfers
- [ ] User permissions and roles
- [ ] Push notifications
- [ ] Export data (CSV, PDF)
- [ ] Backup and restore

### Technical Improvements
- [ ] Unit and integration tests
- [ ] E2E testing with Detox
- [ ] Performance optimization
- [ ] Code splitting and lazy loading
- [ ] Error boundary implementation
- [ ] Analytics integration
- [ ] Crash reporting (Sentry)
- [ ] CI/CD pipeline

## 📦 Build & Deployment

### Development Build

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Production Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Web Deployment

```bash
# Build web version
npm run web

# Export static site
npx expo export:web
```

## 🤝 Contributing

### Code Style
- TypeScript strict mode enabled
- ESLint configuration (Expo defaults)
- Functional components with hooks
- Zustand for state management
- File-based routing (Expo Router)

### Commit Guidelines
- Use descriptive commit messages
- Reference issue numbers
- Keep commits atomic and focused

## 📄 License

This project is proprietary software developed for Chisolution Inc.

## 👥 Team - Team Inventory (AIS - UJ)

**Dilane Muluh**
**Sulivan Nyirongo**
**Nick**

## 📞 Support

For issues, questions, or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Platform**: iOS, Android, Web  
**Minimum Requirements**: iOS 13+, Android 6.0+, Modern browsers
