export class ResOk {
	formatResponse(
		data: any,
		message?: string,
		statusCode?: number,
		limit?: number,
		page?: number,
		total?: number,
	) {
		const response: any = {
			statusCode,
			message,
			data,
		};

		if (limit !== undefined && page !== undefined && total !== undefined) {
			response.meta = {
				limit,
				page,
				total,
			};
		}

		return response;
	}
}
