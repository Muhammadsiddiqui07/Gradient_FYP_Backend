import express from 'express';
import userRouter from '../controller/user.js'
import mapRouter from './map.js';
import aiRouter from './ai.js';
import papersRouter from './papers.js';

const router = express.Router()

router.use('/users', userRouter)
router.use('/map', mapRouter)
router.use('/ai', aiRouter)
router.use('/papers', papersRouter)

export default router;