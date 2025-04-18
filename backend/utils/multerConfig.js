import multer from 'multer';
import path from 'path';

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where the file will be temporarily stored
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Unique file name based on the timestamp
  },
});

// Filter for only image files (jpg, png, jpeg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Set up multer to handle image uploads
const upload = multer({ storage, fileFilter });
export default upload;
