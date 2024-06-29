import { NextResponse } from 'next/server';
import { ThirdwebStorage } from '@thirdweb-dev/storage';

const storage = new ThirdwebStorage({
  secretKey: process.env.THIRDWEB_SECRET_KEY || '',
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    if (!name || !description || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const metadata = {
      name,
      description,
      image,
    };
    const uri = await storage.upload(metadata);
    const url = await storage.resolveScheme(uri);
    return NextResponse.json({ uri, url });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return NextResponse.json({ error: 'Failed to upload metadata' }, { status: 500 });
  }
}
