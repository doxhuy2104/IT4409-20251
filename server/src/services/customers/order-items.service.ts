import {db} from '../../loaders/database.loader';
import  {Transaction} from 'sequelize';

export const createOrderItem = (
    orderItemData: any, 
    transaction?: Transaction
) => db.orderItems.bulkCreate(orderItemData, { transaction });

export const deleteOrderById = (id: string) => db.orderItems.destroy({ where: { id } });
