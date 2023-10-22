import { knex } from '@/database/connect'
import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {

	app.post('/', async (request, reply) => {
		const getBodySchema = z.object({
			name: z.string(),
			description: z.string(),
			isOnDiet: z.enum(['sim', 'não']),
		})

		const { name, description, isOnDiet } = getBodySchema.parse(request.body)

		if (name.length === 0 || name.length === 0 || isOnDiet.length === 0) {
			return reply.status(404).send({
				message: 'Empty label'
			})
		}

		const { sessionId } = request.cookies

		if (!sessionId) {
			return reply.status(400).send({
				message: 'Invalid user'
			})
		}

		await knex('meals').insert({
			id: randomUUID(),
			name,
			description,
			isOnDiet,
			user_id: sessionId
		})

		return reply.status(201).send({
			message: 'Meals Created'
		})
	})

	app.get('/', async (request, reply) => {
		const { sessionId } = request.cookies
		const meals = await knex('meals').select().where({
			user_id: sessionId
		})

		if (meals.length === 0) {
			return reply.status(404).send({
				message: 'User not create this meal'
			})
		}

		return reply.status(200).send(meals)
	})

	app.get('/:id', async (request, reply) => {
		const { sessionId } = request.cookies
		const getIdSchema = z.object({
			id: z.string().uuid()
		})

		const { id } = getIdSchema.parse(request.params)

		const meals = await knex('meals').select().where({
			id,
			user_id: sessionId
		})

		return reply.status(200).send(meals)
	})

	app.delete('/:id', async (request, reply) => {
		const { sessionId } = request.cookies
		const getIdSchema = z.object({
			id: z.string().uuid()
		})

		const { id } = getIdSchema.parse(request.params)

		await knex('meals').delete().where({
			id,
			user_id: sessionId
		})

		return reply.status(204).send()
	})

	app.put('/:id', async (request, reply) => {
		const { sessionId } = request.cookies

		const getIdSchema = z.object({
			id: z.string().uuid()
		})

		const getBodySchema = z.object({
			name: z.string(),
			description: z.string(),
			isOnDiet: z.enum(['sim', 'não']),
		})

		const { id } = getIdSchema.parse(request.params)
		const { name, description, isOnDiet } = getBodySchema.parse(request.body)

		if (name.length === 0 || name.length === 0 || isOnDiet.length === 0) {
			return reply.status(404).send({
				message: 'Empty label'
			})
		}

		await knex('meals').update({
			name,
			description,
			isOnDiet,
			user_id: sessionId
		}).where({
			id,
			user_id: sessionId
		})

		return reply.status(204).send()
	})

	app.get('/metrics', async (request, reply) => {
		const { sessionId } = request.cookies
		let sequence = 0
		const bestSequences = []

		const amountMeals = await knex('meals').where({
			user_id: sessionId
		}).count('* as amount')

		const meals = await knex('meals').select().where({
			user_id: sessionId
		})

		const amountMealsOnDiet = await knex('meals').where({
			user_id: sessionId,
			isOnDiet: 'sim'
		}).count('* as amount')

		const amountMealsOffDiet = await knex('meals').where({
			user_id: sessionId,
			isOnDiet: 'não'
		}).count('* as amount')

		for (let i = 0; i < meals.length; i++) {
			if (meals[i].isOnDiet === 'sim') {
				sequence++
			} else {
				bestSequences.push(sequence)
				sequence = 0
			}
		}

		bestSequences.push(sequence)

		const maxSquenceOnDietSort = bestSequences.sort((a, b) => a - b)
		const lastNumber = maxSquenceOnDietSort.length - 1
		const maxSequenceOnDiet = maxSquenceOnDietSort[lastNumber]
		console.log(maxSequenceOnDiet)

		return reply.status(201).send({
			amountMeals,
			amountMealsOnDiet,
			amountMealsOffDiet,
			bestSequenceOnDiet: [
				{
					amount: maxSequenceOnDiet
				}
			]
		})
	})
}