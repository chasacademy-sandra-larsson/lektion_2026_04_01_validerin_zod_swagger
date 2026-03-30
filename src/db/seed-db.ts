import 'dotenv/config'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import { db } from '../db'
import { users, posts, comments, profile, categories, postCategories } from './schema'

async function main() {

  console.log('Seeding users...')

  // 1. Samma lösenord för alla användare - bara praktiskt för att testa
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 2. Skapa 10 användare med slumpmässiga email och samma lösenord
  const createdUsers = await db
    .insert(users)
    .values(
      Array.from({ length: 10 }, () => ({
        email: faker.internet.email(),
        password: hashedPassword,
      }))
    )
    .returning()

  console.log(`Created ${createdUsers.length} users`)

  // 3. Skapa 10 profiler för användare
  const createdProfiles = await db
    .insert(profile)
    .values(
      createdUsers.map((user) => ({
        avatar: faker.image.avatar(),
        description: faker.lorem.sentence(),
        location: faker.location.city(),
        userId: user.id,
      }))
    )
    .returning()

  console.log(`Created ${createdProfiles.length} profiles`)

  // 4. Skapa 30 poster per användare
  console.log('Seeding posts...')

  const createdPosts = await db
    .insert(posts)
    .values(
      Array.from({ length: 30 }, () => ({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        userId: faker.helpers.arrayElement(createdUsers).id,
      }))
    )
    .returning()

  console.log(`Created ${createdPosts.length} posts`)

  // 5. Skapa 6 kategorier
  console.log('Seeding categories...')

  const categoryNames = ['Tech', 'Livsstil', 'Resor', 'Mat', 'Sport', 'Musik']

  const createdCategories = await db
    .insert(categories)
    .values(categoryNames.map((name) => ({ name })))
    .returning()

  console.log(`Created ${createdCategories.length} categories`)

  // 6. Skapa 2 kategorier per post med slumpmässiga kategorier
  const postCategoryValues: { postId: number; categoryId: number }[] = []

  for (const post of createdPosts) {
    const randomCategories = faker.helpers.arrayElements(createdCategories, { min: 1, max: 2 })
    for (const cat of randomCategories) {
      postCategoryValues.push({ postId: post.id, categoryId: cat.id })
    }
  }

  await db.insert(postCategories).values(postCategoryValues)

  console.log(`Created ${postCategoryValues.length} post-category links`)

   // 7. Skapa 2-4 kommentarer per post med slumpmässiga användare
   console.log('Seeding comments...')

   const commentValues: { content: string; userId: number; postId: number }[] = []
 
   for (const post of createdPosts) {
     const numberOfComments = faker.number.int({ min: 2, max: 4 })
     for (let i = 0; i < numberOfComments; i++) {
       commentValues.push({
         content: faker.lorem.sentence(),
         userId: faker.helpers.arrayElement(createdUsers).id,
         postId: post.id,
       })
     }
   }
 
   const createdComments = await db
     .insert(comments)
     .values(commentValues)
     .returning()
 
   console.log(`Created ${createdComments.length} comments`)

  

  console.log('Seeding completed successfully!')

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
