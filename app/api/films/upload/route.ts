import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    // Forward the request to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/films/upload`, {
      method: 'POST',
      body: formData,
      headers: authHeader ? { 'Authorization': authHeader } : {},
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
