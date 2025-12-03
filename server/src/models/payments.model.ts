import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Payments extends Model<
	InferAttributes<Payments>,
	InferCreationAttributes<Payments>
> {
	declare id: CreationOptional<number>;
	declare orderId: number;
	declare amount: number;
	declare paymentMethod: string;
	declare transactionId: CreationOptional<string>;
	declare status: CreationOptional<'pending' | 'success' | 'failed'>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Payments.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				orderId: { type: DataTypes.INTEGER, allowNull: false },
				amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
				paymentMethod: { type: DataTypes.STRING(50), allowNull: false },
				transactionId: DataTypes.STRING(100),
				status: {
					type: DataTypes.ENUM('pending', 'success', 'failed'),
					defaultValue: 'pending',
				},
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Payments',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'payment', plural: 'payments' },
			},
		);
	};
}
