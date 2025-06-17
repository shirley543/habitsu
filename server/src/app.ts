import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());


/**
 * User routes
 */
app.get('/users', async (req, res) => {
  const { orderBy = 'id', order = 'asc', search } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { email: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { posts: true, profile: true },
      orderBy: { [orderBy as string]: order },
    });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: 'Invalid query' });
  }
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.json(user);
  } catch {
    res.status(400).json({ error: 'Email must be unique' });
  }
});


/**
 * Post routes
 */
app.get('/posts', async (req, res) => {
  const { orderBy = 'createdAt', order = 'desc', search } = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' } },
              { content: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { author: true },
      orderBy: { [orderBy as string]: order },
    });
    res.json(posts);
  } catch {
    res.status(400).json({ error: 'Invalid query' });
  }
});

app.post('/posts', async (req, res) => {
  const { title, content, published, authorId } = req.body;
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        author: { connect: { id: authorId } },
      },
    });
    res.json(post);
  } catch {
    res.status(400).json({ error: 'Invalid author ID' });
  }
});


/**
 * Profile routes
 */
app.get('/profiles', async (req, res) => {
  const { orderBy = 'id', order = 'asc', search } = req.query;

  try {
    const profiles = await prisma.profile.findMany({
      where: search
        ? {
            bio: { contains: String(search), mode: 'insensitive' },
          }
        : undefined,
      include: { user: true },
      orderBy: { [orderBy as string]: order },
    });
    res.json(profiles);
  } catch {
    res.status(400).json({ error: 'Invalid query' });
  }
});

app.post('/profiles', async (req, res) => {
  const { bio, userId } = req.body;
  try {
    const profile = await prisma.profile.create({
      data: {
        bio,
        user: { connect: { id: userId } },
      },
    });
    res.json(profile);
  } catch {
    res.status(400).json({ error: 'User already has a profile or invalid user ID' });
  }
});


/**
 * Server start
 */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
