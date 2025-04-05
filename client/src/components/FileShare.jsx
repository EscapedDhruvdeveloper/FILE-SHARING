import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './FileShare.css';

const FileShare = ({ file }) => {
  const [shareMethod, setShareMethod] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async (method) => {
    try {
      setIsLoading(true);
      
      // If already showing this method, toggle it off
      if (shareMethod === method) {
        setShareMethod(null);
        setQrCode(null);
        setDownloadUrl(null);
        setIsLoading(false);
        return;
      }
      
      setShareMethod(method);
      
      // For email method, just show the input field first
      if (method === 'email' && !recipient) {
        setIsLoading(false);
        return;
      }
      
      const payload = {
        method,
        recipient: method === 'email' ? recipient : null
      };
      
      const response = await axios.post(`/api/files/${file._id}/share`, payload);
      
      if (response.data) {
        setDownloadUrl(response.data.downloadUrl);
        
        if (method === 'qrcode') {
          setQrCode(response.data.qrCode);
        }
        
        toast.success(`File shared via ${method} successfully`);
      }
    } catch (error) {
      console.error(`Error sharing file via ${method}:`, error);
      toast.error(`Failed to share file via ${method}`);
      setShareMethod(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const sendEmail = async () => {
    if (!recipient) {
      toast.error('Please enter recipient email');
      return;
    }
    
    await handleShare('email');
  };

  return (
    <div className="file-share-container">
      <div className="share-buttons">
        <button 
          className={`share-btn ${shareMethod === 'link' ? 'active' : ''}`}
          onClick={() => handleShare('link')}
          disabled={isLoading}
        >
          Share Link
        </button>
        <button 
          className={`share-btn ${shareMethod === 'qrcode' ? 'active' : ''}`}
          onClick={() => handleShare('qrcode')}
          disabled={isLoading}
        >
          QR Code
        </button>
        <button 
          className={`share-btn ${shareMethod === 'email' ? 'active' : ''}`}
          onClick={() => handleShare('email')}
          disabled={isLoading}
        >
          Email
        </button>
      </div>
      
      {isLoading && (
        <div className="share-result">
          <p>Loading...</p>
        </div>
      )}
      
      {!isLoading && shareMethod === 'link' && downloadUrl && (
        <div className="share-result">
          <p>Share this link:</p>
          <div className="link-container">
            <input 
              type="text" 
              value={downloadUrl} 
              readOnly 
              className="link-input"
            />
            <button onClick={copyToClipboard} className="copy-btn">
              Copy
            </button>
          </div>
        </div>
      )}
      
      {!isLoading && shareMethod === 'qrcode' && qrCode && (
        <div className="share-result">
          <p>Scan this QR code to download:</p>
          <div className="qr-container">
            <img src={qrCode} alt="QR Code" className="qr-image" />
            <a 
              href={qrCode} 
              download="qrcode.png" 
              className="download-qr-btn"
            >
              Download QR
            </a>
          </div>
        </div>
      )}
      
      {!isLoading && shareMethod === 'email' && (
        <div className="share-result">
          <div className="email-input-container">
            <input
              type="email"
              placeholder="Recipient's email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="email-input"
            />
            <button 
              onClick={sendEmail}
              className="send-email-btn"
              disabled={!recipient || isLoading}
            >
              Send
            </button>
          </div>
          {downloadUrl && (
            <p className="email-sent-message">Email sent successfully to {recipient}!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileShare;
