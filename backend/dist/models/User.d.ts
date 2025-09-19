import { Model, Optional } from 'sequelize';
interface UserAttributes {
    id: number;
    walletAddress: string;
    email?: string;
    username?: string;
    profileImage?: string;
    isProducer: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    walletAddress: string;
    email?: string;
    username?: string;
    profileImage?: string;
    isProducer: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    getPurchases: (options?: any) => Promise<any[]>;
    getViews: (options?: any) => Promise<any[]>;
    getFilms: (options?: any) => Promise<any[]>;
}
export default User;
//# sourceMappingURL=User.d.ts.map