import { Model, Optional } from 'sequelize';
import User from './User';
interface FilmAttributes {
    id: number;
    title: string;
    description: string;
    genre: string;
    duration: number;
    releaseDate: Date;
    producerId: number;
    ipfsHash: string;
    price: string;
    tokenId?: number;
    contractAddress?: string;
    isActive: boolean;
    totalViews: number;
    totalRevenue: string;
    thumbnailUrl?: string;
    trailerUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface FilmCreationAttributes extends Optional<FilmAttributes, 'id' | 'tokenId' | 'contractAddress' | 'isActive' | 'totalViews' | 'totalRevenue' | 'createdAt' | 'updatedAt'> {
}
declare class Film extends Model<FilmAttributes, FilmCreationAttributes> implements FilmAttributes {
    id: number;
    title: string;
    description: string;
    genre: string;
    duration: number;
    releaseDate: Date;
    producerId: number;
    ipfsHash: string;
    price: string;
    tokenId?: number;
    contractAddress?: string;
    isActive: boolean;
    totalViews: number;
    totalRevenue: string;
    thumbnailUrl?: string;
    trailerUrl?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    producer?: User;
}
export default Film;
//# sourceMappingURL=Film.d.ts.map