import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
interface AuthenticatedRequest extends Request {
    user?: User;
    walletAddress?: string;
}
export declare const verifyToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyWalletSignature: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyNFTOwnership: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireProducer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateToken: (walletAddress: string, userId: number) => string;
export declare const generateSignMessage: (walletAddress: string, timestamp: number) => string;
export {};
//# sourceMappingURL=auth.d.ts.map