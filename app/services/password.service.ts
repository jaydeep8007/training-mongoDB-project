
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

/* ✅ HASH PASSWORD USING ONLY BCRYPT */
export async function hashPassword(password: string): Promise<string> {
    const bcryptHash = await bcrypt.hash(password, saltRounds);
    return bcryptHash;
}

/* ✅ COMPARE PASSWORD USING ONLY BCRYPT */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
}

/* ✅ Generate a simple reset token (e.g. for forgot password) */
export function generateResetToken(): string {
  const random = Math.random().toString(36).substring(2);
  const timestamp = Date.now().toString(36);
  return `${random}${timestamp}`;
}