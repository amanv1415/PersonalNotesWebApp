const express = require('express');
// const authMiddleware = require('../middleware/auth'); // Login inactive for now
const { cloudinary, upload } = require('../config/cloudinary');
const File = require('../models/File');

const router = express.Router();

// Auth disabled while login is inactive
// router.use(authMiddleware);

// POST /api/files/upload - Upload a file
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 10MB limit.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided.',
      });
    }

    try {
      const fileExtension = req.file.originalname
        .split('.')
        .pop()
        .toLowerCase();

      const newFile = await File.create({
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        cloudinaryId: req.file.filename,
        fileType: fileExtension === 'pdf' ? 'pdf' : fileExtension,
        fileSize: req.file.size || 0,
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully.',
        file: newFile,
      });
    } catch (error) {
      console.error('Upload save error:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving file information.',
      });
    }
  });
});

// GET /api/files - Get all files with search, filter, sort
router.get('/', async (req, res) => {
  try {
    const { search, type, sort, favorites } = req.query;
    let query = {};

    // Search by filename
    if (search) {
      query.fileName = { $regex: search, $options: 'i' };
    }

    // Filter by file type
    if (type && type !== 'all') {
      if (type === 'image') {
        query.fileType = { $in: ['jpg', 'jpeg'] };
      } else {
        query.fileType = type;
      }
    }

    // Filter favorites
    if (favorites === 'true') {
      query.isFavorite = true;
    }

    // Sort
    let sortOption = { createdAt: -1 }; // Default: latest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOption = { fileName: 1 };
    }

    const files = await File.find(query).sort(sortOption);

    res.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files.',
    });
  }
});

// GET /api/files/:id - Get single file
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching file.',
    });
  }
});

// PATCH /api/files/:id/favorite - Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    file.isFavorite = !file.isFavorite;
    await file.save();

    res.json({
      success: true,
      message: file.isFavorite ? 'Added to favorites.' : 'Removed from favorites.',
      file,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating favorite status.',
    });
  }
});

// DELETE /api/files/:id - Delete a file
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.',
      });
    }

    // Delete from Cloudinary
    const resourceType = file.fileType === 'pdf' ? 'raw' : 'image';
    try {
      await cloudinary.uploader.destroy(file.cloudinaryId, {
        resource_type: resourceType,
      });
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr.message);
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file.',
    });
  }
});

module.exports = router;
