import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Wishlists extends Model<
	InferAttributes<Wishlists>,
	InferCreationAttributes<Wishlists>
> {
	declare id: CreationOptional<number>;
	declare customerId: number;
	declare productId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Wishlists.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				customerId: { type: DataTypes.INTEGER, allowNull: false },
				productId: { type: DataTypes.INTEGER, allowNull: false },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Wishlists',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'wishlist', plural: 'wishlists' },
			},
		);
	};
}
