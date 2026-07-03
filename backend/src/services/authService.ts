import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prismaClient';
import { generateToken, TokenPayload } from '../utils/jwtUtils';
import { RegisterInput, LoginInput } from '../controllers/authController';

export class AuthService {
  /**
   * Registers a new user. Hashes password with bcryptjs and persists to database.
   */
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      const error: any = new Error('Email is already in use');
      error.statusCode = 400;
      throw error;
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
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = generateToken(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  /**
   * Fetch current user profile details.
   */
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
