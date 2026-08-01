'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { computeActiveStatus, getQuizWeight, type StatusColor } from '@/lib/spaced-repetition';

export async function addQuestion(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const url = (formData.get('url') as string) || '';
  const summary = (formData.get('summary') as string) || '';
  const solution = (formData.get('solution') as string) || '';
  const code = (formData.get('code') as string) || '';
  const topicsRaw = (formData.get('topics') as string) || '';
  const topics = topicsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title || title.trim().length === 0) {
    throw new Error('Title is required');
  }

  await prisma.question.create({
    data: {
      userId,
      title: title.trim(),
      url: url.trim(),
      summary: summary.trim(),
      solution: solution.trim(),
      code: code.trim(),
      topics,
      status: 'Red',
      lastRevisedTimestamp: new Date(),
    },
  });

  revalidatePath('/');
}

export async function updateQuestionStatus(
  questionId: string,
  newStatus: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Verify ownership
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question || question.userId !== userId) {
    throw new Error('Question not found or unauthorized');
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      status: newStatus,
      lastRevisedTimestamp: new Date(),
    },
  });

  // Log this revision for the heatmap
  await prisma.revisionLog.create({
    data: {
      userId,
      questionId,
    },
  });

  revalidatePath('/');
  revalidatePath('/quiz');
  return updated;
}

export async function deleteQuestion(questionId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question || question.userId !== userId) {
    throw new Error('Question not found or unauthorized');
  }

  await prisma.question.delete({
    where: { id: questionId },
  });

  revalidatePath('/');
}

export async function updateQuestionDetails(
  questionId: string,
  data: {
    title?: string;
    url?: string;
    summary?: string;
    code?: string;
    topics?: string[];
    solution?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question || question.userId !== userId) {
    throw new Error('Question not found or unauthorized');
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data,
  });

  revalidatePath('/');
  revalidatePath('/quiz');
  return updated;
}

export type QuestionWithActiveStatus = {
  id: string;
  userId: string;
  title: string;
  url: string;
  summary: string;
  solution: string;
  code: string;
  topics: string[];
  status: string;
  activeStatus: StatusColor;
  lastRevisedTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
};

export async function getQuestions(): Promise<QuestionWithActiveStatus[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const questions = await prisma.question.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return questions.map((q) => ({
    ...q,
    activeStatus: computeActiveStatus(q.status, q.lastRevisedTimestamp),
  }));
}

export async function getQuizQuestion(): Promise<QuestionWithActiveStatus | null> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const questions = await prisma.question.findMany({
    where: { userId },
  });

  if (questions.length === 0) return null;

  // Compute active statuses and weights
  const withStatus = questions.map((q) => {
    const activeStatus = computeActiveStatus(q.status, q.lastRevisedTimestamp);
    return {
      ...q,
      activeStatus,
      weight: getQuizWeight(activeStatus),
    };
  });

  // Weighted random selection
  const totalWeight = withStatus.reduce((sum, q) => sum + q.weight, 0);
  let random = Math.random() * totalWeight;

  for (const q of withStatus) {
    random -= q.weight;
    if (random <= 0) {
      const { weight, ...rest } = q;
      return rest;
    }
  }

  // Fallback to last item
  const last = withStatus[withStatus.length - 1];
  const { weight, ...rest } = last;
  return rest;
}

export async function getRevisionLogs() {
  const { userId } = await auth();
  if (!userId) return [];

  // Get logs for the past 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const logs = await prisma.revisionLog.findMany({
    where: {
      userId,
      timestamp: { gte: oneYearAgo },
    },
    select: { timestamp: true },
    orderBy: { timestamp: 'asc' },
  });

  return logs.map(l => l.timestamp);
}

// Authentication Server Actions
export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) throw new Error('Email and password required');

  const { comparePasswords, setSession } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await comparePasswords(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  await setSession(user.id);
}

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || password.length < 6) {
    throw new Error('Valid email and minimum 6 character password required');
  }

  const { hashPassword, setSession } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/db');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already exists');

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  });

  await setSession(user.id);
}

export async function logoutUser() {
  const { clearSession } = await import('@/lib/auth');
  await clearSession();
}

export async function migrateLegacyData(oldUserId: string) {
  const { auth } = await import('@/lib/auth');
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  if (!oldUserId || oldUserId.trim() === '') {
    throw new Error('Legacy User ID is required');
  }

  const { prisma } = await import('@/lib/db');
  
  // Update all questions and revision logs
  const updatedQuestions = await prisma.question.updateMany({
    where: { userId: oldUserId },
    data: { userId: userId },
  });

  const updatedLogs = await prisma.revisionLog.updateMany({
    where: { userId: oldUserId },
    data: { userId: userId },
  });

  return { questions: updatedQuestions.count, logs: updatedLogs.count };
}
