import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().min(8),
  parentId: z.string().uuid().optional().nullable(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})
