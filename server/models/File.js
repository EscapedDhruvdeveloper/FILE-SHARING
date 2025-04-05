const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');

const FileSchema = new Schema({
  fileID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  shortId: {
    type: String,
    default: shortid.generate,
    unique: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  sharedVia: [{
    method: {
      type: String,
      enum: ['link', 'qrcode', 'email'],
      required: true
    },
    recipient: {
      type: String
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  webViewLink: {
    type: String,
    required: true
  },
  webContentLink: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('File', FileSchema);
