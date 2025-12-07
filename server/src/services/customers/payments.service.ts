import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const getPayments = async (orderId: string, transaction?: Transaction) => {
  const payments = await db.payments.findAll({
    where: {
      orderId: orderId,
    }, transaction});
  return payments;
}

export const createPayment = async (payment: any, transaction?: Transaction) => {
  const newPayment = await db.payments.create(payment, {transaction});
  return newPayment;
}

export const updatePayment = async (paymentId: string, payment: any, transaction?: Transaction) => {
  const updatedPayment = await db.payments.update(payment, {
    where: {
      id: paymentId,
    },
    transaction
  });
  return updatedPayment;
}

export const deletePayment = async (paymentId: string, transaction?: Transaction) => {
  const deletedPayment = await db.payments.destroy({
    where: {
      id: paymentId,
    },
    transaction
  });
  return deletedPayment;
}