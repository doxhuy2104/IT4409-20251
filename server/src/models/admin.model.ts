import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Admins extends Model<
	InferAttributes<Admins>,
	InferCreationAttributes<Admins>
> {
	declare id: CreationOptional<number>;
	declare username: string;
	declare passwordHash: string;
	declare fullName: string;
	declare email: CreationOptional<string>;
	declare phone: CreationOptional<string>;
	declare role: CreationOptional<'super_admin' | 'manager' | 'staff'>;
	declare isActive: CreationOptional<boolean>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Admins.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				username: {
					type: DataTypes.STRING(50),
					allowNull: false,
					unique: true,
				},
				passwordHash: { type: DataTypes.STRING(255), allowNull: false },
				fullName: { type: DataTypes.STRING(100), allowNull: false },
				email: { type: DataTypes.STRING(100), unique: true },
				phone: { type: DataTypes.STRING(20), unique: true },
				role: {
					type: DataTypes.ENUM('super_admin', 'manager', 'staff'),
					defaultValue: 'staff',
				},
				isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Admins',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'admin', plural: 'admins' },
			},
		);
	};
}
