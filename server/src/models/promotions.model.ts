import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Promotions extends Model<
	InferAttributes<Promotions>,
	InferCreationAttributes<Promotions>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare discountPercent: CreationOptional<number>;
	declare discountAmount: CreationOptional<number>;
	declare minimumPurchaseAmount: CreationOptional<number>;
	declare maximumDiscountAmount: CreationOptional<number>;
	declare discountCode: CreationOptional<string>;
	declare usageLimit: CreationOptional<number>;
	declare usageCount: CreationOptional<number>;
	declare usageLimitPerCustomer: CreationOptional<string>;
	declare isActive: CreationOptional<boolean>;
	declare isDeleted: CreationOptional<boolean>;
	declare isExpired: CreationOptional<boolean>;
	declare startDate: Date;
	declare endDate: Date;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Promotions.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				name: { type: DataTypes.STRING(100), allowNull: false },
				discountPercent: DataTypes.DECIMAL(5, 2),
				discountAmount: DataTypes.DECIMAL(15, 2),
				minimumPurchaseAmount: DataTypes.DECIMAL(15, 2),
				maximumDiscountAmount: DataTypes.DECIMAL(15, 2),
				discountCode: { type: DataTypes.STRING(50), unique: true },
				usageLimit: DataTypes.INTEGER,
				usageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
				usageLimitPerCustomer: DataTypes.STRING,
				isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
				isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
				isExpired: { type: DataTypes.BOOLEAN, defaultValue: false },
				startDate: { type: DataTypes.DATE, allowNull: false },
				endDate: { type: DataTypes.DATE, allowNull: false },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Promotions',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'promotion', plural: 'promotions' },
			},
		);
	};
}
