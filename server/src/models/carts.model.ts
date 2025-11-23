import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Carts extends Model<
	InferAttributes<Carts>,
	InferCreationAttributes<Carts>
> {
	declare id: CreationOptional<number>;
	declare customerId: CreationOptional<number>;
	declare sessionId: CreationOptional<string>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Carts.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				customerId: DataTypes.INTEGER,
				sessionId: DataTypes.STRING(255),
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Carts',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'cart', plural: 'carts' },
			},
		);
	};
}
