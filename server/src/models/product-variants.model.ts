import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class ProductVariants extends Model<
	InferAttributes<ProductVariants>,
	InferCreationAttributes<ProductVariants>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare productId: number;
	declare slug: string;
	declare sku: string;
	declare price: number;
	declare discountPrice: CreationOptional<number>;
	declare stock: CreationOptional<number>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		ProductVariants.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				name: { type: DataTypes.STRING(255), allowNull: false },
				productId: { type: DataTypes.INTEGER, allowNull: false },
				slug: {
					type: DataTypes.STRING(255),
					allowNull: false,
					unique: true,
				},
				sku: {
					type: DataTypes.STRING(50),
					allowNull: false,
					unique: true,
				},
				price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
				discountPrice: DataTypes.DECIMAL(15, 2),
				stock: { type: DataTypes.INTEGER, defaultValue: 0 },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'ProductVariants',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'productVariant', plural: 'productVariants' },
			},
		);
	};
}
