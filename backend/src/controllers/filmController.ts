import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Film, User, Purchase, View } from '../models';
import ipfsService from '../services/ipfsService';
import blockchainService from '../services/blockchainService';

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}

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

    // Create film in database (initially inactive)
    const film = await Film.create({
      title,
      description,
      genre,
      duration: parseInt(duration),
      releaseDate: new Date(releaseDate),
      producerId: req.user!.id,
      ipfsHash: filmIpfsHash,
      price: price.toString(),
      thumbnailUrl: thumbnailIpfsHash ? ipfsService.getGatewayUrl(thumbnailIpfsHash) : undefined,
      isActive: false, // Wait for approval
      totalViews: 0,
      totalRevenue: '0'
    });

    // Create NFT on blockchain (starts inactive)
    const { tokenId, txHash } = await blockchainService.createFilm(
      title,
      description,
      genre,
      parseInt(duration),
      Math.floor(new Date(releaseDate).getTime() / 1000),
      filmIpfsHash,
      price,
      metadataIpfsHash
    );

    // Update film with NFT data
    await film.update({
      tokenId,
      contractAddress: blockchainService.getContractAddresses().nftContract
    });

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
        tokenId,
        txHash,
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

    // Get film from database
    const film = await Film.findByPk(filmId, { include: [{ model: User, as: 'producer' }] });
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    if (!film.isActive || !film.tokenId) {
      return res.status(400).json({ error: 'Film is not available for purchase' });
    }

    // Purchase NFT on blockchain
    const txHash = await blockchainService.purchaseFilm(film.tokenId, film.price);

    // Record purchase in database
    const purchase = await Purchase.create({
      buyerId: req.user!.id,
      filmId: film.id,
      tokenId: film.tokenId,
      transactionHash: txHash,
      price: film.price,
      gasUsed: '0' // Would need to get from transaction receipt
    });

    // Update film revenue
    const currentRevenue = BigInt(film.totalRevenue || '0');
    const newRevenue = currentRevenue + BigInt(film.price);
    await film.update({ totalRevenue: newRevenue.toString() });

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

    // Get film from database
    const film = await Film.findOne({ where: { tokenId: parseInt(tokenId) } });
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Record view
    await View.create({
      viewerId: req.user!.id,
      filmId: film.id,
      duration: 0,
      completed: false
    });

    // Update total views
    await film.increment('totalViews');

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

    // Update price on blockchain (this would need to be implemented in the contract)
    // For now, we'll just update in database
    const film = await Film.findOne({ where: { tokenId } });
    if (film) {
      await film.update({ price: newPrice.toString() });
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

    const film = await Film.findByPk(filmId, {
      include: [
        { model: User, as: 'producer' },
        { model: Purchase, as: 'purchases' },
        { model: View, as: 'views' }
      ]
    });

    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Check if user is producer or has access
    if (film.producerId !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = {
      film: {
        id: film.id,
        title: film.title,
        totalViews: film.totalViews,
        totalRevenue: film.totalRevenue
      },
      purchases: (film as any).purchases?.length || 0,
      views: (film as any).views?.length || 0,
      averageViewDuration: (film as any).views?.reduce((sum: number, view: any) => sum + view.duration, 0) / ((film as any).views?.length || 1),
      completionRate: (film as any).views?.filter((view: any) => view.completed).length / ((film as any).views?.length || 1)
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

    const films = await Film.findAll({
      where: { producerId },
      include: [
        { model: Purchase, as: 'purchases' },
        { model: View, as: 'views' }
      ]
    });

    const totalRevenue = films.reduce((sum, film) => {
      return sum + BigInt(film.totalRevenue);
    }, BigInt(0));

    const totalViews = films.reduce((sum, film) => sum + film.totalViews, 0);
    const totalPurchases = films.reduce((sum, film) => sum + ((film as any).purchases?.length || 0), 0);

    const revenueReport = {
      producer: {
        id: producerId,
        walletAddress: req.user!.walletAddress
      },
      summary: {
        totalFilms: films.length,
        totalRevenue: totalRevenue.toString(),
        totalViews,
        totalPurchases
      },
      films: films.map(film => ({
        id: film.id,
        title: film.title,
        totalRevenue: film.totalRevenue,
        totalViews: film.totalViews,
        purchases: (film as any).purchases?.length || 0
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

    const where: any = { isActive: true };
    if (genre) where.genre = genre;
    if (producer) {
      const producerUser = await User.findOne({ where: { walletAddress: producer as string } });
      if (producerUser) where.producerId = producerUser.id;
    }

    const films = await Film.findAndCountAll({
      where,
      include: [{ model: User, as: 'producer', attributes: ['walletAddress', 'username'] }],
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      films: films.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: films.count,
        pages: Math.ceil(films.count / parseInt(limit as string))
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

    // Get film from database
    const film = await Film.findByPk(filmId);
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    if (!film.tokenId) {
      return res.status(400).json({ error: 'Film has no NFT token' });
    }

    // Approve film on blockchain
    const txHash = await blockchainService.approveFilm(film.tokenId);

    // Update film status in database
    await film.update({ isActive: true });

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

    const film = await Film.findByPk(id, {
      include: [{ model: User, as: 'producer', attributes: ['walletAddress', 'username'] }]
    });

    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    res.json({
      success: true,
      film
    });
    return;

  } catch (error) {
    console.error('Error getting film:', error);
    res.status(500).json({ error: 'Failed to get film' });
    return;
  }
};
