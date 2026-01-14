import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { s3Client, S3_BUCKET, generateS3FileName } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AWS_REGION = process.env.AWS_REGION || 'us-east-1'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure user exists in database (create if doesn't exist)
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@temp.com`,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        username: clerkUser.username || null,
        imageUrl: clerkUser.imageUrl || null,
      },
    })

    const body = await request.json()
    const { fileName, fileType, fileSize } = body

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    // Generate unique S3 key
    const s3Key = generateS3FileName(userId, fileName)

    // Create presigned URL for PUT operation
    // Note: We don't use ACL here - public access is handled by bucket policy
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      ContentType: fileType,
    })

    // Generate presigned URL that expires in 5 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    })

    // The final public URL where the file will be accessible
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`

    // Save upload record to database
    const uploadRecord = await prisma.userUpload.create({
      data: {
        userId,
        url: publicUrl,
        s3Key,
        filename: fileName,
        fileSize: fileSize || 0,
        contentType: fileType,
      },
    })

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      s3Key,
      uploadId: uploadRecord.id,
    })
  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    )
  }
}
