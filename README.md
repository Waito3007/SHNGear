# SHN Gear - Nền tảng Thương mại Điện tử Công nghệ

## 📖 Tổng quan

SHN Gear là một nền tảng thương mại điện tử toàn diện chuyên về các sản phẩm công nghệ như điện thoại, laptop, tai nghe và phụ kiện. Dự án được xây dựng với kiến trúc fullstack hiện đại, cung cấp trải nghiệm mua sắm trực tuyến hoàn chỉnh với giao diện quản trị tiên tiến.

## 🌟 Tính năng chính

### 🛍️ Tính năng dành cho Khách hàng

- **Xác thực người dùng**: Đăng ký, đăng nhập với JWT Authentication
- **Quản lý sản phẩm**: Duyệt sản phẩm theo danh mục, thương hiệu với bộ lọc tìm kiếm
- **Giỏ hàng thông minh**: Thêm/xóa sản phẩm, áp dụng voucher giảm giá
- **Thanh toán đa dạng**:
  - Tiền mặt (COD)
  - MoMo Wallet
  - PayPal
- **Quản lý đơn hàng**: Theo dõi trạng thái đơn hàng realtime
- **Hệ thống đánh giá**: Đánh giá và nhận xét sản phẩm
- **Chương trình loyalty**: Tích điểm, sử dụng voucher
- **Quản lý hồ sơ**: Thông tin cá nhân, sổ địa chỉ

### 🎯 Tính năng dành cho Quản trị viên

- **Dashboard tổng quan**: Thống kê doanh thu, đơn hàng, người dùng
- **Quản lý sản phẩm**: CRUD sản phẩm, variant, thông số kỹ thuật
- **Quản lý người dùng**: Phân quyền, kích hoạt/vô hiệu hóa tài khoản
- **Quản lý đơn hàng**: Xem, cập nhật trạng thái, xuất báo cáo
- **Phân tích dữ liệu**: Biểu đồ doanh thu, phân bố sản phẩm, hành vi người dùng
- **Quản lý nội dung**: Tùy chỉnh trang chủ, banner, khuyến mại
- **Hệ thống voucher**: Tạo và quản lý mã giảm giá

## 🏗️ Kiến trúc Công nghệ

### Backend (ASP.NET Core 6)

```
SHN-Gear/
├── Controllers/          # API Controllers
├── Models/              # Entity Models
├── DTOs/                # Data Transfer Objects
├── Services/            # Business Logic Services
├── Data/                # Database Context & Migrations
├── Migrations/          # Entity Framework Migrations
└── Program.cs           # Application Entry Point
```

### Frontend (React 18)

```
ClientApp/
├── src/
│   ├── components/      # React Components
│   │   ├── Admin/       # Admin Dashboard Components
│   │   ├── Auth/        # Authentication Components
│   │   ├── Navbar/      # Navigation Components
│   │   └── ...
│   ├── pages/           # Page Components
│   ├── services/        # API Services
│   └── utils/           # Utility Functions
├── public/              # Static Assets
└── package.json         # Dependencies
```

### Cơ sở dữ liệu (SQL Server)

- **Entity Framework Core** với Code-First approach
- **SQL Server Express** với connection string cấu hình
- **Migration system** cho version control database

## 🛠️ Công nghệ sử dụng

### Backend Stack

- **Framework**: ASP.NET Core 6.0
- **Database**: SQL Server Express with Entity Framework Core
- **Authentication**: JWT Bearer Token
- **Payment Integration**:
  - MoMo Payment Gateway
  - PayPal SDK
- **Cloud Storage**: Cloudinary (Image management)
- **Email Service**: SMTP Gmail integration
- **Session Management**: Distributed Memory Cache

### Frontend Stack

- **Framework**: React 18.2.0
- **State Management**: React Hooks, SWR for data fetching
- **UI Libraries**:
  - Material-UI (MUI) 6.4.5
  - Ant Design 5.24.5
  - Tailwind CSS 3.0
  - Flowbite React
- **Animations**: Framer Motion 12.4.7
- **Charts**: Recharts 2.15.1
- **Form Handling**: React Hook Form 7.54.2
- **HTTP Client**: Axios 1.7.9
- **Routing**: React Router DOM 7.2.0

### DevOps & Tools

- **Version Control**: Git
- **Package Manager**: npm
- **Build Tool**: React Scripts 5.0.1
- **Development**: Visual Studio Code / Visual Studio
- **API Testing**: Swagger UI (Development)

## ⚙️ Cài đặt và Triển khai

### Yêu cầu hệ thống

