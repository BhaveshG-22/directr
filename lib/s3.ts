import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export const S3_BUCKET = process.env.S3_BUCKET || 'directr-user-uploads'

/**
 * Upload file to S3 with public read access
 * @param file File buffer to upload
 * @param fileName Name for the file in S3
 * @param contentType MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read', // Make file publicly readable
  })

  await s3Client.send(command)

  // Return public URL
  return `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
}

/**
 * Generate unique filename for S3
 */
export function generateS3FileName(userId: string, originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  const ext = originalName.split('.').pop()
  return `users/${userId}/uploads/${timestamp}-${random}.${ext}`
}
