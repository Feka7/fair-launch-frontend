import { NextResponse } from 'next/server';
import { ThirdwebStorage } from '@thirdweb-dev/storage';

const storage = new ThirdwebStorage({
  secretKey: process.env.THIRDWEB_SECRET_KEY || '',
});
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uri = searchParams.get('uri');

    if (!uri) {
      return NextResponse.json({ error: 'Missing URI' }, { status: 400 });
    }

    // Download data from IPFS
    const data = await storage.downloadJSON(uri);

    if (!data.name || !data.description || !data.image) {
      return NextResponse.json({ error: 'Invalid metadata format' }, { status: 400 });
    }

    return NextResponse.json({ name: data.name, description: data.description, image: data.image });
  } catch (error) {
    console.error('Error downloading from IPFS:', error);
    return NextResponse.json({ error: 'Failed to download metadata' }, { status: 500 });
  }
}
