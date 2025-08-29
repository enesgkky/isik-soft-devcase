import { Router } from 'express'
import * as ctrl from '../controllers/user.controller'
import { validate } from '../middlewares/validate'
import { createUserSchema, updateUserSchema, listUsersQuerySchema } from '../schemas/user.schema'
import { requireAuth } from '../middlewares/auth.middleware'

const router = Router()
router.use(requireAuth)

router.get('/', validate({ query: listUsersQuerySchema }), ctrl.listUsers)
router.get('/:id', ctrl.getUser)
router.post('/', validate({ body: createUserSchema }), ctrl.createUser)
router.put('/:id', validate({ body: updateUserSchema }), ctrl.updateUser)
router.patch('/:id', validate({ body: updateUserSchema }), ctrl.updateUser)
router.delete('/:id', ctrl.deleteUser)

export default router
