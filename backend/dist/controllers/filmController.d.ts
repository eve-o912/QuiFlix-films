import { Request, Response } from 'express';
interface User {
    id: string;
    email: string;
    walletAddress?: string;
    username?: string;
    isProducer?: boolean;
    profileImage?: string;
    createdAt?: string;
}
interface AuthenticatedRequest extends Request {
    user?: User;
    walletAddress?: string;
}
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadFilm: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const purchaseFilm: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const streamFilm: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resellNFT: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFilmAnalytics: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProducerRevenue: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllFilms: (req: Request, res: Response) => Promise<void>;
export declare const approveFilm: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFilmById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=filmController.d.ts.map