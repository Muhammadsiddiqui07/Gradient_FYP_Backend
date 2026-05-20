import express from 'express';
import AdminServices from "../services/admin.js"

const router = express.Router();

router.use('/', AdminServices)

export default router;