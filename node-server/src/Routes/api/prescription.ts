import { uploadMiddleware } from "../../config/multer.js";
import express, { Request, Response, Router } from 'express';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { prescriptionOCRService } from "@/services/prescription.service.js";

const router: Router = express.Router();
// Type definitions
interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
}

interface DeleteRequest {
  fileName?: string;
  key?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface FileInfo {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
}

interface UploadResponse {
  fileUrl: string;
  key: string;
  size: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

// Environment variables with proper typing
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  throw new Error('Missing required AWS environment variables');
}

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Method 1: Generate presigned URL for direct upload
router.post('/presigned-url', async (req: Request<{}, ApiResponse<PresignedUrlResponse>, PresignedUrlRequest>, res: Response<ApiResponse<PresignedUrlResponse>>) => {
  try {
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'fileName and fileType are required'
      });
    }

    const key = `prescriptions/${uuidv4()}_${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read'
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 60 // URL expires in 60 seconds
    });
    
    const fileUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
    
    res.json({
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        key
      }
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Multer configuration with proper typing
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME!,
    key: function (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) {
      const key = `prescriptions/${uuidv4()}_${file.originalname}`;
      cb(null, key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Method 2: Direct upload via backend
router.post('/upload', upload.single('file'), (req: Request, res: Response<ApiResponse<UploadResponse>>) => {
  try {
    const file = req.file as Express.MulterS3.File;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        fileUrl: file.location,
        key: file.key,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Method 3: Delete file
router.delete('/delete', async (req: Request<{}, ApiResponse, DeleteRequest>, res: Response<ApiResponse>) => {
  try {
    const { fileName, key } = req.body;
    
    if (!fileName && !key) {
      return res.status(400).json({
        success: false,
        error: 'Either fileName or key is required'
      });
    }
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key || `prescriptions/${fileName}`
    });

    await s3Client.send(command);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Method 4: List files for a user
router.get('/files/:userId', async (req: Request<{ userId: string }>, res: Response<ApiResponse<{ files: FileInfo[] }>>) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId parameter is required'
      });
    }
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `prescriptions/${userId}/`
    });

    const data = await s3Client.send(command);
    
    const files: FileInfo[] = data.Contents ? data.Contents.map(item => ({
      key: item.Key!,
      url: `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${item.Key}`,
      size: item.Size!,
      lastModified: item.LastModified!
    })) : [];

    res.json({
      success: true,
      data: { files }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const uploadDisk = multer({
    storage,
    limits: {
        fileSize: 16 * 1024 * 1024, // 16MB
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /png|jpg|jpeg|gif|bmp|tiff|webp/;
        const extname = allowedExtensions.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedExtensions.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(
                new Error(
                    "Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP"
                )
            );
        }
    },
});

router.post(
    "/extract",
    uploadDisk.single("file"),
    async (req: Request, res: Response): Promise<void> => {
        try {
            // Check if file was uploaded
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: "No file provided",
                });
                return;
            }

            const filePath = req.file.path;

            try {
                // Extract prescription details
                const result =
                    await prescriptionOCRService.extractPrescriptionDetails(
                        filePath
                    );

                // Clean up uploaded file
                await fs.unlink(filePath);

                res.json(result);
            } catch (error: any) {
                console.log("😂😂😂",error);
                // Clean up file on error
                try {
                    await fs.unlink(filePath);
                } catch {}

                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        } catch (error: any) {
            console.error("😱😱😱", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
);



export default router;