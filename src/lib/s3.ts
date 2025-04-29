import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

const bucketName = process.env.S3_BUCKET_NAME || 'ward-data-bucket';

export interface UploadParams {
    file: Buffer;
    fileName: string;
    contentType: string;
    tenantId: string;
    bucketType: string;
    year: string;
}

/**
 * Upload a file to S3
 */
export async function uploadFile({ file, fileName, contentType, tenantId, bucketType, year }: UploadParams) {
    // Create a unique file name to prevent collisions
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${randomUUID()}.${fileExtension}`;

    // Create a hierarchical path for better organization
    const filePath = `tenants/${tenantId}/${year}/${bucketType}/${uniqueFileName}`;

    // Set up the S3 upload parameters
    const params = {
        Bucket: bucketName,
        Key: filePath,
        Body: file,
        ContentType: contentType
    };

    try {
// Upload to S3
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        return {
            filePath,
            fileName: uniqueFileName,
            originalName: fileName
        };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('Failed to upload file');
    }
}

/**
 * Get a pre-signed URL for a file in S3 (valid for a limited time)
 */
export async function getFileUrl(filePath: string, expiresIn = 3600) {
    const params = {
        Bucket: bucketName,
        Key: filePath
    };

    try {
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, { expiresIn });

        return url;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate file URL');
    }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(filePath: string) {
    const params = {
        Bucket: bucketName,
        Key: filePath
    };

    try {
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);

        return true;
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw new Error('Failed to delete file');
    }
}

/**
 * Check if a file exists in S3
 */
export async function checkFileExists(filePath: string) {
    const params = {
        Bucket: bucketName,
        Key: filePath
    };

    try {
        const command = new GetObjectCommand(params);
        await s3Client.send(command);

        return true;
    } catch (error) {
        // NoSuchKey error means the file doesn't exist
        if ((error as any).name === 'NoSuchKey') {
            return false;
        }

        console.error('Error checking if file exists:', error);
        throw new Error('Failed to check if file exists');
    }
}