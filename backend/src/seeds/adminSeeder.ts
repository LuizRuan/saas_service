import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import { env } from '../config/env';

export async function seedAdmin(): Promise<void> {
  const exists = await User.findOne({ role: 'admin' });
  if (exists) {
    console.log('ℹ️  Admin já existe. Pulando seed.');
    return;
  }

  const passwordHash = await hashPassword(env.adminPassword);

  await User.create({
    name: env.adminName,
    email: env.adminEmail.toLowerCase(),
    passwordHash,
    role: 'admin',
    status: 'active',
  });

  console.log(`✅ Admin criado: ${env.adminEmail}`);
}
