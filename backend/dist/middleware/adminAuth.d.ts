import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        walletAddress?: string;
        [key: string]: any;
    };
}
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export {};
//# sourceMappingURL=adminAuth.d.ts.map