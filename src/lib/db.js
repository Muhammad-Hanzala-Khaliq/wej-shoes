import { PrismaClient } from '@prisma/client'

// Prisma Client ka single instance banate hain
// Taake connection pool ka masla na ho

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma