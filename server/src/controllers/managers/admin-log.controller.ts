import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../../utility/response.util';
import * as adminLogService from '../../services/managers/admin-log.service';
import { db } from '../../loaders/database.loader';

export const getAdminLogs = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const {
			id = '',
			adminId = '',
			username = '',
			email = '',
			action = '',
			entityType = '',
			entityId = '',
			details = '',
			fromDate = '',
			toDate = '',
			page = 1, 
			limit = 20, 
		} = req.query;

		const offset =
			(parseInt(page as string) - 1) * parseInt(limit as string);
		const pageLimit = parseInt(limit as string);

		const filters = {
			id: id ? Number(id) : undefined,
			adminId: adminId ? Number(adminId) : undefined,
			username: username as string,
			email: email as string,
			action: action as string,
			entityType: entityType as string,
			entityId: entityId ? Number(entityId) : undefined,
			details: details as string,
			fromDate: fromDate ? new Date(fromDate as string) : undefined,
			toDate: toDate ? new Date(toDate as string) : undefined,
			offset,
			page: parseInt(page as string),
			limit: pageLimit,
		};

		const [rows, count] = await adminLogService.getAdminLogs(
			filters,
			transaction,
		);
		await transaction.commit();
		return res
			.status(200)
			.json(
				new ResOk().formatResponse(
					rows,
					'Admin logs retrieved successfully',
					200,
					filters.limit,
					filters.page,
					count as any,
				),
			);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const deleteAdminLogs = async (
    req: Request,
    res: Response, 
    next: NextFunction
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const id = Number(req.params.id);

		await adminLogService.deleteAdminLog(id, transaction);

		await transaction.commit();
		return res
			.status(200)
			.json(new ResOk().formatResponse({ message: 'Deleted successfully' }));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const getAdminLogDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const transaction = await db.sequelize.transaction();
  try {
    const id = Number(req.params.id);

    const log = await adminLogService.getAdminLogById(id, transaction);

    await transaction.commit();
    return res
      .status(200)
      .json(
        new ResOk().formatResponse(
          log,
          'Đã tìm thấy log.',
        ),
      );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
