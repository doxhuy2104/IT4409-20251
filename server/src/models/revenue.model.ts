
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface RevenueAttributes {
    id: number;
    date: Date; // Use DateOnly in DB usually, but Date in JS
    totalRevenue: number;
    totalOrders: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface RevenueCreationAttributes extends Optional<RevenueAttributes, 'id'> { }

export class Revenue extends Model<RevenueAttributes, RevenueCreationAttributes>
    implements RevenueAttributes {
    public id!: number;
    public date!: Date;
    public totalRevenue!: number;
    public totalOrders!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public static initClass(sequelize: Sequelize) {
        Revenue.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                    unique: true,
                },
                totalRevenue: {
                    type: DataTypes.DECIMAL(15, 2),
                    allowNull: false,
                    defaultValue: 0,
                },
                totalOrders: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
            },
            {
                sequelize,
                tableName: 'Revenues',
                timestamps: true,
            },
        );
    }
}
