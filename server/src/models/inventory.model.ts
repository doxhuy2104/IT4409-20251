import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Inventory extends Model<
	InferAttributes<Inventory>,
	InferCreationAttributes<Inventory>
> {
	declare id: CreationOptional<number>;
	declare warehouseId: number;
	declare productId: number;
	declare quantity: CreationOptional<number>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Inventory.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				warehouseId: { type: DataTypes.INTEGER, allowNull: false },
				productId: { type: DataTypes.INTEGER, allowNull: false },
				quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Inventory',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'inventory', plural: 'inventory' },
			},
		);
	};
}
