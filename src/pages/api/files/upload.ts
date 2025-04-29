import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { withSecurity } from '@/middleware/security';
import { getTenantFromHeader } from '@/lib/tenant';
import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/s3';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * Parse the multipart form data request
 */
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ fields, files });
        });
    });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check authentication
        const token = await getToken({ req });
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get tenant ID
        const tenantId = getTenantFromHeader(req);
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        // Parse form data
        const { fields, files } = await parseForm(req);

        // Get required fields
        const dataBucketId = fields.dataBucketId as unknown as string;
        const description = fields.description as unknown as string;
        const type = fields.type as unknown as string; // Type corresponds to bucket type (T1-T20)
        const year = fields.year as unknown as string;

        // Validate required fields
        if (!dataBucketId || !type) {
            return res.status(400).json({ error: 'Data bucket ID and type are required' });
        }

        // Get the uploaded file
        const fileField = files.file as unknown as formidable.File;
        if (!fileField) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read file from disk
        const fileBuffer = fs.readFileSync(fileField.filepath);

        // Upload file to S3
        const uploadResult = await uploadFile({
            file: fileBuffer,
            fileName: fileField.originalFilename || 'unnamed-file',
            contentType: fileField.mimetype || 'application/octet-stream',
            tenantId,
            bucketType: type,
            year
        });

        // Save file record in database
        const fileRecord = await prisma.file.create({
            data: {
                tenant: { connect: { id: tenantId } },
                dataBucket: { connect: { id: dataBucketId } },
                filename: uploadResult.originalName,
                path: uploadResult.filePath,
                type,
                description
            }
        });

        // Clean up temporary file
        fs.unlinkSync(fileField.filepath);

        return res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                id: fileRecord.id,
                filename: fileRecord.filename,
                type: fileRecord.type
            }
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default withSecurity(handler);