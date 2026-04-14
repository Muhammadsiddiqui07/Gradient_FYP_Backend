import multer from 'multer';

// Use memory storage to forward files to AI service without saving to disk
const storage = multer.memoryStorage();

// File filter (Only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Increased to 10MB for high-res images
});

export default upload;