- **Node.js** >= 16.0.0
- **.NET 6 SDK**
- **SQL Server Express** hoặc SQL Server
- **Visual Studio 2022** hoặc VS Code
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd SHNGear-2
```

### 2. Cấu hình Backend

#### a. Cài đặt Dependencies

```bash
# Restore NuGet packages
dotnet restore
```

#### b. Cấu hình Database

1. Cập nhật connection string trong `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=ShnGear;Trusted_Connection=True;MultipleActiveResultSets=False;TrustServerCertificate=True"
  }
}
```

2. Chạy migrations:

```bash
dotnet ef database update
```

#### c. Cấu hình Environment Variables

Cập nhật các cấu hình trong `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "https://localhost",
    "Audience": "https://localhost"
  },
  "EmailSettings": {
    "SMTPHost": "smtp.gmail.com",
    "SMTPPort": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderPassword": "your-app-password"
  },
  "Cloudinary": {
    "CloudName": "your-cloudinary-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  },
  "MoMoConfig": {
    "PartnerCode": "your-partner-code",
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key",
    "ApiEndpoint": "https://test-payment.momo.vn/v2/gateway/api/create",
    "ReturnUrl": "https://localhost:7107/api/payment/momo/return",
    "NotifyUrl": "https://localhost:7107/api/payment/momo/callback"
  },
  "PayPal": {
    "ClientId": "your-paypal-client-id",
    "Secret": "your-paypal-secret",
    "Mode": "Sandbox"
  }
}
```

### 3. Cấu hình Frontend

#### a. Navigate to ClientApp

```bash
cd ClientApp
```

#### b. Cài đặt Dependencies

```bash
npm install
```

#### c. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `ClientApp`:

```env
REACT_APP_API_BASE_URL=https://localhost:7107
HTTPS=true
SSL_CRT_FILE=path/to/cert.crt
SSL_KEY_FILE=path/to/cert.key
```

### 4. Chạy Ứng dụng

#### Development Mode

```bash
# Terminal 1: Chạy Backend
dotnet run

# Terminal 2: Chạy Frontend
cd ClientApp
npm start
```

#### Production Build

```bash
# Build Frontend
cd ClientApp
npm run build

# Publish Backend
dotnet publish -c Release -o ./publish
```

### 5. Truy cập Ứng dụng

- **Frontend**: https://localhost:44479
- **Backend API**: https://localhost:7107
- **Swagger Documentation**: https://localhost:7107/swagger (Development only)

## 📁 Cấu trúc Database

### Core Entities

```sql
-- Users & Authentication
Users (Id, FullName, Email, PhoneNumber, Password, RoleId, IsActive, ...)
Roles (Id, Name)

-- Product Management
Products (Id, Name, Description, CategoryId, BrandId, CreatedAt)
Categories (Id, Name, Description, Image)
Brands (Id, Name, Description, Logo)
ProductVariants (Id, ProductId, Color, Storage, Price, DiscountPrice, StockQuantity)
ProductImages (Id, ProductId, ImageUrl, IsPrimary)

-- Specifications
PhoneSpecifications (Id, ProductId, CPUModel, RAM, InternalStorage, ...)
LaptopSpecifications (Id, ProductId, CPUType, RAM, SSDStorage, ...)
HeadphoneSpecifications (Id, ProductId, Type, ConnectionType, Port, ...)

-- E-commerce
Carts (Id, UserId, CreatedAt, UpdatedAt)
CartItems (Id, CartId, ProductVariantId, Quantity)
Orders (Id, UserId, AddressId, PaymentMethodId, TotalAmount, OrderStatus, ...)
OrderItems (Id, OrderId, ProductVariantId, Quantity, Price)

-- Support Features
Addresses (Id, UserId, FullName, AddressLine1, City, State, Country, ...)
PaymentMethods (Id, Name, Description)
Vouchers (Id, Code, DiscountAmount, ExpiryDate, IsActive)
Reviews (Id, ProductVariantId, UserId, Rating, Comment, CreatedAt)
```

## 🔌 API Documentation

### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/request-otp
POST /api/auth/verify-otp
```

### Product Endpoints

```http
GET    /api/products              # Get all products
GET    /api/products/{id}         # Get product by ID
POST   /api/products              # Create product (Admin)
PUT    /api/products/{id}         # Update product (Admin)
DELETE /api/products/{id}         # Delete product (Admin)
GET    /api/products/category/{id} # Get products by category
```

### Order Endpoints

```http
GET  /api/orders                 # Get user orders
POST /api/orders                 # Create new order
GET  /api/orders/{id}            # Get order details
PUT  /api/orders/{id}/status     # Update order status (Admin)
```

### Payment Endpoints

```http
POST /api/payment/momo/create    # Create MoMo payment
POST /api/payment/momo/callback  # MoMo payment callback
POST /api/paypal/create          # Create PayPal payment
POST /api/paypal/execute         # Execute PayPal payment
```

