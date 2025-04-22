import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { IZipEntry } from 'adm-zip';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if it's a zip file
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'File must be a ZIP archive' },
        { status: 400 }
      );
    }

    // Create a unique directory for extracted files
    const timestamp = Date.now();
    const extractDir = path.join(process.cwd(), 'public/extracted', `${timestamp}`);
    
    // Ensure the extraction directory exists
    if (!existsSync(extractDir)) {
      await mkdir(extractDir, { recursive: true });
    }

    // Save the uploaded zip file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempZipPath = path.join(extractDir, 'temp.zip');
    await writeFile(tempZipPath, Readable.from(buffer));

    // Extract the zip file
    const zip = new AdmZip(tempZipPath);
    zip.extractAllTo(extractDir, true);

    // Get list of extracted files
    const extractedFiles = zip.getEntries().map((entry: IZipEntry) => ({
      name: entry.entryName,
      size: entry.header.size,
      compressed: entry.header.compressedSize,
      isDirectory: entry.isDirectory
    }));

    // Return the extraction results
    return NextResponse.json({
      success: true,
      extractedPath: `/extracted/${timestamp}`,
      files: extractedFiles
    });

  } catch (error) {
    console.error('Error processing zip file:', error);
    return NextResponse.json(
      { error: 'Failed to process zip file' },
      { status: 500 }
    );
  }
} 