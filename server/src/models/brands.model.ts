import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Brands extends Model<
	InferAttributes<Brands>,
	InferCreationAttributes<Brands>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare logoUrl: CreationOptional<string>;
	declare description: CreationOptional<string>;
	declare categoryId: CreationOptional<number> | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Brands.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				name: {
					type: DataTypes.STRING(100),
					allowNull: false,
					unique: true,
				},
				logoUrl: DataTypes.STRING(255),
				description: DataTypes.TEXT,
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
				categoryId: DataTypes.INTEGER,
			},
			{
				sequelize,
				tableName: 'Brands',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'brand', plural: 'brands' },
			},
		);
	};
}
