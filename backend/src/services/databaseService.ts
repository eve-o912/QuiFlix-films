import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Database Service for QuiFlix Platform
 * Provides CRUD operations for Films, Users, Purchases, and Views
 */
class DatabaseService {
  // ============================================
  // FILM OPERATIONS
  // ============================================

  async createFilm(data: {
    title: string;
    description: string;
    genre: string;
    duration: number;
    releaseDate: Date;
    producerId: string;
    ipfsHash: string;
    price: string;
    thumbnailUrl?: string;
    tokenId?: number;
  }) {
    return await prisma.film.create({
      data: {
        ...data,
        isActive: false,
        totalViews: 0,
        totalRevenue: '0',
      },
      include: {
        producer: true,
      },
    });
  }

  async getFilmById(id: string) {
    return await prisma.film.findUnique({
      where: { id },
      include: {
        producer: true,
        purchases: true,
        views: true,
      },
    });
  }

  async getFilmByTokenId(tokenId: number) {
    return await prisma.film.findUnique({
      where: { tokenId },
      include: {
        producer: true,
      },
    });
  }

  async getAllFilms(options?: {
    genre?: string;
    producerId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { genre, producerId, isActive = true, page = 1, limit = 10 } = options || {};

    const where: any = {};
    if (genre) where.genre = genre;
    if (producerId) where.producerId = producerId;
    if (isActive !== undefined) where.isActive = isActive;

    const [films, total] = await Promise.all([
      prisma.film.findMany({
        where,
        include: {
          producer: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.film.count({ where }),
    ]);

    return {
      films,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateFilm(id: string, data: Partial<{
    title: string;
    description: string;
    genre: string;
    duration: number;
    releaseDate: Date;
    price: string;
    thumbnailUrl: string;
    isActive: boolean;
    totalViews: number;
    totalRevenue: string;
    tokenId: number;
  }>) {
    return await prisma.film.update({
      where: { id },
      data,
    });
  }

  async approveFilm(id: string, tokenId: number) {
    return await prisma.film.update({
      where: { id },
      data: {
        isActive: true,
        tokenId,
      },
    });
  }

  async incrementFilmViews(id: string) {
    return await prisma.film.update({
      where: { id },
      data: {
        totalViews: {
          increment: 1,
        },
      },
    });
  }

  async updateFilmRevenue(id: string, additionalRevenue: string) {
    const film = await this.getFilmById(id);
    if (!film) throw new Error('Film not found');

    const currentRevenue = BigInt(film.totalRevenue);
    const newRevenue = currentRevenue + BigInt(additionalRevenue);

    return await prisma.film.update({
      where: { id },
      data: {
        totalRevenue: newRevenue.toString(),
      },
    });
  }

  async deleteFilm(id: string) {
    return await prisma.film.delete({
      where: { id },
    });
  }

  // ============================================
  // USER OPERATIONS
  // ============================================

  async createUser(data: {
    email: string;
    walletAddress?: string;
    username?: string;
    isProducer?: boolean;
    profileImage?: string;
  }) {
    return await prisma.user.create({
      data,
    });
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        films: true,
        purchases: true,
        views: true,
      },
    });
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserByWalletAddress(walletAddress: string) {
    return await prisma.user.findUnique({
      where: { walletAddress },
    });
  }

  async updateUser(id: string, data: Partial<{
    email: string;
    walletAddress: string;
    username: string;
    isProducer: boolean;
    profileImage: string;
  }>) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // ============================================
  // PURCHASE OPERATIONS
  // ============================================

  async createPurchase(data: {
    buyerId: string;
    filmId: string;
    tokenId: number;
    transactionHash: string;
    price: string;
    gasUsed: string;
  }) {
    return await prisma.purchase.create({
      data,
      include: {
        buyer: true,
        film: true,
      },
    });
  }

  async getPurchaseById(id: string) {
    return await prisma.purchase.findUnique({
      where: { id },
      include: {
        buyer: true,
        film: true,
      },
    });
  }

  async getPurchasesByBuyer(buyerId: string) {
    return await prisma.purchase.findMany({
      where: { buyerId },
      include: {
        film: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPurchasesByFilm(filmId: string) {
    return await prisma.purchase.findMany({
      where: { filmId },
      include: {
        buyer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPurchaseByTransactionHash(transactionHash: string) {
    return await prisma.purchase.findUnique({
      where: { transactionHash },
    });
  }

  // ============================================
  // VIEW OPERATIONS
  // ============================================

  async createView(data: {
    viewerId: string;
    filmId: string;
    duration?: number;
    completed?: boolean;
  }) {
    return await prisma.view.create({
      data,
      include: {
        viewer: true,
        film: true,
      },
    });
  }

  async getViewById(id: string) {
    return await prisma.view.findUnique({
      where: { id },
      include: {
        viewer: true,
        film: true,
      },
    });
  }

  async getViewsByViewer(viewerId: string) {
    return await prisma.view.findMany({
      where: { viewerId },
      include: {
        film: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getViewsByFilm(filmId: string) {
    return await prisma.view.findMany({
      where: { filmId },
      include: {
        viewer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateView(id: string, data: Partial<{
    duration: number;
    completed: boolean;
  }>) {
    return await prisma.view.update({
      where: { id },
      data,
    });
  }

  // ============================================
  // ANALYTICS OPERATIONS
  // ============================================

  async getFilmAnalytics(filmId: string) {
    const [film, purchases, views] = await Promise.all([
      this.getFilmById(filmId),
      this.getPurchasesByFilm(filmId),
      this.getViewsByFilm(filmId),
    ]);

    if (!film) throw new Error('Film not found');

    const totalDuration = views.reduce((sum: any, view: { duration: any; }) => sum + view.duration, 0);
    const completedViews = views.filter((view: { completed: any; }) => view.completed).length;

    return {
      film: {
        id: film.id,
        title: film.title,
        totalViews: film.totalViews,
        totalRevenue: film.totalRevenue,
      },
      purchases: purchases.length,
      views: views.length,
      averageViewDuration: views.length > 0 ? totalDuration / views.length : 0,
      completionRate: views.length > 0 ? completedViews / views.length : 0,
    };
  }

  async getProducerRevenue(producerId: string) {
    const films = await prisma.film.findMany({
      where: { producerId },
      include: {
        purchases: true,
        views: true,
      },
    });

    const totalRevenue = films.reduce((sum: bigint, film: { totalRevenue: string | number | bigint | boolean; }) => {
      return sum + BigInt(String(film.totalRevenue));
    }, BigInt(0));

    const totalViews = films.reduce((sum: any, film: { totalViews: any; }) => sum + film.totalViews, 0);
    const totalPurchases = films.reduce((sum: any, film: { purchases: string | any[]; }) => sum + film.purchases.length, 0);

    return {
      producerId,
      summary: {
        totalFilms: films.length,
        totalRevenue: totalRevenue.toString(),
        totalViews,
        totalPurchases,
      },
      films: films.map((film: { id: any; title: any; totalRevenue: any; totalViews: any; purchases: string | any[]; }) => ({
        id: film.id,
        title: film.title,
        totalRevenue: film.totalRevenue,
        totalViews: film.totalViews,
        purchases: film.purchases.length,
      })),
    };
  }

  // ============================================
  // UTILITY OPERATIONS
  // ============================================

  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected' };
    } catch (error) {
      return { status: 'unhealthy', database: 'disconnected', error };
    }
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export default new DatabaseService();
