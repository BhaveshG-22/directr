import { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const region = process.env.AWS_REGION || 'us-east-1'
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const bucketName = process.env.S3_BUCKET || 'directr-user-uploads'

async function setupS3Bucket() {
  try {
    // Step 1: Create bucket
    console.log(`📦 Creating S3 bucket: ${bucketName}...`)

    const createParams: any = {
      Bucket: bucketName,
    }

    // Only add LocationConstraint if not us-east-1
    if (region !== 'us-east-1') {
      createParams.CreateBucketConfiguration = {
        LocationConstraint: region,
      }
    }

    try {
      await s3Client.send(new CreateBucketCommand(createParams))
      console.log(`✅ Bucket created: ${bucketName}`)
    } catch (error: any) {
      if (error.name === 'BucketAlreadyOwnedByYou') {
        console.log(`ℹ️  Bucket already exists: ${bucketName}`)
      } else {
        throw error
      }
    }

    // Step 2: Configure public access block (allow public read for uploaded files)
    console.log(`🔓 Configuring public access...`)
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }))
    console.log(`✅ Public access configured`)

    // Step 3: Configure CORS
    console.log(`🌐 Configuring CORS...`)
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

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsRules,
    }))
    console.log(`✅ CORS configuration applied`)
    console.log(`   Allowed origins:`, corsRules.CORSRules[0].AllowedOrigins)

    // Step 4: Add bucket policy to allow public read
    console.log(`📜 Adding bucket policy for public reads...`)
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    }

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy),
    }))
    console.log(`✅ Bucket policy applied`)

    console.log(`\n🎉 S3 bucket setup complete!`)
    console.log(`\nBucket details:`)
    console.log(`  - Name: ${bucketName}`)
    console.log(`  - Region: ${region}`)
    console.log(`  - Public URL: https://${bucketName}.s3.${region}.amazonaws.com/`)
  } catch (error) {
    console.error('❌ Failed to setup S3 bucket:', error)
    process.exit(1)
  }
}

setupS3Bucket()
