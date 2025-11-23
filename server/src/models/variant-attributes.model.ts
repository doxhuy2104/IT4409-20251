import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class VariantAttributes extends Model<
	InferAttributes<VariantAttributes>,
	InferCreationAttributes<VariantAttributes>
> {
	declare id: CreationOptional<number>;
	declare productId: CreationOptional<number>;
	declare variantId: CreationOptional<number>;
	declare attributeTypeId: CreationOptional<number>;
	declare attributeValueId: CreationOptional<number>;
	declare name: CreationOptional<string>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		VariantAttributes.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				productId: { type: DataTypes.INTEGER },
				variantId: { type: DataTypes.INTEGER },
				attributeValueId: { type: DataTypes.INTEGER },
				attributeTypeId: { type: DataTypes.INTEGER },
				name: {
					type: DataTypes.STRING(100),
				},
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'VariantAttributes',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: {
					singular: 'variantAttribute',
					plural: 'variantAttributes',
				},
			},
		);
	};
}
