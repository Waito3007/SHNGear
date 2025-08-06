# SHN-Gear E-commerce Platform

SHN-Gear is a modern, full-stack e-commerce platform built with a robust backend using ASP.NET Core and a dynamic frontend powered by React. The architecture is designed for scalability, performance, and a seamless user experience.

A key highlight of this project is the integration of the Google Gemini API, which powers an intelligent chatbot for customer assistance, enhancing user engagement and automating support services.

## Architectural Overview

| Component             | Technology/Service                               | Purpose                                                              |
| --------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| **Backend Framework** | ASP.NET Core 8                                   | Building robust, high-performance web APIs and server-side logic.    |
| **Frontend Library**  | React (with Craco)                               | Creating a dynamic, responsive, and modern Single Page Application.  |
| **Database ORM**      | Entity Framework Core                            | Managing data, migrations, and interactions with the SQL database.   |
| **Configuration**     | `.env` file (DotNetEnv)                          | Managing environment variables for security and flexibility.         |
| **Real-time Engine**  | SignalR                                          | Powering real-time features like the AI Chat service.                |
| **AI Service**        | Google Gemini API                                | Providing intelligent chatbot capabilities for customer support.     |
| **Authentication**    | JWT (JSON Web Tokens)                            | Securing API endpoints and managing user sessions.                   |
| **Payment Gateways**  | PayPal, MoMo                                     | Offering multiple secure payment options for checkout.               |
| **File Storage**      | Cloudinary                                       | Handling cloud-based storage and delivery of images and media.       |
| **Styling**           | Tailwind CSS                                     | Utilizing a utility-first CSS framework for rapid UI development.    |

## Key Features

(Features remain the same as previous version)

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js and npm](https://nodejs.org/en/) (v18.x or later)
- [Git](https://git-scm.com/)
- A database server (e.g., SQL Server, PostgreSQL, or SQLite).

### 1. Backend Setup (ASP.NET Core)

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd SHNGear-2
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

## Project Structure

(Project structure remains the same as previous version)

---
*This document has been updated with detailed, environment-based configuration instructions.*
