import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
	NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
	PORT: z.coerce.number().default(8000),
	DATABASE_URL: z.string()
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
	console.error('Enviroment variable error', _env.error.format())

	throw new Error('Enviroment variable error')
}

export const env = _env.data