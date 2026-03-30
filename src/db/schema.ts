import { integer, pgTable, primaryKey, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from "drizzle-orm"
// Schema är source of truth — drizzle-kit push synckar databasen härifrån

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
})


export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
})



export const comments = pgTable('comments', { 
     id: serial('id').primaryKey(),
     content: text('content').notNull(),
     createdAt: timestamp('created_at'),
     userId: integer('user_id')
        .notNull()
        .references(() => users.id),
     postId: integer('post_id')
        .notNull()
        .references(() => posts.id)
})



export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  avatar: varchar('avatar'),
  description: text('description'),
  location: varchar('location'),
  userId: integer('user_id')
              .notNull()
              .unique()
              .references(()=> users.id)
})



export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
})


// Kopplingstabellen (junction table)
export const postCategories = pgTable('post_categories', {
    postId: integer('post_id')
        .notNull()
        .references(() => posts.id),
    categoryId: integer('category_id')
        .notNull()
        .references(() => categories.id)
  },
    // Primary key som är en kombo av de två foreign keys, för att undvika konflikt
  (table) => ({
    // En post kan inte kopplas till samma kategori två gång
    pk: primaryKey({ columns: [table.postId, table.categoryId] }),
  }));
   

// Relations så att vi kan använda dem i våra queries (findMany, findFirst, etc)
export const userRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
  comments: many(comments),
  profile: one(profile),
}))

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  postCategories: many(postCategories), // many-to-many: via kopplingstabell
}))

export const categoryRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories), // many-to-many: samma kopplingstabell
}))

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, { fields: [postCategories.categoryId], references: [categories.id] }),
}))


export const commentRelations = relations(comments, ({ one }) => ({
  author: one(users, { fields: [comments.userId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
}))

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(users, { fields: [profile.userId], references: [users.id] }),
}))


export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Profile = typeof profile.$inferSelect
export type NewProfile = typeof profile.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type PostCategory = typeof postCategories.$inferInsert
export type NewPostCategory = typeof postCategories.$inferSelect




