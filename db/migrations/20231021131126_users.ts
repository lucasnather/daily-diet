import { randomUUID } from 'crypto'
import { Knex } from 'knex'


export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('users', (table) => {
		table.uuid('id').defaultTo(randomUUID())
		table.string('name')
		table.string('email').unique()
		table.string('password')
		table.dateTime('created_at').defaultTo(knex.fn.now())
		table.uuid('sessionId')
	})
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('users')
}

