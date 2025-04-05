const stream = require("stream");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();

const KEYFILEPATH = path.join(__dirname, "cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// Initialize the Google Drive API
const initializeAuth = () => {
  try {
    // Check if credentials file exists
    if (!fs.existsSync(KEYFILEPATH)) {
      console.error(`Google Drive credentials file not found at: ${KEYFILEPATH}`);
      throw new Error(`Credentials file not found at ${KEYFILEPATH}`);
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });

    return auth;
  } catch (error) {
    console.error('Error initializing Google Drive auth:', error);
    throw error;
  }
};

// Get drive instance with fresh auth
const getDrive = () => {
  const auth = initializeAuth();
  return google.drive({ version: "v3", auth });
};
 

exports.getFileById = async(fileId) => {
  try {
    console.log(`Getting file with ID: ${fileId}`);
    const drive = getDrive();
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, createdTime, webViewLink, webContentLink',
    });
    
    // If file doesn't have webContentLink, update permissions and fetch again
    if (!response.data.webContentLink) {
      try {
        // Update permissions to make file publicly accessible
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });
        
        // Get updated file with webContentLink
        const updatedResponse = await drive.files.get({
          fileId: fileId,
          fields: 'id, name, mimeType, size, createdTime, webViewLink, webContentLink',
        });
        
        return updatedResponse.data;
      } catch (permError) {
        console.error(`Error updating permissions for file ${fileId}:`, permError);
        return response.data;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting file by ID:', error);
    return { error: error.message };
  }
}

exports.getFiles = async (folderId) => {
  try {
    console.log(`Getting files from folder: ${folderId}`);
    const drive = getDrive();
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, size, mimeType, createdTime, webViewLink, webContentLink)",
    });
    
    // If files don't have webContentLink, update permissions and fetch again
    const files = response.data.files;
    for (let i = 0; i < files.length; i++) {
      if (!files[i].webContentLink) {
        try {
          // Update permissions to make file publicly accessible
          await drive.permissions.create({
            fileId: files[i].id,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            }
          });
          
          // Get updated file with webContentLink
          const updatedFile = await drive.files.get({
            fileId: files[i].id,
            fields: 'id, name, size, mimeType, createdTime, webViewLink, webContentLink'
          });
          
          // Replace the file in the array
          files[i] = updatedFile.data;
        } catch (permError) {
          console.error(`Error updating permissions for file ${files[i].id}:`, permError);
        }
      }
    }
    
    console.log(`Found ${files.length} files`);
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    return { error: error.message };
  }
};

exports.deleteFile = async (id) => {
  try {
    console.log(`Deleting file with ID: ${id}`);
    const drive = getDrive();
    await drive.files.delete({ fileId: id });
    return { message: "File deleted successfully!" };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error: error.message };
  }
};

// Create folder
exports.createFolder = async (username) => {
  try {
    console.log(`Creating folder for user: ${username}`);
    const drive = getDrive();
    const folderName = username;
    const parentFolderId = process.env.PARENT_FOLDER_ID;
    
    if (!parentFolderId) {
      throw new Error('PARENT_FOLDER_ID not defined in environment variables');
    }
    
    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id, name",
    });
    
    console.log(`Folder created with ID: ${response.data.id}`);
    return { message: "Folder created successfully", folderId: response.data.id };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { error: error.message };
  }
};


// Upload file to Drive
exports.uploadFileToDrive = async(fileObject, folderId) => {
  try {
    console.log(`Uploading file: ${fileObject.originalname} to folder: ${folderId}`);
    
    if (!folderId) {
      throw new Error("Folder ID is required");
    }
    
    const drive = getDrive();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    
    // Create the file
    const { data } = await drive.files.create({
      media: {
        mimeType: fileObject.mimeType,
        body: bufferStream,
      },
      requestBody: {
        name: fileObject.originalname,
        parents: [folderId],
      },
      fields: "id,name,size,webViewLink,webContentLink",
    });
    
    // Make the file accessible for anyone with the link
    await drive.permissions.create({
      fileId: data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    console.log('File permissions updated to be publicly accessible');
    
    // Get the updated file with webContentLink
    const updatedFile = await drive.files.get({
      fileId: data.id,
      fields: 'id,name,size,webViewLink,webContentLink'
    });
    
    console.log(`Uploaded file ${updatedFile.data.name} with ID: ${updatedFile.data.id}, size: ${updatedFile.data.size}`);
    return updatedFile.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

exports.uploadFiles = async (folderId, file) => {
  try {
    if (!folderId) {
      return { error: "Folder ID is required" };
    }
    
    const uploadData = await this.uploadFileToDrive(file, folderId);
    return uploadData;
  } catch (error) {
    console.error("Error in uploadFiles:", error);
    return { error: error.message };
  }
};
