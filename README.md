# SHN-Gear E-commerce Platform

**🌐 Language / Ngôn ngữ:**

- **English** (Current) | [Tiếng Việt](README.vi.md)

---

SHN-Gear is a modern, full-stack e-commerce platform built with a robust backend using ASP.NET Core and a dynamic frontend powered by React. The architecture is designed for scalability, performance, and a seamless user experience.

A key highlight of this project is the integration of the Google Gemini API, which powers an intelligent chatbot for customer assistance, enhancing user engagement and automating support services.

## Architectural Overview

| Component             | Technology/Service      | Purpose                                                             |
| --------------------- | ----------------------- | ------------------------------------------------------------------- |
| **Backend Framework** | ASP.NET Core 8          | Building robust, high-performance web APIs and server-side logic.   |
| **Frontend Library**  | React (with Craco)      | Creating a dynamic, responsive, and modern Single Page Application. |
| **Database ORM**      | Entity Framework Core   | Managing data, migrations, and interactions with the SQL database.  |
| **Configuration**     | `.env` file (DotNetEnv) | Managing environment variables for security and flexibility.        |
| **Real-time Engine**  | SignalR                 | Powering real-time features like the AI Chat service.               |
| **AI Service**        | Google Gemini API       | Providing intelligent chatbot capabilities for customer support.    |
| **Authentication**    | JWT (JSON Web Tokens)   | Securing API endpoints and managing user sessions.                  |
| **Payment Gateways**  | PayPal, MoMo            | Offering multiple secure payment options for checkout.              |
| **File Storage**      | Cloudinary              | Handling cloud-based storage and delivery of images and media.      |
| **Styling**           | Tailwind CSS            | Utilizing a utility-first CSS framework for rapid UI development.   |

## Key Features

### 🛒 **E-commerce Core Features**

- **Product Management**: Comprehensive catalog for phones, laptops, and headphones
- **Shopping Cart & Checkout**: Streamlined purchasing process with multiple payment options
- **Order Management**: Complete order tracking and management system
- **User Profiles**: Personalized accounts with order history and preferences
- **Review & Rating System**: Customer feedback and product ratings

### 🤖 **AI-Powered Customer Support (RAG System)**

The platform features an intelligent chatbot powered by **Google Gemini API** with **Retrieval-Augmented Generation (RAG)** capabilities that can access and query the following database tables:

#### **📊 Database Tables Accessible by AI Chatbot:**

- **`Products`** - Product information, specifications, pricing, and availability
- **`Categories`** - Product categories and classification
- **`Brands`** - Brand information and details
- **`ProductSpecifications`** - Detailed technical specifications
- **`Orders`** - Order status, tracking, and history
- **`Reviews`** - Customer reviews and ratings
- **`Users`** - User account information and preferences
- **`ChatMessages`** & **`ChatSessions`** - Conversation history and context
- **`AIKnowledgeBase`** - Pre-defined FAQ and knowledge articles
- **`Vouchers`** - Promotion and discount information
- **`LoyaltyPoints`** - Customer loyalty program data

#### **🧠 AI Capabilities:**

- **Intent Recognition**: Automatically detects customer queries (product search, order status, technical support, etc.)
- **Context Awareness**: Maintains conversation history and user context
- **Product Recommendations**: Suggests products based on user preferences and queries
- **Real-time Assistance**: Live chat support with automated responses
- **Knowledge Base Integration**: Access to comprehensive product and policy information
- **Escalation Handling**: Seamlessly transfers complex queries to human agents

### 💳 **Payment & Loyalty**

- **Multiple Payment Gateways**: PayPal, MoMo, credit cards, and COD
- **Loyalty Program**: Points system with spin wheel rewards
- **Voucher System**: Discount codes and promotional offers

### 🎨 **Modern UI/UX**

