import { JSONSchemaType } from 'ajv';

interface loginInterface {
	email: string;
	password: string;
}

interface registerInterface {
	email: string;
	fullName: string;
	password: string;
	phone: string;
	address?: string;
}

interface verifyInterface {
	token: string;
	email: string;
}

interface forgotPasswordInterface {
	email: string;
}

interface resetPasswordInterface {
	token: string;
	email: string;
	newPassword: string;
}

export const loginSchema: JSONSchemaType<loginInterface> = {
	type: 'object',
	properties: {
		password: { type: 'string', nullable: false },
		email: { type: 'string', nullable: false, format: 'email' },
	},
	required: ['email', 'password'],
	additionalProperties: false,
};

export const registerSchema: JSONSchemaType<registerInterface> = {
	type: 'object',
	properties: {
		email: { type: 'string', nullable: false, format: 'email' },
		fullName: { type: 'string', nullable: false },
		password: { type: 'string', nullable: false, minLength: 6 },
		phone: { type: 'string', nullable: false },
		address: { type: 'string', nullable: true },
	},
	required: ['email', 'fullName', 'password', 'phone'],
	additionalProperties: false,
};

export const verifySchema: JSONSchemaType<verifyInterface> = {
	type: 'object',
	properties: {
		token: { type: 'string', nullable: false },
		email: { type: 'string', nullable: false, format: 'email' },
	},
	required: ['token', 'email'],
	additionalProperties: false,
};

export const forgotPasswordSchema: JSONSchemaType<forgotPasswordInterface> = {
	type: 'object',
	properties: {
		email: { type: 'string', nullable: false, format: 'email' },
	},
	required: ['email'],
	additionalProperties: false,
};

export const resetPasswordSchema: JSONSchemaType<resetPasswordInterface> = {
	type: 'object',
	properties: {
		token: { type: 'string', nullable: false },
		email: { type: 'string', nullable: false, format: 'email' },
		newPassword: { type: 'string', nullable: false, minLength: 6 },
	},
	required: ['token', 'email', 'newPassword'],
	additionalProperties: false,
};
