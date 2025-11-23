import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class CartItems extends Model<
	InferAttributes<CartItems>,
	InferCreationAttributes<CartItems>
> {
	declare id: CreationOptional<number>;
	declare cartId: number;
	declare variantId: number;
	declare quantity: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		CartItems.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				cartId: { type: DataTypes.INTEGER, allowNull: false },
				variantId: { type: DataTypes.INTEGER, allowNull: false },
				quantity: { type: DataTypes.INTEGER, allowNull: false },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'CartItems',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'cartItem', plural: 'cartItems' },
			},
		);
	};
}
