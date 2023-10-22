import { knex } from '@/database/connect'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { hash } from 'bcryptjs'

export async function userRoutes(app: FastifyInstance) {
	app.post('/', async (request, reply) => {
		const getBodySchema = z.object({
			name: z.string(),
			email: z.string(),
			password: z.string().min(6)
		})

		const { name, email, password } = getBodySchema.parse(request.body)

		if (name.length === 0 || email.length === 0) {
			return reply.status(404).send({
				message: 'Empty label'
			})
		}

		const password_hash = await hash(password, 6)

		const isEmailAlreadyExists = await knex('users').select().where({
			email
		})

		if (isEmailAlreadyExists.length >= 1) {
			return reply.status(400).send({
				message: 'Não pode criar usuario com mesmo email'
			})
		}

		let { sessionId } = request.cookies

		if (!sessionId) {
			sessionId = randomUUID()

			reply.setCookie('sessionId', sessionId, {
				path: '/',
				maxAge: 1000 * 60 * 60 * 24 * 2
			})
		}

		await knex('users').insert({
			id: randomUUID(),
			name,
			email,
			password: password_hash,
			sessionId
		})

		return reply.status(200).send({
			message: 'Usuário criado'
		})
	})

	app.get('/all', async (request, reply) => {
		const users = await knex('users').select('*')

		return reply.status(200).send(users)
	})

	app.get('/', async (request, reply) => {
		const { sessionId } = request.cookies

		if (!sessionId) {
			return reply.status(201).send({
				message: 'Sessão inválida'
			})
		}

		const users = await knex('users').select().where({
			sessionId
		})

		return reply.status(201).send(users)
	})
}