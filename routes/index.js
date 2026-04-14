import express from 'express';
import userRouter from '../controller/user.js'
import mapRouter from '../controller/map.js';
import aiRouter from '../controller/ai.js';
import papersRouter from '../controller/papers.js';
import geographyRouter from '../controller/geography.js';

const router = express.Router()

router.use('/users', userRouter)
router.use('/map', mapRouter)
router.use('/ai', aiRouter)
router.use('/papers', papersRouter)
router.use('/geography', geographyRouter)

export default router;