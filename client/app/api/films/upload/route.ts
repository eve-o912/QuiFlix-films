import { NextRequest, NextResponse } from 'next/server';

// New Next.js App Router configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time in seconds

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Get wallet address from headers or form data
    const walletAddress = request.headers.get('x-wallet-address') ||
                         formData.get('walletAddress') as string;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Get backend URL from environment
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('Forwarding upload to backend:', backendUrl);
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/films/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-wallet-address': walletAddress,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json(
          { error: errorText || 'Backend request failed' },
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Note: Vercel has a 4.5MB limit for API routes body size in the free tier
// For the body size limit, you'll need to configure this in vercel.json
// Large files should be uploaded directly to IPFS from the client
