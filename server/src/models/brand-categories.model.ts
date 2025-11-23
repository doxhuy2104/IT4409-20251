import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';

export class BrandCategories extends Model<
	InferAttributes<BrandCategories>,
	InferCreationAttributes<BrandCategories>
> {
	declare id: CreationOptional<number>;
	declare brandId: number;
	declare categoryId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	static initClass = (sequelize: Sequelize) => {
		BrandCategories.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				brandId: {
					type: DataTypes.INTEGER,
					allowNull: false,
					references: {
						model: 'Brands',
						key: 'id',
					},
				},
				categoryId: {
					type: DataTypes.INTEGER,
					allowNull: false,
					references: {
						model: 'Categories',
						key: 'id',
					},
				},
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'BrandCategories',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'brandCategory', plural: 'brandCategories' },
				indexes: [
					{
						unique: true,
						fields: ['brandId', 'categoryId'],
					},
				],
			},
		);
	};
}
