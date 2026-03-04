import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma.js'

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // session ends in 7 days
    updateAge: 60 * 60 * 24,      // session restart every 1 day after user actively login
  },
  trustedOrigins: ['http://localhost:5173'],
})

export default auth