"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processProductImages = exports.validateImageFile = exports.deleteImageFromS3 = exports.generateThumbnail = exports.uploadImages = exports.uploadImageToS3 = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
// Configure AWS S3 client
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'instasell-uploads';
// Multer configuration for memory storage
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Upload single image to S3
const uploadImageToS3 = async (buffer, filename, mimetype) => {
    try {
        // Process image with Sharp (resize, optimize)
        const processedBuffer = await (0, sharp_1.default)(buffer)
            .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
            .jpeg({
            quality: 85,
            progressive: true
        })
            .toBuffer();
        const key = `products/${(0, uuid_1.v4)()}-${filename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: processedBuffer,
            ContentType: mimetype,
            ACL: 'public-read'
        });
        await s3Client.send(command);
        // Return the public URL
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }
    catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload image');
    }
};
exports.uploadImageToS3 = uploadImageToS3;
// Upload multiple images
const uploadImages = async (files) => {
    try {
        const uploadPromises = files.map(file => (0, exports.uploadImageToS3)(file.buffer, file.originalname, file.mimetype));
        return await Promise.all(uploadPromises);
    }
    catch (error) {
        console.error('Multiple upload error:', error);
        throw new Error('Failed to upload images');
    }
};
exports.uploadImages = uploadImages;
// Generate thumbnail
const generateThumbnail = async (buffer, filename) => {
    try {
        const thumbnailBuffer = await (0, sharp_1.default)(buffer)
            .resize(300, 300, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({
            quality: 80
        })
            .toBuffer();
        const key = `thumbnails/${(0, uuid_1.v4)()}-thumb-${filename}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        });
        await s3Client.send(command);
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }
    catch (error) {
        console.error('Thumbnail generation error:', error);
        throw new Error('Failed to generate thumbnail');
    }
};
exports.generateThumbnail = generateThumbnail;
// Delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
    try {
        const key = imageUrl.split('.com/')[1];
        const command = new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });
        await s3Client.send(command);
    }
    catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('Failed to delete image');
    }
};
exports.deleteImageFromS3 = deleteImageFromS3;
// Validate image file
const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
};
exports.validateImageFile = validateImageFile;
// Process product images with different sizes
const processProductImages = async (files) => {
    const results = [];
    for (const file of files) {
        if (!(0, exports.validateImageFile)(file)) {
            throw new Error(`Invalid file: ${file.originalname}`);
        }
        // Generate main image
        const mainImageUrl = await (0, exports.uploadImageToS3)(file.buffer, file.originalname, file.mimetype);
        // Generate thumbnail
        const thumbnailUrl = await (0, exports.generateThumbnail)(file.buffer, file.originalname);
        results.push({
            original: mainImageUrl,
            thumbnail: thumbnailUrl,
            filename: file.originalname,
            size: file.size
        });
    }
    return results;
};
exports.processProductImages = processProductImages;
//# sourceMappingURL=upload.service.js.map