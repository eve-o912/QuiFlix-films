import { Model, Optional } from 'sequelize';
import User from './User';
import Film from './Film';
interface ViewAttributes {
    id: number;
    viewerId: number;
    filmId: number;
    duration: number;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface ViewCreationAttributes extends Optional<ViewAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class View extends Model<ViewAttributes, ViewCreationAttributes> implements ViewAttributes {
    id: number;
    viewerId: number;
    filmId: number;
    duration: number;
    completed: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    viewer?: User;
    film?: Film;
}
export default View;
//# sourceMappingURL=View.d.ts.map