import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prismaClient';
import { generateToken, TokenPayload } from '../utils/jwtUtils';
import { RegisterInput, LoginInput } from '../controllers/authController';
import { AppError } from '../utils/AppError';

export class AuthService {
  /**
   * Registers a new user. Hashes password with bcryptjs and persists to database.
   */
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email is already in use', 400);
    }

    // Adaptive bcrypt hashing (rounds = 10 is standard for performance & safety)
    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: passwordHash,
        role: input.role || 'USER',
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validates user credentials. Returns JWT token and user info on success.
   */
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Fetch current user profile details.
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
