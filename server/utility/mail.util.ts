import { createTransport, TransportOptions } from 'nodemailer';
import env from '../../env';

const transport = createTransport({
	host: env.mail.host,
	port: env.mail.port,
	auth: {
		user: env.mail.user,
		pass: env.mail.pass,
	},
} as TransportOptions);

export const sendMail = async (
	toUsers: string,
	subject: string,
	text?: string,
	html?: string,
) => {
	const info = await transport.sendMail({
		from: env.mail.from,
		to: toUsers,
		subject,
		text,
		html,
	});

	return info;
};
