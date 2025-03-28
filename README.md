# Quanta Share - File Sharing Application

Quanta Share is a secure file sharing application that allows users to upload, store, and share files with others through links, QR codes, or email.

## Prerequisites

Before running the application, ensure that you have the following installed:

1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. npm or yarn package manager

## Setup and Installation

### 1. MongoDB Setup

Make sure MongoDB is installed and running on your system:

- **For Windows**: MongoDB should be running as a service or you can start it manually using:
  ```
  "C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe" --dbpath="C:\data\db"
  ```

- **For macOS/Linux**: Start MongoDB with:
  ```
  mongod --dbpath /data/db
  ```

### 2. Clone and Install Dependencies

1. Clone the repository:
   ```
   git clone <repository-url>
   cd quanta-share
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

### 3. Environment Configuration

1. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quantashare
   JWT_SECRET=your_secret_key
   ```

### 4. Running the Application

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

3. Access the application in your browser:
   ```
   http://localhost:5173
   ```

## Troubleshooting

### Server Connection Issues

If you see "Server Status: Unreachable" in the client application:

1. Make sure MongoDB is running
2. Check if the server is started and running on port 5000
3. Ensure there are no other processes using port 5000
4. Check if the CORS settings in `server.js` match your client URL

To check for processes using port 5000:
- Windows: `netstat -ano | findstr :5000` and then `taskkill /PID <PID> /F`
- macOS/Linux: `lsof -i :5000` and then `kill -9 <PID>`

### Authentication Issues

If you cannot register or login:

1. Check the server logs for detailed error messages
2. Ensure your MongoDB connection is working
3. Try the "Test Auth" button in the debug panel
4. Clear browser cache and localStorage

## License

This project is licensed under the MIT License - see the LICENSE file for details.
