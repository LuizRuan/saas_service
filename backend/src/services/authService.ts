import { User } from '../models/User';
import { ProviderProfile } from '../models/ProviderProfile';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorMiddleware';

interface RegisterClientInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  state?: string;
}

interface RegisterProviderInput extends RegisterClientInput {
  professionalName: string;
  bio?: string;
  document?: string;
  categories?: string[];
  cities?: string[];
  neighborhoods?: string[];
}

interface LoginInput {
  email: string;
  password: string;
}

function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError('E-mail inválido', 400, 'VALIDATION_ERROR');
  }
}

function validatePassword(password: string): void {
  if (!password || password.length < 8) {
    throw new AppError('Senha deve ter pelo menos 8 caracteres', 400, 'VALIDATION_ERROR');
  }
}

async function assertEmailAvailable(email: string): Promise<void> {
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw new AppError('E-mail já cadastrado', 409, 'EMAIL_ALREADY_EXISTS');
  }
}

export async function registerClient(input: RegisterClientInput) {
  if (!input.name?.trim()) throw new AppError('Nome é obrigatório', 400, 'VALIDATION_ERROR');
  if (!input.email?.trim()) throw new AppError('E-mail é obrigatório', 400, 'VALIDATION_ERROR');

  validateEmail(input.email);
  validatePassword(input.password);
  await assertEmailAvailable(input.email);

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash,
    phone: input.phone?.trim(),
    role: 'client',
    city: input.city?.trim(),
    state: input.state?.trim().toUpperCase(),
  });

  const token = generateToken({ userId: user.id as string, role: user.role });
  const userObj = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...userWithoutPassword } = userObj;

  return { token, user: userWithoutPassword };
}

export async function registerProvider(input: RegisterProviderInput) {
  if (!input.name?.trim()) throw new AppError('Nome é obrigatório', 400, 'VALIDATION_ERROR');
  if (!input.professionalName?.trim())
    throw new AppError('Nome profissional é obrigatório', 400, 'VALIDATION_ERROR');
  if (!input.email?.trim()) throw new AppError('E-mail é obrigatório', 400, 'VALIDATION_ERROR');

  validateEmail(input.email);
  validatePassword(input.password);
  await assertEmailAvailable(input.email);

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash,
    phone: input.phone?.trim(),
    role: 'provider',
    city: input.city?.trim(),
    state: input.state?.trim().toUpperCase(),
  });

  await ProviderProfile.create({
    userId: user._id,
    professionalName: input.professionalName.trim(),
    bio: input.bio?.trim(),
    document: input.document?.trim(),
    categories: input.categories ?? [],
    cities: input.cities ?? (input.city ? [input.city.trim()] : []),
    neighborhoods: input.neighborhoods ?? [],
    status: 'pending',
    plan: 'free',
    verified: false,
  });

  const token = generateToken({ userId: user.id as string, role: user.role });
  const userObj = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...userWithoutPassword } = userObj;

  return { token, user: userWithoutPassword };
}

export async function login(input: LoginInput) {
  if (!input.email || !input.password) {
    throw new AppError('E-mail e senha são obrigatórios', 400, 'VALIDATION_ERROR');
  }

  const user = await User.findOne({ email: input.email.toLowerCase() });

  if (!user) {
    throw new AppError('E-mail ou senha incorretos', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status === 'blocked') {
    throw new AppError('Sua conta foi bloqueada. Entre em contato com o suporte.', 403, 'ACCOUNT_BLOCKED');
  }

  const match = await comparePassword(input.password, user.passwordHash);
  if (!match) {
    throw new AppError('E-mail ou senha incorretos', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken({ userId: user.id as string, role: user.role });
  const userObj = user.toObject();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...userWithoutPassword } = userObj;

  return { token, user: userWithoutPassword };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND');
  return user;
}
