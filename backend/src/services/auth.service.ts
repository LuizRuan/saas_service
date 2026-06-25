import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { ProviderProfile } from '../models/ProviderProfile';
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
  categories?: string[];
  cities?: string[];
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: IUser;
  token: string;
}

class AuthService {
  /**
   * Gera token JWT
   */
  private generateToken(userId: string, role: UserRole): string {
    const payload: JwtPayload = { userId, role };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Hash da senha
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verifica senha
   */
  private async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Registro de cliente
   */
  async registerClient(input: RegisterClientInput): Promise<AuthResult> {
    const { name, email, password, phone, city, state } = input;

    // Verifica se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Este e-mail já está cadastrado');
    }

    // Validação básica de senha
    if (password.length < 6) {
      throw new AppError('A senha deve ter pelo menos 6 caracteres');
    }

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

    const token = this.generateToken(
      user._id.toString(),
      user.role
    );

    return { user, token };
  }

  /**
   * Registro de prestador
   * Cria User + ProviderProfile automaticamente
   */
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
      categories,
      cities,
    } = input;

    // Verifica se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Este e-mail já está cadastrado');
    }

    // Validação básica de senha
    if (password.length < 6) {
      throw new AppError('A senha deve ter pelo menos 6 caracteres');
    }

    const passwordHash = await this.hashPassword(password);

    // Cria o usuário como provider
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

    // Cria o perfil do prestador automaticamente (status: pending)
    await ProviderProfile.create({
      userId: user._id,
      professionalName: professionalName || name,
      document: document || '',
      categories: categories || [],
      cities: cities || (city ? [city] : []),
      status: 'pending',
      plan: 'free',
    });

    const token = this.generateToken(
      user._id.toString(),
      user.role
    );

    return { user, token };
  }

  /**
   * Login
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    // Busca usuário com a senha (select: false no schema)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    // Verifica se está bloqueado
    if (user.status === 'blocked') {
      throw new UnauthorizedError('Sua conta está bloqueada. Entre em contato com o suporte.');
    }

    // Verifica senha
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('E-mail ou senha incorretos');
    }

    const token = this.generateToken(
      user._id.toString(),
      user.role
    );

    return { user, token };
  }

  /**
   * Atualiza perfil básico do usuário autenticado
   */
  async updateMe(userId: string, input: { name?: string; phone?: string; city?: string; state?: string }): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!user) throw new NotFoundError('Usuário');
    return user;
  }

  /**
   * Busca dados do usuário autenticado
   */
  async getMe(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário');
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
