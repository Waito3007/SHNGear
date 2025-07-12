# Environment Variables Setup

## Cách thiết lập biến môi trường

Dự án này sử dụng các biến môi trường để bảo mật thông tin nhạy cảm. Làm theo các bước sau để thiết lập:

### 1. Tạo file .env

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

### 2. Cập nhật các giá trị trong file .env

Mở file `.env` và cập nhật các giá trị sau:

#### Database Configuration

```
DB_SERVER=your_sql_server_instance
DB_NAME=ShnGear
```

#### JWT Configuration

```
JWT_SECRET_KEY=your_strong_secret_key_here
JWT_ISSUER=https://localhost
JWT_AUDIENCE=https://localhost
```

#### Email Configuration (Gmail)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
```

**Lưu ý**: Để sử dụng Gmail SMTP, bạn cần tạo App Password thay vì dùng mật khẩu thông thường.

#### Cloudinary Configuration

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Payment Gateway Configuration

**MoMo:**

```
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
```

**PayPal:**

```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=Sandbox
```

#### AI Configuration (Gemini)

```
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Bảo mật

- File `.env` đã được thêm vào `.gitignore` để không bị commit lên repository
- Không bao giờ chia sẻ file `.env` hoặc các thông tin nhạy cảm
- Trong production, sử dụng environment variables của server thay vì file `.env`

### 4. Fallback Configuration

Nếu không có environment variables, hệ thống sẽ fallback về các giá trị trong `appsettings.json`. Tuy nhiên, `appsettings.json` hiện tại đã được làm rỗng các thông tin nhạy cảm để bảo mật.

### 5. Production Deployment

Trong môi trường production:

1. Không sử dụng file `.env`
2. Thiết lập environment variables trực tiếp trên server
3. Sử dụng services như Azure Key Vault hoặc AWS Secrets Manager cho bảo mật tốt hơn
