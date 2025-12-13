import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class AdminLogs extends Model<
	InferAttributes<AdminLogs>,
	InferCreationAttributes<AdminLogs>
> {
	declare id: CreationOptional<number>;
	declare adminId: number;
	declare action: string;
	declare entityType: CreationOptional<string>;
	declare entityId: CreationOptional<number>;
	declare details: CreationOptional<any>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		AdminLogs.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				adminId: { type: DataTypes.INTEGER, allowNull: false },
				action: { type: DataTypes.STRING(100), allowNull: false },
				entityType: DataTypes.STRING(50),
				entityId: DataTypes.INTEGER,
				details: DataTypes.JSON,
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'AdminLogs',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'adminLog', plural: 'adminLogs' },
			},
		);
	};
}
