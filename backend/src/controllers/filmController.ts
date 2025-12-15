import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ipfsService from '../services/ipfsService';
import { addFilmMetadata } from '../services/firestoreService';
import blockchainService from '../services/blockchainService';
import { 
 
  User,
  Film,
  Purchase,
  View
} from '../storage';

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}
// Simple in-memory storage (replace with Firebase later)
const films: Map<string, Film> = new Map();
const purchases: Map<string, Purchase> = new Map();
const views: Map<string, View> = new Map();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and image files are allowed.'));
    }
  }
});

export const uploadMiddleware = upload.fields([
  { name: 'filmFile', maxCount: 1 },
  { name: 'thumbnailFile', maxCount: 1 }
]);

/**
 * Upload film with metadata and IPFS hash
 */
export const uploadFilm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, genre, duration, releaseDate, price } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Validate required fields
    if (!title || !description || !genre || !duration || !releaseDate || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate files
    if (!files.filmFile || files.filmFile.length === 0) {
      return res.status(400).json({ error: 'Film file is required' });
    }

    const filmFile = files.filmFile[0];
    const thumbnailFile = files.thumbnailFile?.[0];

    // Upload film to IPFS
    const filmIpfsHash = await ipfsService.uploadFile(filmFile.path, filmFile.originalname);
    
    // Upload thumbnail to IPFS if provided
    let thumbnailIpfsHash = null;
    if (thumbnailFile) {
      thumbnailIpfsHash = await ipfsService.uploadFile(thumbnailFile.path, thumbnailFile.originalname);
    }

    // Create metadata object
    const metadata = {
      title,
      description,
      genre,
      duration: parseInt(duration),
      releaseDate: new Date(releaseDate),
      price: price.toString(),
      ipfsHash: filmIpfsHash,
      thumbnailIpfsHash,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user?.walletAddress || req.walletAddress
    };

    // Upload metadata to IPFS
    const metadataIpfsHash = await ipfsService.uploadMetadata(metadata, `${title.replace(/\s+/g, '_')}_metadata.json`);

    // Create film in memory storage (initially inactive)
    const filmId = Date.now().toString();
    const film: Film = {
      id: filmId,
      title,
      description,
      genre,
      duration: parseInt(duration),
      releaseDate: new Date(releaseDate).toISOString(),
      producerId: req.user!.id,
      ipfsHash: filmIpfsHash,
      price: price.toString(),
      thumbnailUrl: thumbnailIpfsHash ? ipfsService.getGatewayUrl(thumbnailIpfsHash) : undefined,
      isActive: false, // Wait for approval
      totalViews: 0,
      totalRevenue: '0',
      createdAt: new Date().toISOString()
    };
    films.set(filmId, film);

    // Note: Blockchain transaction will be done on frontend using custodial wallet
    // For now, store the metadata IPFS hash

    // Clean up uploaded files
    fs.unlinkSync(filmFile.path);
    if (thumbnailFile) {
      fs.unlinkSync(thumbnailFile.path);
    }

    res.status(201).json({
      success: true,
      film: {
        id: film.id,
        title: film.title,
        ipfsHash: filmIpfsHash,
        thumbnailUrl: film.thumbnailUrl,
        metadataIpfsHash
      }
    });
    return;

  } catch (error) {
    console.error('Error uploading film:', error);
    res.status(500).json({ error: 'Failed to upload film' });
    return;
  }
};

/**
 * Purchase film NFT
 */
export const purchaseFilm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filmId } = req.body;

    if (!filmId) {
      return res.status(400).json({ error: 'Missing required field: filmId' });
    }

    // Get film from memory storage
    const film = films.get(filmId);
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    if (!film.isActive || !film.tokenId) {
      return res.status(400).json({ error: 'Film is not available for purchase' });
    }

    // Purchase NFT on blockchain
    const txHash = await blockchainService.purchaseFilm(film.tokenId, film.price);

    // Record purchase in memory storage
    const purchaseId = Date.now().toString();
    const purchase: Purchase = {
      id: purchaseId,
      buyerId: req.user!.id,
      filmId: film.id,
      tokenId: film.tokenId,
      transactionHash: txHash,
      price: film.price,
      gasUsed: '0',
      createdAt: new Date().toISOString()
    };
    purchases.set(purchaseId, purchase);

    // Update film revenue
    const currentRevenue = BigInt(film.totalRevenue || '0');
    const newRevenue = currentRevenue + BigInt(film.price);
    film.totalRevenue = newRevenue.toString();
    films.set(film.id, film);

    res.status(201).json({
      success: true,
      purchase: {
        id: purchase.id,
        tokenId: film.tokenId,
        txHash,
        price: film.price
      }
    });
    return;

  } catch (error) {
    console.error('Error purchasing film:', error);
    res.status(500).json({ error: 'Failed to purchase film' });
    return;
  }
};

