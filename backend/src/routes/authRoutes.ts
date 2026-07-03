import { Router } from 'express';
import { AuthController, RegisterSchema, LoginSchema } from '../controllers/authController';
import { validateBody } from '../middlewares/validation';
import { authenticate } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               password:
 *                 type: string
 *                 minimum: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: USER
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or Email already in use
 */
router.post('/register', validateBody(RegisterSchema), AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user & retrieve token / set cookie
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateBody(LoginSchema), AuthController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Clear cookie session and logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', AuthController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate access token using HttpOnly refresh cookie
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token successfully rotated
 *       401:
 *         description: Session expired or invalid refresh token
 */
router.post('/refresh', AuthController.refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Fetch current authenticated user info
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, AuthController.me);

export default router;
