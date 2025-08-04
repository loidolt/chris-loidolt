import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  try {
    const { path } = await request.json();
    
    if (path) {
      revalidatePath(path);
    } else {
      // Revalidate all main paths
      revalidatePath('/');
      revalidatePath('/garden');
      revalidatePath('/seeds/projects');
      revalidatePath('/seeds/notes');
      revalidatePath('/seeds/writing');
      revalidatePath('/seeds/experiments');
    }
    
    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 });
  }
}