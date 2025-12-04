import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class AttributeValues extends Model<
	InferAttributes<AttributeValues>,
	InferCreationAttributes<AttributeValues>
> {
	declare id: CreationOptional<number>;
	declare attributeTypeId: number;
	declare value: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		AttributeValues.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				attributeTypeId: { type: DataTypes.INTEGER, allowNull: false },
				value: { type: DataTypes.STRING(100), allowNull: false },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'AttributeValues',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'attributeValue', plural: 'attributeValues' },
			},
		);
	};
}
