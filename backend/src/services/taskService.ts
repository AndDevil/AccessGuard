import { prisma } from '../utils/prismaClient';
import { TokenPayload } from '../utils/jwtUtils';
import { TaskStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  userId?: string; // Optional: Admins can assign tasks to other users
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export class TaskService {
  /**
   * Create a new task. Users create tasks for themselves. Admins can create tasks for any user.
   */
  static async createTask(input: CreateTaskInput, currentUser: TokenPayload) {
    // If regular user, force tasks to belong to themselves
    const assignedUserId = currentUser.role === 'ADMIN' && input.userId 
      ? input.userId 
      : currentUser.userId;

    // Verify assigned user exists
    const userExists = await prisma.user.findUnique({
      where: { id: assignedUserId }
    });
    if (!userExists) {
      throw new AppError('Assigned user not found', 404);
    }

    return await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status || 'PENDING',
        userId: assignedUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Retrieves tasks. ADMIN roles receive all tasks. USER roles receive only their own.
   */
  static async getTasks(currentUser: TokenPayload) {
    if (currentUser.role === 'ADMIN') {
      return await prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      });
    }

    return await prisma.task.findMany({
      where: { userId: currentUser.userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Fetch a single task by ID. Enforces ownership check for standard users.
   */
  static async getTaskById(id: string, currentUser: TokenPayload) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Role-based visibility enforcement
    if (currentUser.role !== 'ADMIN' && task.userId !== currentUser.userId) {
      throw new AppError('Access denied. You do not own this task.', 403);
    }

    return task;
  }

  /**
   * Updates an existing task. Enforces role-based ownership.
   */
  static async updateTask(id: string, input: UpdateTaskInput, currentUser: TokenPayload) {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // RBAC validation
    if (currentUser.role !== 'ADMIN' && task.userId !== currentUser.userId) {
      throw new AppError('Access denied. You cannot edit this task.', 403);
    }

    return await prisma.task.update({
      where: { id },
      data: input,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Deletes a task. Enforces role-based ownership.
   */
  static async deleteTask(id: string, currentUser: TokenPayload) {
    const task = await prisma.task.findUnique({
      where: { id }
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // RBAC validation
    if (currentUser.role !== 'ADMIN' && task.userId !== currentUser.userId) {
      throw new AppError('Access denied. You cannot delete this task.', 403);
    }

    await prisma.task.delete({
      where: { id }
    });

    return { message: 'Task successfully deleted', id };
  }
}
