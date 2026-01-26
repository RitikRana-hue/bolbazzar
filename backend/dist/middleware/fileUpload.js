"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = exports.uploadWithValidation = exports.validateFiles = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fileType = __importStar(require("file-type"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];
const MAX_FILE_SIZE = config_1.default.fileUpload.maxFileSize; // 10MB
const MAX_FILES = config_1.default.fileUpload.maxFilesPerProduct; // 10 files
// Multer configuration
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
    // Check file extension
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`));
    }
    cb(null, true);
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    }
});
// File validation middleware
const validateFiles = async (req, res, next) => {
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
            const ext = path_1.default.extname(file.originalname);
            const secureFilename = crypto_1.default.randomBytes(16).toString('hex') + ext;
            file.filename = secureFilename;
        }
        next();
    }
    catch (error) {
        console.error('File validation error:', error);
        res.status(500).json({
            error: 'File validation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.validateFiles = validateFiles;
// Basic malware scanning function
async function containsSuspiciousContent(buffer) {
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
const uploadWithValidation = (fieldName, maxCount = MAX_FILES) => {
    return [
        exports.upload.array(fieldName, maxCount),
        exports.validateFiles
    ];
};
exports.uploadWithValidation = uploadWithValidation;
// Single file upload
const uploadSingle = (fieldName) => {
    return [
        exports.upload.single(fieldName),
        exports.validateFiles
    ];
};
exports.uploadSingle = uploadSingle;
//# sourceMappingURL=fileUpload.js.map