import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/taskService';
import { logger } from '../utils/logger';

// Validation Schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  userId: z.string().uuid('Invalid userId UUID').optional(), // Admin-only option
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(100, 'Title is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const TaskIdParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID UUID'),
});

export class TaskController {
  /**
   * Create a new task.
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
        return;
      }
      logger.info(`Creating task for user: ${req.user.email}`);
      const task = await TaskService.createTask(req.body, req.user);
      res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tasks (RBAC applied in service).
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
        return;
      }
      logger.info(`Fetching tasks for user: ${req.user.email} (Role: ${req.user.role})`);
      const tasks = await TaskService.getTasks(req.user);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single task by ID.
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      logger.info(`Fetching task: ${id} for user: ${req.user.email}`);
      const task = await TaskService.getTaskById(id, req.user);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a task.
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      logger.info(`Updating task: ${id} by user: ${req.user.email}`);
      const task = await TaskService.updateTask(id, req.body, req.user);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Task updated successfully',
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a task.
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
        return;
      }
      const { id } = req.params;
      logger.info(`Deleting task: ${id} by user: ${req.user.email}`);
      const response = await TaskService.deleteTask(id, req.user);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: response.message,
        data: { id: response.id },
      });
    } catch (error) {
      next(error);
    }
  }
}
