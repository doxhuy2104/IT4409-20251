import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { loginSchema } from './auth.validator';

const ajv = new Ajv(
	{
		allErrors: true,
	}
);

addFormats(ajv);

export {
	ajv,
	loginSchema,
};
