const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('../config/env');

// Path to the credentials file
const CREDENTIALS_PATH = path.join(__dirname, 'cred.json');

// Check if credentials file exists
if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error(`Google Drive credentials file not found at: ${CREDENTIALS_PATH}`);
  process.exit(1);
}

// Initialize the Google Drive API
const initializeDrive = () => {
  try {
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive']
    );
    
    // Create Drive client
    const drive = google.drive({ version: 'v3', auth });
    
    console.log('Google Drive API initialized successfully');
    return drive;
  } catch (error) {
    console.error('Error initializing Google Drive API:', error);
    throw error;
  }
};

// Get parent folder ID from environment variables
const getParentFolderId = () => {
  const parentFolderId = process.env.PARENT_FOLDER_ID;
  
  if (!parentFolderId) {
    console.error('PARENT_FOLDER_ID environment variable is not set');
    throw new Error('PARENT_FOLDER_ID environment variable is not set');
  }
  
  return parentFolderId;
};

// Create a folder in Google Drive
const createFolder = async (folderName) => {
  try {
    const drive = initializeDrive();
    const parentFolderId = getParentFolderId();
    
    console.log(`Creating folder "${folderName}" in parent folder: ${parentFolderId}`);
    
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };
    
    const response = await drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    
    console.log(`Folder created with ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error);
    throw error;
  }
};

// Upload a file to Google Drive
const uploadFile = async (filePath, fileName, folderId) => {
  try {
    const drive = initializeDrive();
    
    console.log(`Uploading file "${fileName}" to folder: ${folderId}`);
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };
    
    const media = {
      body: fs.createReadStream(filePath)
    };
    
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });
    
    console.log(`File uploaded with ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};

// List files in a folder
const listFiles = async (folderId) => {
  try {
    const drive = initializeDrive();
    
    console.log(`Listing files in folder: ${folderId}`);
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, createdTime, size)'
    });
    
    console.log(`Found ${response.data.files.length} files`);
    return response.data.files;
  } catch (error) {
    console.error('Error listing files in Google Drive folder:', error);
    throw error;
  }
};

module.exports = {
  initializeDrive,
  createFolder,
  uploadFile,
  listFiles,
  getParentFolderId
};