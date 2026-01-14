import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const bucketName = process.env.S3_BUCKET || 'directr-user-uploads'

async function configureCORS() {
  const corsRules = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://*.vercel.app',
          'https://0915bde3804c.ngrok-free.app/',
          // Add your production domain here when deploying
          // 'https://yourdomain.com',
        ],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  }

  try {
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsRules,
    })

    await s3Client.send(command)
    console.log(`✅ CORS configuration applied to bucket: ${bucketName}`)
    console.log('Allowed origins:', corsRules.CORSRules[0].AllowedOrigins)
  } catch (error) {
    console.error('❌ Failed to configure CORS:', error)
    process.exit(1)
  }
}

configureCORS()
