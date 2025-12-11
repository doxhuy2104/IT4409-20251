import {
	CreationOptional,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
	DataTypes,
} from 'sequelize';
export class Reviews extends Model<
	InferAttributes<Reviews>,
	InferCreationAttributes<Reviews>
> {
	declare id: CreationOptional<number>;
	declare productId: number;
	declare customerId: number;
	declare rating: CreationOptional<number>;
	declare comment: CreationOptional<string>;
	declare isApproved: CreationOptional<boolean>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	static initClass = (sequelize: Sequelize) => {
		Reviews.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				productId: { type: DataTypes.INTEGER, allowNull: false },
				customerId: { type: DataTypes.INTEGER, allowNull: false },
				rating: DataTypes.INTEGER,
				comment: DataTypes.TEXT,
				isApproved: { type: DataTypes.BOOLEAN, defaultValue: true },
				createdAt: DataTypes.DATE,
				updatedAt: DataTypes.DATE,
			},
			{
				sequelize,
				tableName: 'Reviews',
				timestamps: true,
				createdAt: 'createdAt',
				updatedAt: 'updatedAt',
				name: { singular: 'review', plural: 'reviews' },
			},
		);
	};
}
