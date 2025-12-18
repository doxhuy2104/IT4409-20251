import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Products extends Model<
	InferAttributes<Products>,
	InferCreationAttributes<Products>
> {
	declare id: CreationOptional<number>;
	declare isHidden: CreationOptional<boolean>;
	declare name: string;
	declare slug: string;
	declare categoryId: number;
	declare brandId: number;
	declare description: CreationOptional<string>;
	declare price: number;
	declare stock: CreationOptional<number>;
	declare isActive: CreationOptional<boolean>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Products.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				isHidden: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				name: { type: DataTypes.STRING(255), allowNull: false },
				slug: {
					type: DataTypes.STRING(255),
					allowNull: false,
					unique: true,
				},
				categoryId: { type: DataTypes.INTEGER, allowNull: false },
				brandId: { type: DataTypes.INTEGER, allowNull: false },
				description: DataTypes.TEXT,
				price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
				stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
				isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Products',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'product', plural: 'products' },
			},
		);
	};
}
