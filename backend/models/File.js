const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary ID is required'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'jpg', 'jpeg'],
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for uploadedAt (alias for createdAt)
fileSchema.virtual('uploadedAt').get(function () {
  return this.createdAt;
});

// Ensure virtuals are serialized
fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);
