# Ecommerce Project

This is a MERN stack-based ecommerce project that automates the process of managing product inventory and orders. It provides a web interface for users to browse products, place orders, and for administrators to manage the inventory and orders.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication and authorization
- Product listing and detail pages
- Shopping cart functionality
- Order placement and management
- Admin dashboard for managing products and orders
- Responsive design for mobile and desktop

## Technologies Used
**Frontend:**
- React
- Redux
- Bootstrap
- Axios

**Backend:**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (JSON Web Tokens) for authentication

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/iamasadabbas/Ecommerce.git
    cd Ecommerce
    ```

2. Install the dependencies for both backend and frontend:
    ```sh
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

3. Create a `.env` file in the `backend` directory and add the following environment variables:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

## Usage

1. Start the backend server:
    ```sh
    cd backend
    npm run dev
    ```

2. Start the frontend development server:
    ```sh
    cd ../frontend
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## API Endpoints

### Authentication
- `POST /api/users/login` - Authenticate user and get token
- `POST /api/users/register` - Register a new user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/myorders` - Get logged in user's orders

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
