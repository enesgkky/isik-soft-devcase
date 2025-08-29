export {}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string }
      validated?: { body?: any; query?: any; params?: any }
    }
  }
}
