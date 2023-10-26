import { pgTable, foreignKey, pgEnum, bigint, timestamp, uuid, text, boolean, unique, date } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"
export const requestStatus = pgEnum("request_status", ['PENDING', 'SUCCESS', 'ERROR'])
export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])


export const photos = pgTable("photos", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull().references(() => accounts.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	fileName: text("file_name").notNull(),
	uploaded: boolean("uploaded").default(false).notNull(),
	resized: boolean("resized").default(false).notNull(),
	uploadedBy: text("uploaded_by").default('""').notNull(),
});

export const accounts = pgTable("accounts", {
	id: uuid("id").primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	accountName: text("account_name"),
	stripeCustomer: text("stripe_customer"),
	email: text("email"),
	bucket: text("bucket"),
	weddingDate: date("wedding_date"),
	secretKey: uuid("secret_key").defaultRandom().notNull(),
	bethrothed1: text("bethrothed_1"),
	bethrothed2: text("bethrothed_2"),
	hasPaid: boolean("has_paid").default(false).notNull(),
},
(table) => {
	return {
		accountsBucketKey: unique("accounts_bucket_key").on(table.bucket),
	}
});