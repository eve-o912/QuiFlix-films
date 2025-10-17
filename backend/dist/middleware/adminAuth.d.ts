import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        walletAddress?: string;
        username?: string;
        isProducer?: boolean;
        profileImage?: string;
        createdAt?: string;
        email?: string;
    };
    walletAddress?: string;
}
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response | void;
export {};
//# sourceMappingURL=adminAuth.d.ts.map