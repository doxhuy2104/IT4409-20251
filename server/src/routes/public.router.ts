import { Router } from 'express';
import * as categoriesController from '../controllers/public/categories.controller';
import * as brandsController from '../controllers/public/brands.controller';
import * as attributeTypesController from '../controllers/public/attribute-types.controller';
import * as attributeValuesController from '../controllers/public/attribute-values.controller';

const router = Router();

router.get('/categories', categoriesController.getCategories);
router.get('/brands', brandsController.getBrands);
router.get('/brands/:categoryId', brandsController.getBrandsByCategoryId);
router.get(
	'/attribute-types/:categoryId',
	attributeTypesController.getAttributeByCategoryId,
);
router.get(
	'/attribute-values/:attributeTypeId',
	attributeValuesController.getAttributeValuesByAttributeId,
);

export default router;
