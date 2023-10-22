import { app } from './app'
import { env } from './env/env'

app.listen({
	host: '0.0.0.0',
	port: env.PORT
}).then(() => {
	console.log(`rodando na porta http://localhost:${env.PORT}`)
})