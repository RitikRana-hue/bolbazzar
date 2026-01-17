import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as fileType from 'file-type';
import crypto from 'crypto';
import path from 'path';
import config from '../config';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

const MAX_FILE_SIZE = config.fileUpload.maxFileSize; // 10MB
const MAX_FILES = config.fileUpload.maxFilesPerProduct; // 10 files

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`));
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    }
});

// File validation middleware
export const validateFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            return next();
        }

        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

        for (const file of files) {
            // Validate file buffer exists
            if (!file.buffer) {
                return res.status(400).json({
                    error: 'File buffer is missing',
                    filename: file.originalname
                });
            }

            // Validate actual file type from buffer
            const detectedType = await fileType.fromBuffer(file.buffer);
            if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
                return res.status(400).json({
                    error: 'Invalid file type detected',
                    filename: file.originalname,
                    detectedType: detectedType?.mime || 'unknown'
                });
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return res.status(400).json({
                    error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
                    filename: file.originalname,
                    size: file.size
                });
            }

            // Basic malware scanning - check for suspicious patterns
            if (await containsSuspiciousContent(file.buffer)) {
                return res.status(400).json({
                    error: 'File contains suspicious content',
                    filename: file.originalname
                });
            }

            // Generate secure filename
            const ext = path.extname(file.originalname);
            const secureFilename = crypto.randomBytes(16).toString('hex') + ext;
            file.filename = secureFilename;
        }

        next();
    } catch (error) {
        console.error('File validation error:', error);
        res.status(500).json({
            error: 'File validation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Basic malware scanning function
async function containsSuspiciousContent(buffer: Buffer): Promise<boolean> {
    const content = buffer.toString('binary');

    // Check for suspicious patterns
    const suspiciousPatterns = [
        // Script tags
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        // PHP tags
        /<\?php[\s\S]*?\?>/gi,
        // Executable signatures
        /MZ[\x00-\xFF]{2}[\x00-\xFF]*PE/,
        // Common malware strings
        /eval\s*\(/gi,
        /base64_decode\s*\(/gi,
        /shell_exec\s*\(/gi,
        /system\s*\(/gi,
        /exec\s*\(/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
}

// File upload middleware with validation
export const uploadWithValidation = (fieldName: string, maxCount: number = MAX_FILES) => {
    return [
        upload.array(fieldName, maxCount),
        validateFiles
    ];
};

// Single file upload
export const uploadSingle = (fieldName: string) => {
    return [
        upload.single(fieldName),
        validateFiles
    ];
};