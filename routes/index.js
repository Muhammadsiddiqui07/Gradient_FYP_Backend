import express from 'express';
import userRouter from '../controller/user.js'
import mapRouter from './map.js';

const router = express.Router()

router.use('/users', userRouter)
router.use('/map', mapRouter)

export default router;