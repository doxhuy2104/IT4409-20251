import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Categories extends Model<
	InferAttributes<Categories>,
	InferCreationAttributes<Categories>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare description: CreationOptional<string>;
	declare parentId: CreationOptional<number> | null;
	declare brandId: CreationOptional<number> | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Categories.init(
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
				description: DataTypes.TEXT,
				parentId: DataTypes.INTEGER,
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
				brandId: DataTypes.INTEGER,
			},
			{
				sequelize,
				tableName: 'Categories',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'category', plural: 'categories' },
			},
		);
	};
}
