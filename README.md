# Quanta Share - Secure File Sharing Application

Quanta Share is a modern, secure file sharing application that allows users to upload, store, and share files through multiple channels including links, QR codes, and email. The application uses Google Drive API for reliable storage and provides an intuitive user interface for easy file management.

## Project Overview

### Key Features

- **User Authentication**: Secure login and registration system
- **File Upload/Storage**: Store files securely on Google Drive
- **File Sharing Options**:
  - Generate shareable links
  - Create QR codes for quick sharing
  - Email files directly to recipients
- **File Management**: Download, share, or delete files
- **Storage Monitoring**: Track storage usage with a visual indicator

## Project Structure

```
quanta-share/
├── client/                 # React frontend
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       │   ├── QuantaFileList.jsx    # Files listing component
│       │   ├── QuantaFileUploader.jsx # File upload component 
│       │   ├── QuantaShareModal.jsx  # File sharing modal
│       │   └── ...
│       ├── context/        # React context for state management
│       │   └── AuthContext.jsx       # Authentication state
│       ├── emailService/   # Email utility services
│       ├── pages/          # Main page components
│       │   ├── Auth.jsx               # Login/Register page
│       │   └── QuantaDashboardV2.jsx  # Main dashboard
│       ├── QuantaApp.jsx   # Main application component
│       └── index.js        # Application entry point
│
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   │   ├── authController.js         # Authentication logic
│   │   └── fileController.js         # File operations logic
│   ├── google-drive_services/ # Google Drive integration
│   │   ├── cred.json              # Google API credentials (to be added)
│   │   └── driveServices.js       # Drive API wrapper
│   ├── middleware/         # Express middleware
│   │   └── auth.js                 # JWT authentication
│   ├── models/             # MongoDB schemas
│   │   ├── File.js                 # File data model
│   │   └── User.js                 # User data model
│   ├── routes/             # API routes
│   │   ├── auth.js                 # Authentication routes
│   │   └── files.js                # File operation routes
│   └── server.js           # Express server entry point
```

## Application Flow

1. **Authentication**:
   - User registers or logs in via the Auth page
   - JWT token is generated and stored for authenticated requests

2. **Dashboard**:
   - After authentication, users are directed to the dashboard
   - Storage usage is displayed at the top
   - Users can switch between "Upload" and "My Files" tabs

3. **File Upload**:
   - User selects a file to upload
   - File is sent to the server and then stored on Google Drive
   - File metadata is saved in MongoDB
   - Files list is updated

4. **File Sharing**:
   - User selects a file and chooses a sharing method (link, QR code, email)
   - For links: A shareable link is generated and copied to clipboard
   - For QR codes: A QR code is generated containing the download link
   - For email: User enters recipient's email and a message

5. **File Download**:
   - User can download their own files
   - Download links are generated for shared files
   - Download count is tracked for each file

## External Services Configuration

### 1. Google Cloud Setup

This application uses Google Drive API for file storage. To set up:

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Drive API

2. **Create Service Account Credentials**:
   - In your Google project, go to "APIs & Services" > "Credentials"
   - Create a Service Account
   - Generate and download a JSON key file for this service account
   - Rename this file to `cred.json`

3. **Create a Parent Folder in Google Drive**:
   - Create a folder in Google Drive where all user files will be stored
   - Share this folder with the service account email (giving it "Editor" access)
   - Note the Folder ID from the URL (the long string after /folders/ in the Drive URL)

4. **Add Credentials to Project**:
   - Place the `cred.json` file in the `server/google-drive_services/` directory
   - Add the parent folder ID to your .env file:
     ```
     PARENT_FOLDER_ID=your_folder_id_here
     ```

### 2. Email Service Setup

For email sharing functionality, configure a Gmail account:

1. **Gmail Account**:
   - Create a Gmail account to be used for sending emails
   - Enable "Less secure app access" or generate an App Password
   - Add to your .env file:
     ```
     EMAIL_USER=your_gmail_address
     EMAIL_PASS=your_app_password
     ```

Note: For production, consider using a transactional email service like SendGrid or Mailgun.

## Prerequisites

Before running the application, ensure that you have the following installed:

1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. npm or yarn package manager

## Setup and Installation

### 1. MongoDB Setup

Make sure MongoDB is installed and running on your system:

- **For Windows**: MongoDB should be running as a service or start it manually:
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
   git clone https://github.com/yourusername/quanta-share.git
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

Create a `.env` file in the server directory with the following content:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/quantashare

# JWT Secret
JWT_SECRET=your_long_random_secret_key

# Google Drive
PARENT_FOLDER_ID=your_google_drive_folder_id

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
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
   http://localhost:3000
   ```

## Troubleshooting

### Server Connection Issues

If you encounter connection issues:

1. Make sure MongoDB is running
2. Check if the server is started and running on port 5000
3. Ensure there are no other processes using port 5000
4. Check if the CORS settings in `server.js` match your client URL

### Google Drive API Issues

If files are not uploading to Google Drive:

1. Verify your `cred.json` file is in the correct location
2. Ensure the service account has access to the parent folder
3. Check the server logs for detailed error messages

### Email Sending Issues

If emails are not being sent:

1. Make sure your Gmail credentials are correct
2. If using Gmail, ensure "Less secure app access" is enabled or you're using an App Password
3. Check server logs for SMTP errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.
