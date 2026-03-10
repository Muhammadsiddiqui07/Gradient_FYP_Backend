import express from 'express'
import users from '../services/user.js'

const router = express.Router()

router.use('/', users)

export default router