import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadImageToS3: (buffer: Buffer, filename: string, mimetype: string) => Promise<string>;
export declare const uploadImages: (files: Express.Multer.File[]) => Promise<string[]>;
export declare const generateThumbnail: (buffer: Buffer, filename: string) => Promise<string>;
export declare const deleteImageFromS3: (imageUrl: string) => Promise<void>;
export declare const validateImageFile: (file: Express.Multer.File) => boolean;
export declare const processProductImages: (files: Express.Multer.File[]) => Promise<{
    original: string;
    thumbnail: string;
    filename: string;
    size: number;
}[]>;
//# sourceMappingURL=upload.service.d.ts.map