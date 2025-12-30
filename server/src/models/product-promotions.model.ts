import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class ProductPromotions extends Model<
	InferAttributes<ProductPromotions>,
	InferCreationAttributes<ProductPromotions>
> {
	declare productId: number;
	declare promotionId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		ProductPromotions.init(
			{
				productId: { type: DataTypes.INTEGER, primaryKey: true },
				promotionId: { type: DataTypes.INTEGER, primaryKey: true },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'ProductPromotions',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: {
					singular: 'productPromotion',
					plural: 'productPromotions',
				},
			},
		);
	};
}
