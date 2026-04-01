import { desc, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../db'
import { posts, users } from '../db/schema'
import { AuthRequest, authenticate } from '../middleware/auth'

const router = Router()


// GET /posts — publik, alla kan se alla inlägg
router.get('/', async (req, res) => {

  try {

  // Alternativ 1: Mer SQL-lik förfrågan
  // const allPosts = await db
  //   .select({
  //     id: posts.id,
  //     title: posts.title,
  //     content: posts.content,
  //     author: {
  //       id: users.id,
  //       email: users.email,
  //     },
  //   })
  //   .from(posts)
  //   .leftJoin(users, eq(posts.userId, users.id))

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit


  // Alternativ 2: Tydligare med findMany från Drizzle relations
  const allPosts = await db.query.posts.findMany({
    // with som JOIN
    with: {
        author: true,
        // comments: true,
        // postCategories: {
        //   with: {
        //     category: true
        //   }
        // }
    },
    orderBy: [desc(posts.createdAt)], // Sortering. Fallande med nyaste inlägget först
    limit: limit,
    offset: offset
  })

  res.status(200).json(allPosts)

  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Internal server error"})
  }


  
})

// POST /posts — skyddad, måste vara inloggad
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { title, content } = req.body

  if (!title || !content) {
    res.status(400).json({ error: 'Titel och innehåll krävs' })
    return
  }

  const [post] = await db
    .insert(posts)
    .values({ title, content, userId: req.userId! })
    .returning()

  res.status(201).json(post)
})

// PUT /posts/:id — skyddad, bara ägaren kan redigera
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id)
  const { title, content } = req.body

  const [existing] = await db.select().from(posts).where(eq(posts.id, id))

  if (!existing) {
    res.status(404).json({ error: 'Inlägg hittades inte' })
    return
  }

  if (existing.userId !== req.userId) {
    res.status(403).json({ error: 'Du kan bara redigera dina egna inlägg' })
    return
  }

  const [updated] = await db
    .update(posts)
    .set({
      title: title ?? existing.title,
      content: content ?? existing.content,
    })
    .where(eq(posts.id, id))
    .returning()

  res.json(updated)
})

// DELETE /posts/:id — skyddad, bara ägaren kan ta bort
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id)

  const [existing] = await db.select().from(posts).where(eq(posts.id, id))

  if (!existing) {
    res.status(404).json({ error: 'Inlägg hittades inte' })
    return
  }

  if (existing.userId !== req.userId) {
    res.status(403).json({ error: 'Du kan bara ta bort dina egna inlägg' })
    return
  }

  await db.delete(posts).where(eq(posts.id, id))
  res.status(204).send()
})

export default router
