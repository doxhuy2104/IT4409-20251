import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Customers extends Model<
	InferAttributes<Customers>,
	InferCreationAttributes<Customers>
> {
	declare id: CreationOptional<number>;
	declare fullName: string;
	declare email: CreationOptional<string>;
	declare phone: CreationOptional<string>;
	declare passwordHash: CreationOptional<string>;
	declare address: CreationOptional<string>;
	declare isActive: CreationOptional<boolean>;
	declare isBlock: CreationOptional<boolean>;
	declare googleId: CreationOptional<string>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Customers.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				fullName: { type: DataTypes.STRING(100), allowNull: true },
				email: { type: DataTypes.STRING(100), unique: true },
				phone: { type: DataTypes.STRING(20) },
				passwordHash: DataTypes.STRING(255),
				address: DataTypes.TEXT,
				isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
				isBlock: { type: DataTypes.BOOLEAN, defaultValue: false },
				googleId: { type: DataTypes.STRING(100), allowNull: true },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Customers',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'customer', plural: 'customers' },
			},
		);
	};
}