### Cart Endpoints

```http
GET    /api/cart                 # Get user cart
POST   /api/cart/add             # Add item to cart
PUT    /api/cart/update          # Update cart item
DELETE /api/cart/remove/{id}     # Remove cart item
```

## 🛡️ Bảo mật

### Authentication & Authorization

- **JWT Token Authentication** với expire time
- **Role-based Authorization** (Admin, VIP levels)
- **Password hashing** với BCrypt
- **CORS Policy** được cấu hình cho production

### Data Protection

- **SQL Injection Protection** với Entity Framework
- **XSS Protection** với input validation
- **HTTPS Enforcement** cho production
- **Input Validation** với DTOs

### Payment Security

- **PCI DSS Compliance** thông qua third-party gateways
- **Secure Token Storage** cho payment transactions
- **Webhook Verification** cho payment callbacks

## 🔧 Bảo trì và Monitoring

### Health Checks

```http
GET /health              # Application health status
GET /api/version         # API version information
```

### Logging

- **Structured Logging** với Serilog
- **Error Tracking** với application insights
- **Performance Monitoring** cho database queries

### Backup Strategy

- **Automated Database Backups** hàng ngày
- **File Storage Backup** cho Cloudinary assets
- **Configuration Backup** cho application settings

## 🚀 Deployment Guide

### Production Deployment

#### 1. Azure App Service (Recommended)

```bash
# Build and publish
dotnet publish -c Release

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name myAppName \
  --src myapp.zip
```

#### 2. Docker Deployment

```dockerfile
# Dockerfile example
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY ./publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "SHN-Gear.dll"]
```

#### 3. IIS Deployment

1. Install .NET 6 Hosting Bundle
2. Publish application với `dotnet publish`
3. Copy files to IIS wwwroot
4. Configure Application Pool (.NET CLR Version: No Managed Code)

### Environment Configuration

#### Production Settings

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  },
  "AllowedHosts": "yourdomain.com",
  "ConnectionStrings": {
    "DefaultConnection": "production-connection-string"
  }
}
```

## 📊 Performance Optimization

### Backend Optimizations

- **Entity Framework Query Optimization** với Include statements
- **Split Query Behavior** cho complex joins
- **Response Caching** cho static data
- **Database Indexing** cho search queries

### Frontend Optimizations

- **Code Splitting** với React.lazy
- **Image Optimization** với Cloudinary transformations
- **Bundle Optimization** với Webpack
- **Memoization** với React.memo và useMemo

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check connection string
dotnet ef database list

# Update database
dotnet ef database update
```

#### 2. HTTPS Certificate Issues

```bash
# Trust development certificate
dotnet dev-certs https --trust
```

#### 3. Frontend Build Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Payment Gateway Issues

- Verify API keys in configuration
- Check webhook endpoints accessibility
- Validate callback URLs

## 🤝 Contributing

### Development Workflow

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Standards

- **C# Conventions**: Follow Microsoft .NET conventions
- **React Standards**: Use ESLint and Prettier configurations
- **Database**: Use Entity Framework migrations for schema changes
- **Testing**: Write unit tests for business logic

## 📞 Support & Contact

### Technical Support

- **Email**: shngearvn@gmail.com
- **Documentation**: [Internal Wiki]
- **Issue Tracking**: GitHub Issues

### Development Team

- **Backend Lead**: ASP.NET Core developers
- **Frontend Lead**: React developers
- **DevOps**: Azure/AWS specialists
- **QA**: Testing and quality assurance

## 📄 License

This project is proprietary software developed for SHN Gear e-commerce platform.

## 🔄 Version History

### v2.0.0 (Current)

- Complete fullstack architecture
- Multi-payment gateway integration
- Advanced admin dashboard
- Homepage management system
- Mobile-responsive design

### v1.0.0

- Initial e-commerce platform
- Basic product management
- User authentication
- Simple payment integration

---

## 📝 Additional Notes

### Database Seeding

Default roles and payment methods are automatically seeded:

- **Roles**: Admin, VIP 1, VIP 2, VIP 3
- **Payment Methods**: Tiền Mặt, MoMo, PayPal

### Development Tips

- Use Swagger UI for API testing during development
- Enable hot reload for both frontend and backend
- Use Entity Framework tools for database management
- Monitor application logs for debugging

### Production Checklist

- [ ] Update all API keys and secrets
- [ ] Configure production database
- [ ] Set up HTTPS certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test payment gateway integrations
- [ ] Verify email service configuration

This README provides comprehensive documentation for the SHN Gear e-commerce platform. For specific implementation details, refer to the codebase and inline documentation.
