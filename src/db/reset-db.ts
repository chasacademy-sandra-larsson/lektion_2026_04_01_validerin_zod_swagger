// HÄR VAR FELET!
// Om .env inte är inläst när scriptet körs är process.env.DATABASE_URL undefined.
// Då försöker pg ansluta till en annan standarddatabas (ofta användarnamnet som db‑namn), där tabellen public.categories inte finns → exakt ditt fel.
import 'dotenv/config'
import { db } from '../db'
import * as schema from './schema'
import { reset } from 'drizzle-seed'

async function main() {
  await reset(db, schema)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
