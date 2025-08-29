import { Router } from 'express'
import { login, register, refresh, logout } from '../controllers/auth.controller'
import { validate } from '../middlewares/validate'
import { loginSchema, registerSchema, refreshSchema } from '../schemas/auth.schema'

const router = Router()
router.post('/register', validate({ body: registerSchema }), register)
router.post('/login', validate({ body: loginSchema }), login)
router.post('/refresh', validate({ body: refreshSchema }), refresh)
router.post('/logout', validate({ body: refreshSchema }), logout)

export default router
