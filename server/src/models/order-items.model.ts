import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class OrderItems extends Model<
	InferAttributes<OrderItems>,
	InferCreationAttributes<OrderItems>
> {
	declare id: CreationOptional<number>;
	declare orderId: number;
	declare variantId: number;
	declare quantity: number;
	declare priceAtTime: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		OrderItems.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				orderId: { type: DataTypes.INTEGER, allowNull: false },
				variantId: { type: DataTypes.INTEGER, allowNull: false },
				quantity: { type: DataTypes.INTEGER, allowNull: false },
				priceAtTime: {
					type: DataTypes.DECIMAL(15, 2),
					allowNull: false,
				},
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'OrderItems',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'orderItem', plural: 'orderItems' },
			},
		);
	};
}
