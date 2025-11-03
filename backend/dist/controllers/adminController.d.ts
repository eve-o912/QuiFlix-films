import { Request, Response } from 'express';
import { User } from '../storage';
interface AuthenticatedRequest extends Request {
    user?: User;
    walletAddress?: string;
}
export declare const getAdminAnalytics: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const removeFilm: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllFilmsAdmin: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=adminController.d.ts.map