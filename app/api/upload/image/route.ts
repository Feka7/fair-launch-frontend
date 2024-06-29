import { NextResponse } from 'next/server';
import { ThirdwebStorage } from '@thirdweb-dev/storage';

const storage = new ThirdwebStorage({
  secretKey: process.env.THIRDWEB_SECRET_KEY || '',
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('file') as File;
    if (!imageFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uri = await storage.upload({ name: imageFile.name, data: buffer });
    const url = storage.resolveScheme(uri);
    return NextResponse.json({ uri, url });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
