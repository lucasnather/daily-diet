import { Knex } from 'knex'

declare module 'knex/types/tables' {
	interface Tables {
		users: {
			id: string,
			name: string,
			email: string,
			password: string,
			sessionId: string
		},
		meals: {
			id: string,
			name: string,
			description: string,
			isOnDiet: string,
			user_id: string
		}
	}
}