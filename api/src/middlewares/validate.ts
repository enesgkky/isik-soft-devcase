import type { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'

type Parts = Partial<{ body: ZodSchema<any>; query: ZodSchema<any>; params: ZodSchema<any> }>

export const validate =
  (schemas: Parts) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result: { body?: any; query?: any; params?: any } = {}

    if (schemas.body) {
      const r = schemas.body.safeParse(req.body)
      if (!r.success) return res.status(400).json({ message: 'Validation failed', errors: r.error.issues })
      req.body = r.data
      result.body = r.data
    }

    if (schemas.query) {
      const r = schemas.query.safeParse(req.query)
      if (!r.success) return res.status(400).json({ message: 'Validation failed', errors: r.error.issues })
      result.query = r.data
    }

    if (schemas.params) {
      const r = schemas.params.safeParse(req.params)
      if (!r.success) return res.status(400).json({ message: 'Validation failed', errors: r.error.issues })
      result.params = r.data
    }

    req.validated = result
    next()
  }
