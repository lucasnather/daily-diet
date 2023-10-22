import { Knex } from 'knex'


export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('meals', table => {
		table.uuid('id')
		table.string('name')
		table.string('description')
		table.dateTime('created_at').defaultTo(knex.fn.now())
		table.string('isOnDiet')
		table.uuid('user_id')
	})
}


export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('meals')
}

