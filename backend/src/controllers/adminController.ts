import { Request, Response } from 'express';
import { 
  filmsStorage as films, 
  purchasesStorage as purchases, 
  viewsStorage as views,
  User,
  Film,
  Purchase,
  View
} from '../storage';

interface AuthenticatedRequest extends Request {
  user?: User;
  walletAddress?: string;
}

/**
 * Get comprehensive admin analytics
 */
export const getAdminAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allFilms = Array.from(films.values()) as Film[];
    const allPurchases = Array.from(purchases.values()) as Purchase[];
    const allViews = Array.from(views.values()) as View[];

    // Calculate total metrics
    const totalFilms = allFilms.length;
    const activeFilms = allFilms.filter(f => f.isActive).length;
    const totalNFTsMinted = allFilms.filter(f => f.tokenId).length;
    const totalTransactions = allPurchases.length;
    const totalRevenue = allFilms.reduce((sum, film) => sum + BigInt(film.totalRevenue || '0'), BigInt(0));
    const totalViews = allFilms.reduce((sum, film) => sum + film.totalViews, 0);

    // Revenue by genre
    const revenueByGenre = allFilms.reduce((acc, film) => {
      if (!acc[film.genre]) acc[film.genre] = BigInt(0);
      acc[film.genre] += BigInt(film.totalRevenue || '0');
      return acc;
    }, {} as Record<string, bigint>);

    // Films uploaded over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filmsOverTime = allFilms
      .filter(film => new Date(film.createdAt) >= thirtyDaysAgo)
      .reduce((acc, film) => {
        const date = new Date(film.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Transactions over time
    const transactionsOverTime = allPurchases
      .filter(purchase => new Date(purchase.createdAt) >= thirtyDaysAgo)
      .reduce((acc, purchase) => {
        const date = new Date(purchase.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Top performing films
    const topFilms = allFilms
      .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
      .slice(0, 10)
      .map(film => ({
        id: film.id,
        title: film.title,
        totalRevenue: film.totalRevenue,
        totalViews: film.totalViews,
        purchases: allPurchases.filter(p => p.filmId === film.id).length
      }));

    // Recent activity
    const recentPurchases = allPurchases
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(purchase => ({
        id: purchase.id,
        filmTitle: allFilms.find(f => f.id === purchase.filmId)?.title || 'Unknown',
        buyerId: purchase.buyerId,
        price: purchase.price,
        createdAt: purchase.createdAt
      }));

    const analytics = {
      overview: {
        totalFilms,
        activeFilms,
        totalNFTsMinted,
        totalTransactions,
        totalRevenue: totalRevenue.toString(),
        totalViews
      },
      charts: {
        revenueByGenre: Object.entries(revenueByGenre).map(([genre, revenue]) => ({
          genre,
          revenue: revenue.toString()
        })),
        filmsOverTime: Object.entries(filmsOverTime).map(([date, count]) => ({
          date,
          count
        })),
        transactionsOverTime: Object.entries(transactionsOverTime).map(([date, count]) => ({
          date,
          count
        }))
      },
      topFilms,
      recentActivity: {
        purchases: recentPurchases
      }
    };

    res.json({
      success: true,
      analytics
    });
    return;

  } catch (error) {
    console.error('Error getting admin analytics:', error);
    res.status(500).json({ error: 'Failed to get admin analytics' });
    return;
  }
};

/**
 * Remove a film (admin only)
 */
export const removeFilm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filmId } = req.params;
    const { reason } = req.body;

    if (!filmId) {
      return res.status(400).json({ error: 'Film ID is required' });
    }

    const film = films.get(filmId) as Film;
    if (!film) {
      return res.status(404).json({ error: 'Film not found' });
    }

    // Remove film from storage
    films.delete(filmId);

    // Remove associated purchases and views
    const filmPurchases = Array.from(purchases.values()).filter(p => p.filmId === filmId);
    filmPurchases.forEach(purchase => purchases.delete(purchase.id));

    const filmViews = Array.from(views.values()).filter(v => v.filmId === filmId);
    filmViews.forEach(view => views.delete(view.id));

    // Log the removal action
    console.log(`Film removed by admin: ${film.title} (ID: ${filmId}), Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Film removed successfully',
      removedFilm: {
        id: film.id,
        title: film.title,
        reason: reason || 'No reason provided'
      }
    });
    return;

  } catch (error) {
    console.error('Error removing film:', error);
    res.status(500).json({ error: 'Failed to remove film' });
    return;
  }
};

/**
 * Get all films for admin management
 */
export const getAllFilmsAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, genre } = req.query;

    let filteredFilms = Array.from(films.values()) as Film[];

    // Filter by status
    if (status === 'active') {
      filteredFilms = filteredFilms.filter(f => f.isActive);
    } else if (status === 'inactive') {
      filteredFilms = filteredFilms.filter(f => !f.isActive);
    }

    // Filter by genre
    if (genre) {
      filteredFilms = filteredFilms.filter(f => f.genre === genre);
    }

    const totalCount = filteredFilms.length;

    // Sort by creation date (newest first)
    const sortedFilms = filteredFilms.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const paginatedFilms = sortedFilms.slice(
      (parseInt(page as string) - 1) * parseInt(limit as string),
      (parseInt(page as string) - 1) * parseInt(limit as string) + parseInt(limit as string)
    );

    const filmsResponse = paginatedFilms.map(film => ({
      id: film.id,
      title: film.title,
      description: film.description,
      genre: film.genre,
      duration: film.duration,
      releaseDate: film.releaseDate,
      producerId: film.producerId,
      price: film.price,
      thumbnailUrl: film.thumbnailUrl,
      isActive: film.isActive,
      totalViews: film.totalViews,
      totalRevenue: film.totalRevenue,
      tokenId: film.tokenId,
      createdAt: film.createdAt,
      purchases: Array.from(purchases.values()).filter(p => p.filmId === film.id).length,
      views: Array.from(views.values()).filter(v => v.filmId === film.id).length
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
    return;

  } catch (error) {
    console.error('Error getting films for admin:', error);
    res.status(500).json({ error: 'Failed to get films' });
    return;
  }
};
