import { Request, Response } from 'express';
import { db } from '../loaders/database.loader';
import { changeStock } from '../services/customers/orders.service';
import { CassoService } from '../services/payments/casso.service';
import { ResOk } from '../utility/response.util';

export class PaymentController {

	/**
	 * Kiểm tra thanh toán từ Casso (QR code)
	 */
	public static async checkPayment(
		req: Request,
		res: Response,
	): Promise<void> {
		const transaction = await db.sequelize.transaction();
		try {
			const { orderId } = req.params;

			if (!orderId) {
				res.status(400).json(
					new ResOk().formatResponse(
						null,
						'Thiếu mã đơn hàng',
						400,
					),
				);
				return;
			}

			const orderIdNum = parseInt(orderId, 10);
			if (isNaN(orderIdNum)) {
				res.status(400).json(
					new ResOk().formatResponse(
						null,
						'Mã đơn hàng không hợp lệ',
						400,
					),
				);
				return;
			}

			// Lấy thông tin đơn hàng
			const order = await db.orders.findByPk(orderIdNum, {
				include: [{ model: db.payments }],
				transaction,
			});

			if (!order) {
				await transaction.rollback();
				res.status(404).json(
					new ResOk().formatResponse(
						null,
						'Không tìm thấy đơn hàng',
						404,
					),
				);
				return;
			}

			// Kiểm tra đơn hàng có phải draft không (chưa thanh toán)
			if (order.status !== 'draft') {
				await transaction.commit();
				res.status(200).json(
					new ResOk().formatResponse(
						{
							paid: true,
							message: 'Đơn hàng đã được thanh toán',
							orderStatus: order.status,
						},
						'Đơn hàng đã được thanh toán',
						200,
					),
				);
				return;
			}

			// Tạo description để tìm transaction (format: DH{orderId})
			const description = `ORDER${orderIdNum}`;
			const amount = Math.round(parseFloat(order.totalAmount.toString()));

			// Tính ngày bắt đầu tìm (7 ngày gần nhất)
			const fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - 7);

			// Tìm transaction từ Casso
			const transaction_found = await CassoService.findTransactionByDescription(
				description,
				amount,
				fromDate.toISOString().split('T')[0],
			);

			if (transaction_found) {
				// Tìm thấy transaction, cập nhật đơn hàng
				const payment = await db.payments.findOne({
					where: { orderId: orderIdNum },
					transaction,
				});

				if (payment) {
					await payment.update(
						{
							status: 'success',
							transactionId: transaction_found.tid || undefined,
						},
						{ transaction },
					);
				}

				// Cập nhật status đơn hàng từ draft sang pending
				await order.update({ status: 'pending' }, { transaction });

				// Change stock
				await changeStock(orderIdNum, transaction);

				await transaction.commit();

				res.status(200).json(
					new ResOk().formatResponse(
						{
							paid: true,
							message: 'Đã tìm thấy giao dịch thanh toán',
							transaction: {
								id: transaction_found.id,
								tid: transaction_found.tid,
								amount: transaction_found.amount,
								when: transaction_found.when,
								description: transaction_found.description,
							},
							orderStatus: 'pending',
						},
						'Thanh toán thành công',
						200,
					),
				);
				return;
			} else {
				await transaction.commit();
				res.status(200).json(
					new ResOk().formatResponse(
						{
							paid: false,
							message: 'Chưa tìm thấy giao dịch thanh toán',
						},
						'Chưa có giao dịch thanh toán',
						200,
					),
				);
				return;
			}
		} catch (error: any) {
			await transaction.rollback();
			console.error('Check payment error:', error);
			res.status(500).json(
				new ResOk().formatResponse(
					null,
					`Lỗi khi kiểm tra thanh toán: ${error.message || 'Lỗi không xác định'
					}`,
					500,
				),
			);
		}
	}
}

export default PaymentController;
