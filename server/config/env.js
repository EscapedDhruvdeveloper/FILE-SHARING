// Load environment variables from .env file
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Path to .env file
const envPath = path.resolve(__dirname, '../.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Environment variables loaded successfully');
  }
} else {
  console.error(`.env file not found at ${envPath}`);
}

module.exports = process.env;