/**
 * Stream film (verify NFT ownership)
 */
export const streamFilm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tokenId } = req.params;

    // Verify NFT ownership
    const owner = await blockchainService.getNFTOwner(parseInt(tokenId));
    const userWalletAddress = req.user?.walletAddress || req.walletAddress;

    if (owner.toLowerCase() !== userWalletAddress?.toLowerCase()) {
      return res.status(403).json({ error: 'You do not own this NFT' });
    }

    // Get film from memory storage
    const film = Array.from(films.values()).find(f => f.tokenId === parseInt(tokenId));
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Record view
    const viewId = Date.now().toString();
    const view: View = {
      id: viewId,
      viewerId: req.user!.id,
      filmId: film.id,
      duration: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };
    views.set(viewId, view);

    // Update total views
    film.totalViews += 1;
    films.set(film.id, film);

    // Generate signed URL (in production, use Livepeer or similar)
    const streamUrl = ipfsService.getGatewayUrl(film.ipfsHash);

    res.json({
      success: true,
      streamUrl,
      film: {
        id: film.id,
        title: film.title,
        duration: film.duration,
        ipfsHash: film.ipfsHash
      }
    });
    return;

  } catch (error) {
    console.error('Error streaming film:', error);
    res.status(500).json({ error: 'Failed to stream film' });
    return;
  }
 };

/**
 * Resell NFT (secondary market logic)
 */
export const resellNFT = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tokenId, newPrice } = req.body;

    if (!tokenId || !newPrice) {
      return res.status(400).json({ error: 'Missing required fields: tokenId, newPrice' });
    }

    // Verify ownership
    const owner = await blockchainService.getNFTOwner(tokenId);
    const userWalletAddress = req.user?.walletAddress || req.walletAddress;

    if (owner.toLowerCase() !== userWalletAddress?.toLowerCase()) {
      return res.status(403).json({ error: 'You do not own this NFT' });
    }

    // Update price in memory storage
    const film = Array.from(films.values()).find(f => f.tokenId === tokenId);
    if (film) {
      film.price = newPrice.toString();
      films.set(film.id, film);
    }

    res.json({
      success: true,
      message: 'NFT listed for resale',
      tokenId,
      newPrice: newPrice.toString()
    });
    return;

  } catch (error) {
    console.error('Error reselling NFT:', error);
    res.status(500).json({ error: 'Failed to resell NFT' });
    return;
  }
};

/**
 * Get film analytics
 */
export const getFilmAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filmId } = req.params;

    const film = films.get(filmId);

    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Check if user is producer or has access
    if (film.producerId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filmPurchases = Array.from(purchases.values()).filter(p => p.filmId === filmId);
    const filmViews = Array.from(views.values()).filter(v => v.filmId === filmId);

    const analytics = {
      film: {
        id: film.id,
        title: film.title,
        totalViews: film.totalViews,
        totalRevenue: film.totalRevenue
      },
      purchases: filmPurchases.length,
      views: filmViews.length,
      averageViewDuration: filmViews.reduce((sum, view) => sum + view.duration, 0) / (filmViews.length || 1),
      completionRate: filmViews.filter(view => view.completed).length / (filmViews.length || 1)
    };

    res.json({
      success: true,
      analytics
    });
    return;

  } catch (error) {
    console.error('Error getting film analytics:', error);
    res.status(500).json({ error: 'Failed to get film analytics' });
    return;
  }
};

/**
 * Get producer revenue report
 */
