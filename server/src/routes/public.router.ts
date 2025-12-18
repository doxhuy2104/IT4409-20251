import { Router } from 'express';
import * as categoriesController from '../controllers/public/categories.controller';
import * as brandsController from '../controllers/public/brands.controller';

const router = Router();

router.get('/categories', categoriesController.getCategories);
router.get('/brands', brandsController.getBrands);
router.get('/brands/:categoryId', brandsController.getBrandsByCategoryId);

export default router;
