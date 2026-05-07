import { SignJWT, jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signUserToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyUserToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as { userId: string }
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(getSecret())
}

export async function verifyAdminToken(token: string): Promise<{ role: string }> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as { role: string }
}

export const USER_COOKIE = 'hccu_session'
export const ADMIN_COOKIE = 'hccu_admin'

export const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge,
  path: '/',
})
