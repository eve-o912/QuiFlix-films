import { Model, Optional } from 'sequelize';
import User from './User';
import Film from './Film';
interface PurchaseAttributes {
    id: number;
    buyerId: number;
    filmId: number;
    tokenId: number;
    transactionHash: string;
    price: string;
    gasUsed: string;
    createdAt: Date;
    updatedAt: Date;
}
interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
    id: number;
    buyerId: number;
    filmId: number;
    tokenId: number;
    transactionHash: string;
    price: string;
    gasUsed: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    buyer?: User;
    film?: Film;
}
export default Purchase;
//# sourceMappingURL=Purchase.d.ts.map