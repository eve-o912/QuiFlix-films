import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

/**
 * Upload Film API Route with PostgreSQL Integration
 * This route handles film uploads and stores metadata in PostgreSQL
 */

export async function POST(request: NextRequest) {
  try {
    // Get wallet address from headers
    const walletAddress = request.headers.get('x-wallet-address');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const genre = formData.get('genre') as string;
    const duration = formData.get('duration') as string;
    const releaseDate = formData.get('releaseDate') as string;
    const price = formData.get('price') as string;

    // Validate required fields
    if (!title || !genre || !duration || !releaseDate || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.users.findByWalletAddress(walletAddress);
    if (!user) {
      // Create new producer account
      user = await db.users.create(
        `${walletAddress}@quiflix.com`, // temporary email
        walletAddress,
        walletAddress.substring(0, 8), // temporary username
        true // isProducer
      );
    }

    // Forward the request to backend for IPFS upload
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/films/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-wallet-address': walletAddress,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const backendData = await response.json();

    // Store film metadata in PostgreSQL
    const film = await db.films.create({
      title,
      description,
      genre,
      duration: parseInt(duration),
      releaseDate: new Date(releaseDate),
      producerId: user.id,
      ipfsHash: backendData.film.ipfsHash,
      metadataIpfsHash: backendData.film.metadataIpfsHash,
      price,
      thumbnailUrl: backendData.film.thumbnailUrl,
      isActive: false, // Requires admin approval
    });

    return NextResponse.json({
      success: true,
      film: {
        id: film.id,
        title: film.title,
        ipfsHash: film.ipfs_hash,
        thumbnailUrl: film.thumbnail_url,
        databaseId: film.id,
      },
    });

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

/**
 * GET: Fetch all films from database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const genre = searchParams.get('genre') || undefined;
    const producerId = searchParams.get('producer') || undefined;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch films from database
    const films = await db.films.findAll({
      limit,
      offset,
      genre,
      producerId,
    });

    // Get total count (for pagination)
    const countQuery = await db.films.findAll({});
    const total = countQuery.length;

    return NextResponse.json({
      success: true,
      films: films.map(film => ({
        id: film.id,
        title: film.title,
        description: film.description,
        genre: film.genre,
        duration: film.duration,
        releaseDate: film.release_date,
        producer: {
          username: film.producer_username,
          walletAddress: film.producer_wallet,
        },
        price: film.price,
        thumbnailUrl: film.thumbnail_url,
        totalViews: film.total_views,
        totalRevenue: film.total_revenue,
        isActive: film.is_active,
        createdAt: film.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching films:', error);
    return NextResponse.json(
      { error: 'Failed to fetch films' },
      { status: 500 }
    );
  }
}
