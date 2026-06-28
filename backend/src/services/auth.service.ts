import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { ProviderProfile } from '../models/ProviderProfile';
import { emailService } from './email.service';
import { JwtPayload, UserRole } from '../types';
import {
  AppError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../utils/errors';

interface RegisterClientInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
}

interface RegisterProviderInput extends RegisterClientInput {
  professionalName?: string;
  document?: string;
  bio?: string;
  categories?: string[];
  cities?: string[];
  neighborhoods?: string[];
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private generateToken(userId: string, role: UserRole): string {
    const payload: JwtPayload = { userId, role };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(userId: string, role: UserRole): string {
    const payload: JwtPayload = { userId, role };
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    } as jwt.SignOptions);
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new AppError('A senha deve ter pelo menos 8 caracteres', 400);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async issueTokens(userId: string, role: UserRole): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId, role);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(userId, { $set: { refreshTokenHash } });
    return { accessToken, refreshToken };
  }

  async registerClient(input: RegisterClientInput): Promise<AuthResult> {
    const { name, email, password, phone, city, state } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Este e-mail já está cadastrado');
    }

    this.validatePassword(password);

    const passwordHash = await this.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: 'client' as UserRole,
      city: city || '',
      state: state || '',
      status: 'active',
    });

    const { accessToken, refreshToken } = await this.issueTokens(user._id.toString(), user.role);

    emailService.sendWelcome(user.email, user.name, 'client').catch(() => {});

    return { user, accessToken, refreshToken };
  }

  async registerProvider(input: RegisterProviderInput): Promise<AuthResult> {
    const {
      name,
      email,
      password,
      phone,
      city,
      state,
      professionalName,
      document,
      bio,
      categories,
      cities,
      neighborhoods,
    } = input;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Este e-mail já está cadastrado');
    }

    this.validatePassword(password);

    const passwordHash = await this.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: 'provider' as UserRole,
      city: city || '',
      state: state || '',
      status: 'active',
    });

    await ProviderProfile.create({
      userId: user._id,
      professionalName: professionalName || name,
      document: document || '',
      bio: bio || '',
      categories: categories || [],
      cities: cities || (city ? [city] : []),
      neighborhoods: neighborhoods || [],
      status: 'pending',
      plan: 'free',
    });

    const { accessToken, refreshToken } = await this.issueTokens(user._id.toString(), user.role);

    emailService.sendWelcome(user.email, user.name, 'provider').catch(() => {});

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    if (user.status === 'deleted') {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    if (user.status === 'blocked') {
      if (user.blockedUntil && user.blockedUntil <= new Date()) {
        await User.findByIdAndUpdate(user._id, {
          $set: { status: 'active' },
          $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
        });
        user.status = 'active';
      } else {
        const until = user.blockedUntil
          ? user.blockedUntil.toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : null;
        throw new UnauthorizedError(
          until
            ? `Sua conta está bloqueada até ${until}. Entre em contato com o suporte.`
            : 'Sua conta está bloqueada. Entre em contato com o suporte.'
        );
      }
    }

    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    const { accessToken, refreshToken } = await this.issueTokens(user._id.toString(), user.role);

    return { user, accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Token de renovação inválido ou expirado');
    }

    const user = await User.findById(payload.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError('Sessão inválida. Faça login novamente.');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedError('Token de renovação inválido.');
    }

    const accessToken = this.generateToken(user._id.toString(), user.role);
    return { accessToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    // Silencioso mesmo se não existe (não vaza se email está cadastrado)
    if (!user || user.status === 'deleted') return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await User.findByIdAndUpdate(user._id, {
      $set: { passwordResetToken: tokenHash, passwordResetExpires: expires },
    });

    const resetUrl = `${env.APP_URL}/redefinir-senha?token=${rawToken}`;
    emailService.sendPasswordReset(user.email, user.name, resetUrl).catch(() => {});
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    if (newPassword.length < 8) {
      throw new AppError('A senha deve ter pelo menos 8 caracteres', 400);
    }

    const users = await User.find({
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    let matchedUser: IUser | null = null;
    for (const u of users) {
      if (u.passwordResetToken && await bcrypt.compare(rawToken, u.passwordResetToken)) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    const passwordHash = await this.hashPassword(newPassword);
    await User.findByIdAndUpdate(matchedUser._id, {
      $set: { passwordHash },
      $unset: { passwordResetToken: 1, passwordResetExpires: 1, refreshTokenHash: 1 },
    });
  }

  async updateMe(userId: string, input: { name?: string; phone?: string; city?: string; state?: string }): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!user) throw new NotFoundError('Usuário');
    return user;
  }

  async getMe(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário');
    }

    if (user.status === 'deleted') {
      throw new NotFoundError('Usuário');
    }

    if (user.status === 'blocked' && user.blockedUntil && user.blockedUntil <= new Date()) {
      await User.findByIdAndUpdate(userId, {
        $set: { status: 'active' },
        $unset: { blockedUntil: 1, blockedReason: 1, blockedBy: 1 },
      });
      user.status = 'active';
    }

    let profile = null;
    if (user.role === 'provider') {
      profile = await ProviderProfile.findOne({ userId: user._id }).populate(
        'categories',
        'name slug'
      );
    }

    return { user, profile };
  }
}

export const authService = new AuthService();
