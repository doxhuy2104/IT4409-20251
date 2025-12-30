import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Warehouses extends Model<
	InferAttributes<Warehouses>,
	InferCreationAttributes<Warehouses>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare location: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Warehouses.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				name: { type: DataTypes.STRING(100), allowNull: false },
				location: { type: DataTypes.TEXT, allowNull: false },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Warehouses',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'warehouse', plural: 'warehouses' },
			},
		);
	};
}
