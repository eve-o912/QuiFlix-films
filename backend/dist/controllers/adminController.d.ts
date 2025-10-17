import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        walletAddress?: string;
        username?: string;
        isProducer?: boolean;
        profileImage?: string;
        createdAt?: string;
    };
    walletAddress?: string;
}
export declare const getAdminAnalytics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const removeFilm: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllFilmsAdmin: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=adminController.d.ts.map