- **Responsive Design**: Optimized for all devices using Tailwind CSS
- **Real-time Updates**: Live notifications via SignalR
- **Admin Dashboard**: Comprehensive management interface

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js and npm](https://nodejs.org/en/) (v18.x or later)
- [Git](https://git-scm.com/)
- A database server (e.g., SQL Server, PostgreSQL, or SQLite).

### 1. Backend Setup (ASP.NET Core)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Waito3007/SHNGear.git
    cd SHNGear
    ```

2.  **Configure Environment Variables:**

    - In the project root, create a file named `.env`.
    - Copy the content from `.env.example` and paste it into your new `.env` file.
    - **Crucially, update the variables** in `.env` with your actual credentials and settings. The application reads these variables at runtime.

    **Example `.env` configuration for the database:**

    ```dotenv
    # Database Configuration - Update with your credentials
    DB_SERVER=your_sql_server_address
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_ENCRYPT=True
    DB_TRUST_SERVER_CERTIFICATE=True
    DB_MULTIPLE_ACTIVE_RESULT_SETS=True

    # Update other variables like JWT, Cloudinary, PayPal, etc.
    JWT_SECRET_KEY=your_super_secret_key_that_is_long_and_random
    # ... other settings
    ```

3.  **Apply Database Migrations:**
    Once your `.env` file is configured, use the Entity Framework Core CLI to create the database schema. The application will construct the connection string from your environment variables.

    ```bash
    dotnet ef database update
    ```

4.  **Run the Backend:**
    ```bash
    dotnet run
    ```
    The API will start, typically at `https://localhost:7032`.

### 2. Frontend Setup (React)

1.  **Navigate to the ClientApp directory:**

    ```bash
    cd ClientApp
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    - Create a file named `.env.development.local` in the `ClientApp` directory.
    - Add the following line, ensuring the URL matches your running backend API.

    ```
    REACT_APP_API_BASE_URL=https://localhost:7032
    ```

4.  **Run the Frontend:**
    ```bash
    npm start
    ```
    The React application will open at `http://localhost:3000`.

## 🤖 AI Chatbot & RAG System

### Overview

The SHN-Gear platform features an advanced AI-powered chatbot that uses **Retrieval-Augmented Generation (RAG)** to provide intelligent customer support. The system combines the power of Google Gemini API with a comprehensive knowledge base to deliver accurate, contextual responses.

### Database Tables Accessible by AI

The chatbot can read and query the following database tables to provide comprehensive assistance:

| Table                           | Purpose                | AI Usage                                         |
| ------------------------------- | ---------------------- | ------------------------------------------------ |
| `Products`                      | Product catalog        | Product recommendations, specifications, pricing |
| `Categories`                    | Product classification | Category-based searches and filtering            |
| `Brands`                        | Brand information      | Brand-specific queries and comparisons           |
| `ProductSpecifications`         | Technical details      | Detailed technical support and comparisons       |
| `Orders`                        | Order management       | Order status, tracking, history queries          |
| `Reviews`                       | Customer feedback      | Product quality insights and recommendations     |
| `Users`                         | User profiles          | Personalized recommendations and support         |
| `ChatMessages` & `ChatSessions` | Conversation data      | Context maintenance and conversation flow        |
| `AIKnowledgeBase`               | FAQ and policies       | Standard responses and policy information        |
| `Vouchers`                      | Promotions             | Discount information and promotional offers      |
| `LoyaltyPoints`                 | Loyalty program        | Points balance and reward information            |

### How It Works

1. **Intent Recognition**: AI analyzes user messages to understand their intent
2. **Knowledge Retrieval**: System queries relevant database tables and knowledge base
3. **Context Building**: Combines retrieved information with conversation history
4. **Response Generation**: Google Gemini generates contextual, accurate responses
5. **Confidence Scoring**: System evaluates response quality and escalates when needed

### Key Capabilities

- **Real-time Product Search**: Instant product recommendations and comparisons
- **Order Support**: Check order status, tracking, and delivery information
- **Technical Assistance**: Detailed product specifications and troubleshooting
- **Policy Information**: Shipping, returns, warranty, and payment policies
- **Conversation Memory**: Maintains context throughout the conversation
- **Escalation Handling**: Seamlessly transfers to human agents when needed

## Project Structure

```
SHNGear-2/
├── 📁 Controllers/           # API Controllers
│   ├── AuthController.cs     # Authentication & authorization
│   ├── ProductsController.cs # Product management
│   ├── ChatController.cs     # AI Chat functionality
│   ├── OrderController.cs    # Order processing
│   └── ...                   # Other API endpoints
│
├── 📁 Services/              # Business Logic Layer
│   ├── AIService.cs          # Core AI processing & intent recognition
│   ├── GeminiService.cs      # Google Gemini API integration
│   ├── ChatService.cs        # Chat management & SignalR
│   ├── KnowledgeBaseService.cs # RAG knowledge retrieval
│   └── ...                   # Other business services
│
├── 📁 Models/                # Database Models
│   ├── Products.cs           # Product entity
│   ├── AIKnowledgeBase.cs    # AI knowledge base
│   ├── ChatMessage.cs        # Chat messages
│   ├── ChatSession.cs        # Chat sessions
│   └── ...                   # Other entities
│
├── 📁 Data/                  # Database Context & Knowledge Base
│   ├── AppDbContext.cs       # EF Core database context
│   └── WebsiteKnowledgeBase.json # AI knowledge base file
│
├── 📁 ClientApp/             # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API integration
│   │   └── utils/           # Utility functions
│   └── ...
│
├── 📁 Hubs/                  # SignalR Hubs
│   └── ChatHub.cs           # Real-time chat communication
│
├── 📁 Migrations/            # EF Core Database Migrations
├── 📁 DTOs/                  # Data Transfer Objects
├── 📁 Configuration/         # App configuration
└── 📁 Docs/                  # Documentation
    ├── 06_AI_Chat_Service.md # AI service documentation
    └── ...                   # Other documentation files
```

---

## 📚 Additional Resources

- **[AI Chat Service Documentation](Docs/06_AI_Chat_Service.md)** - Detailed AI service implementation
- **[Frontend Documentation](Docs/Frontend/)** - React components and state management
- **[Backend Services](Docs/09_Backend_Services_And_Middleware.md)** - Service layer architecture

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🌐 Language / Ngôn ngữ:**

- **English** (Current) | [Tiếng Việt](README.vi.md)

_This document provides comprehensive setup instructions and technical details for the SHN-Gear e-commerce platform with AI-powered customer support._
