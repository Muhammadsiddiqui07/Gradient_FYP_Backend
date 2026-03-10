import express from 'express';
import userRouter from '../controller/user.js'

const router = express.Router()

router.use('/users', userRouter)

export default router;