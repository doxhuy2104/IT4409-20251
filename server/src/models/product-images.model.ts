import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class ProductImages extends Model<
	InferAttributes<ProductImages>,
	InferCreationAttributes<ProductImages>
> {
	declare id: CreationOptional<number>;
	declare variantId: CreationOptional<number>;
	declare productId: number;
	declare publicId: string;
	declare imageUrl: string;
	declare isPrimary: CreationOptional<boolean>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		ProductImages.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				variantId: DataTypes.INTEGER,
				productId: { type: DataTypes.INTEGER },
				publicId: {
					type: DataTypes.STRING(255),
					allowNull: false,
				},
				imageUrl: { type: DataTypes.STRING(255), allowNull: false },
				isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'ProductImages',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'productImage', plural: 'productImages' },
			},
		);
	};
}
