import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().min(8),
  parentId: z.string().uuid().optional().nullable(),
})

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(80).optional(),
  password: z.string().min(8).optional(),
  parentId: z.string().uuid().nullable().optional(),
})

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'email', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('asc'),
  q: z.string().optional(),
  parentId: z.string().uuid().optional(),
})
