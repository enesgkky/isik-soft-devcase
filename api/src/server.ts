import { createApp } from './app'
import { env } from './config/env'
import { sequelize } from './db/sequelize'

async function bootstrap() {
  await sequelize.authenticate()
  await sequelize.sync()
  const app = createApp()
  app.listen(env.PORT, () => console.log(`[server] Application is running: http://localhost:${env.PORT}`))
}

bootstrap().catch((e) => {
  console.error('Failed to start', e)
  process.exit(1)
})
