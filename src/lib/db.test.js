import prisma from './db'

async function testConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Tables count check karein
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `
    console.log(`📊 Total tables: ${tables.length}`)
    console.log('Tables:', tables.map(t => t.tablename).join(', '))
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()