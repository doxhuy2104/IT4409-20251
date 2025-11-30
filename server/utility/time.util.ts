export class TimeUtil {
	static monthDiff(dateFrom: Date, dateTo: Date) {
		return (
			new Date(dateTo).getMonth() +
			1 -
			new Date(dateFrom).getMonth() +
			12 *
				(new Date(dateTo).getFullYear() -
					new Date(dateFrom).getFullYear())
		);
	}

	static dayDiff(dateFrom: Date, dateTo: Date) {
		return (
			Math.ceil(
				(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
					(1000 * 3600 * 24),
			) + 1
		);
	}
	static parseTimeToMs(timeString: string): number {
		const regex = /^(\d+)([dhms])$/;
		const match = timeString.match(regex);

		if (!match) {
			const directParse = parseInt(timeString);
			return isNaN(directParse) ? 0 : directParse * 1000;
		}

		const value = parseInt(match[1]);
		const unit = match[2];

		switch (unit) {
			case 'd':
				return value * 24 * 60 * 60 * 1000;
			case 'h':
				return value * 60 * 60 * 1000;
			case 'm':
				return value * 60 * 1000;
			case 's':
				return value * 1000;
			default:
				return 0;
		}
	}
}
