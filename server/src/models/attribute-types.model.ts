import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class AttributeTypes extends Model<
	InferAttributes<AttributeTypes>,
	InferCreationAttributes<AttributeTypes>
> {
	declare id: CreationOptional<number>;
	declare categoryId: CreationOptional<number>;
	declare parentId: CreationOptional<number>;
	declare name: string;
	declare description: CreationOptional<string>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		AttributeTypes.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				categoryId: {
					type: DataTypes.INTEGER,
				},
				parentId: {
					type: DataTypes.INTEGER,
				},
				name: {
					type: DataTypes.STRING(100),
					allowNull: false,
					unique: true,
				},
				description: DataTypes.TEXT,
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'AttributeTypes',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'attributeType', plural: 'attributeTypes' },
			},
		);
	};
}
