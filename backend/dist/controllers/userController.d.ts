import { Request, Response } from 'express';
import { User } from '../models';
interface AuthenticatedRequest extends Request {
    user?: User;
    walletAddress?: string;
}
export declare const authenticateUser: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateUserProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const becomeProducer: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserNFTs: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserPurchases: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserViews: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getSignMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=userController.d.ts.map