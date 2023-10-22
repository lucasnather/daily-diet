import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/userRoutes'
import { mealsRoutes } from './routes/mealsRoutes'
import { ZodError } from 'zod'

export const app = fastify()

app.register(cookie)

app.register(userRoutes, {
	prefix: '/users'
})

app.register(mealsRoutes, {
	prefix: '/meals'
})

app.setErrorHandler((error, _, reply) => {
	if (error instanceof ZodError) {
		return reply.status(404).send({
			message: 'Invalid Password',
			issues: error.format()
		})
	}

	return reply.status(500).send({
		message: 'Error internal server'
	})
})