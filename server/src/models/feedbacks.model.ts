import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Feedbacks extends Model<
	InferAttributes<Feedbacks>,
	InferCreationAttributes<Feedbacks>
> {
	declare id: CreationOptional<number>;
	declare userId: CreationOptional<number>;
	declare name: string;
	declare description: CreationOptional<string>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Feedbacks.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				userId: DataTypes.INTEGER,
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
				tableName: 'Feedbacks',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'feedback', plural: 'feedbacks' },
			},
		);
	};
}
