import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/client.js';

export const progressRouter = Router();

/** GET /progress/:userId — retrieve all completed exercises for a user */
progressRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({ data: { id: userId } });
    }

    const progress = await prisma.progress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ userId, progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /progress/:userId — mark an exercise as completed */
progressRouter.post('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { chapterId, exerciseId, completed = true } = req.body as {
    chapterId: number;
    exerciseId: string;
    completed?: boolean;
  };

  if (!chapterId || !exerciseId) {
    res.status(400).json({ error: 'chapterId and exerciseId are required' });
    return;
  }

  try {
    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const progress = await prisma.progress.upsert({
      where: { userId_exerciseId: { userId, exerciseId } },
      update: { completed, chapterId },
      create: { userId, chapterId, exerciseId, completed },
    });

    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
