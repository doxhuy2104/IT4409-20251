import { Router } from 'express';
import { verifyToken } from '../middlewares/authenticate.middleware';
import { getMe } from '../controllers/auth.controller';
import { updateProfile } from '../controllers/customers/customer.controller';
const router = Router();

router.use(verifyToken);

router.get('/me', getMe);

router.put('/me', updateProfile);


export default router;
