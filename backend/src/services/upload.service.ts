import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Configure AWS S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'instasell-uploads';

// Multer configuration for memory storage
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload single image to S3
export const uploadImageToS3 = async (
    buffer: Buffer,
    filename: string,
    mimetype: string
): Promise<string> => {
    try {
        // Process image with Sharp (resize, optimize)
        const processedBuffer = await sharp(buffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toBuffer();

        const key = `products/${uuidv4()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: processedBuffer,
            ContentType: mimetype,
            ACL: 'public-read'
        });

        await s3Client.send(command);

        // Return the public URL
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Failed to upload image');
    }
};

// Upload multiple images
export const uploadImages = async (files: Express.Multer.File[]): Promise<string[]> => {
    try {
        const uploadPromises = files.map(file =>
            uploadImageToS3(file.buffer, file.originalname, file.mimetype)
        );

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Multiple upload error:', error);
        throw new Error('Failed to upload images');
    }
};

// Generate thumbnail
export const generateThumbnail = async (
    buffer: Buffer,
    filename: string
): Promise<string> => {
    try {
        const thumbnailBuffer = await sharp(buffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({
                quality: 80
            })
            .toBuffer();

        const key = `thumbnails/${uuidv4()}-thumb-${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        });

        await s3Client.send(command);

        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Thumbnail generation error:', error);
        throw new Error('Failed to generate thumbnail');
    }
};

// Delete image from S3
export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
    try {
        const key = imageUrl.split('.com/')[1];

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error('Failed to delete image');
    }
};

// Validate image file
export const validateImageFile = (file: Express.Multer.File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return allowedTypes.includes(file.mimetype) && file.size <= maxSize;
};

// Process product images with different sizes
export const processProductImages = async (files: Express.Multer.File[]) => {
    const results = [];

    for (const file of files) {
        if (!validateImageFile(file)) {
            throw new Error(`Invalid file: ${file.originalname}`);
        }

        // Generate main image
        const mainImageUrl = await uploadImageToS3(file.buffer, file.originalname, file.mimetype);

        // Generate thumbnail
        const thumbnailUrl = await generateThumbnail(file.buffer, file.originalname);

        results.push({
            original: mainImageUrl,
            thumbnail: thumbnailUrl,
            filename: file.originalname,
            size: file.size
        });
    }

    return results;
};