export const getProducerRevenue = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const producerId = req.user!.id;

    const producerFilms = Array.from(films.values()).filter(f => f.producerId === producerId);

    const totalRevenue = producerFilms.reduce((sum, film) => {
      return sum + BigInt(film.totalRevenue);
    }, BigInt(0));

    const totalViews = producerFilms.reduce((sum, film) => sum + film.totalViews, 0);
    const totalPurchases = producerFilms.reduce((sum, film) => {
      return sum + Array.from(purchases.values()).filter(p => p.filmId === film.id).length;
    }, 0);

    const revenueReport = {
      producer: {
        id: producerId,
        walletAddress: req.user!.walletAddress
      },
      summary: {
        totalFilms: producerFilms.length,
        totalRevenue: totalRevenue.toString(),
        totalViews,
        totalPurchases
      },
      films: producerFilms.map(film => ({
        id: film.id,
        title: film.title,
        totalRevenue: film.totalRevenue,
        totalViews: film.totalViews,
        purchases: Array.from(purchases.values()).filter(p => p.filmId === film.id).length
      }))
    };

    res.json({
      success: true,
      revenueReport
    });

  } catch (error) {
    console.error('Error getting producer revenue:', error);
    res.status(500).json({ error: 'Failed to get producer revenue' });
    return;
  }
};

/**
 * Get all films
 */
export const getAllFilms = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, genre, producer } = req.query;

    let filteredFilms = Array.from(films.values()).filter(f => f.isActive);

    if (genre) filteredFilms = filteredFilms.filter(f => f.genre === genre);

    if (producer) {
      // For now, filter by producerId directly (assuming producer is walletAddress)
      filteredFilms = filteredFilms.filter(f => f.producerId === producer);
    }

    const totalCount = filteredFilms.length;

    const paginatedFilms = filteredFilms
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice((parseInt(page as string) - 1) * parseInt(limit as string), (parseInt(page as string) - 1) * parseInt(limit as string) + parseInt(limit as string));

    const filmsResponse = paginatedFilms.map(film => ({
      id: film.id,
      title: film.title,
      description: film.description,
      genre: film.genre,
      duration: film.duration,
      releaseDate: film.releaseDate,
      producer: {
        walletAddress: film.producerId, // Simplified
        username: '' // Would need to get from users map
      },
      price: film.price,
      thumbnailUrl: film.thumbnailUrl,
      totalViews: film.totalViews,
      totalRevenue: film.totalRevenue,
      createdAt: film.createdAt
    }));

    res.json({
      success: true,
      films: filmsResponse,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });

  } catch (error) {
    console.error('Error getting films:', error);
    res.status(500).json({ error: 'Failed to get films' });
  }
};

/**
 * Approve a film for sale (admin only)
 */
export const approveFilm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filmId } = req.body;

    if (!filmId) {
      return res.status(400).json({ error: 'Missing required field: filmId' });
    }

    // Get film from memory storage
    const film = films.get(filmId);
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    if (!film.tokenId) {
      return res.status(400).json({ error: 'Film has no NFT token' });
    }

    // Approve film on blockchain
    const txHash = await blockchainService.approveFilm(film.tokenId);

    // Update film status in memory storage
    film.isActive = true;
    films.set(film.id, film);

    res.json({
      success: true,
      message: 'Film approved for sale',
      txHash
    });
    return;

  } catch (error) {
    console.error('Error approving film:', error);
    res.status(500).json({ error: 'Failed to approve film' });
    return;
  }
};

/**
 * Get film by ID
 */
export const getFilmById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const film = films.get(id);

    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    const filmResponse = {
      id: film.id,
      title: film.title,
      description: film.description,
      genre: film.genre,
      duration: film.duration,
      releaseDate: film.releaseDate,
      producer: {
        walletAddress: film.producerId, // Simplified
        username: '' // Would need to get from users map
      },
      price: film.price,
      thumbnailUrl: film.thumbnailUrl,
      totalViews: film.totalViews,
      totalRevenue: film.totalRevenue,
      createdAt: film.createdAt
    };

    res.json({
      success: true,
      film: filmResponse
    });
    return;

  } catch (error) {
    console.error('Error getting film:', error);
    res.status(500).json({ error: 'Failed to get film' });
    return;
  }
};
