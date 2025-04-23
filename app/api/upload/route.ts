import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { rateLimit } from 'express-rate-limit';

// Set runtime to Node.js
export const runtime = 'nodejs';

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Image optimization settings
const MAX_WIDTH = 1200;
const QUALITY = 80;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many uploads from this IP, please try again after an hour'
});

// Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .toLowerCase();
}

// Optimize image
async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Resize if width exceeds MAX_WIDTH
  if (metadata.width && metadata.width > MAX_WIDTH) {
    image.resize(MAX_WIDTH, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Convert to WebP and compress
  return image
    .webp({ quality: QUALITY })
    .toBuffer();
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await limiter(ip);

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public/stories');
    const results = [];
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
      return NextResponse.json(
        { error: 'Failed to create upload directory' },
        { status: 500 }
      );
    }

    // Process each file
    for (const file of files) {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 5MB` },
          { status: 400 }
        );
      }

      // Create a unique filename
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const sanitizedOriginalName = sanitizeFilename(file.name);
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
      const filePath = path.join(uploadDir, filename);

      // Optimize and save the image
      try {
        const optimizedBuffer = await optimizeImage(buffer);
        await writeFile(filePath, optimizedBuffer);
        
        results.push({
          url: `/stories/${filename}`,
          imageName: filename,
          originalName: sanitizedOriginalName
        });
      } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json(
          { error: 'Failed to save file' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      files: results
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 