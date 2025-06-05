import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.staffUser.deleteMany()
  await prisma.staffRole.deleteMany()
  console.log('🗑️  Cleared existing staff users and roles')

  // Create staff roles first
  const adminRole = await prisma.staffRole.create({
    data: {
      name: 'Administrator',
      description: 'Full system access and user management'
    }
  })
  console.log(`✅ Created role: ${adminRole.name}`)

  const supportRole = await prisma.staffRole.create({
    data: {
      name: 'Support Agent',
      description: 'Customer support and basic system access'
    }
  })
  console.log(`✅ Created role: ${supportRole.name}`)

  // Define staff users data
  const staffUsers = [
    {
      email: 'admin001@admin.com',
      name: 'Alex Scalia',
      roleId: adminRole.id,
      password: 'password'
    },
    {
      email: 'admin002@admin.com',
      name: 'Sarah Johnson',
      roleId: supportRole.id,
      password: 'password'
    },
    {
      email: 'admin003@admin.com', 
      name: 'Michael Chen',
      roleId: supportRole.id,
      password: 'password'
    },
    {
      email: 'admin004@admin.com',
      name: 'Emma Rodriguez',
      roleId: adminRole.id,
      password: 'password'
    },
    {
      email: 'admin005@admin.com',
      name: 'David Thompson',
      roleId: supportRole.id, 
      password: 'password'
    }
  ]

  // Create staff users with hashed passwords
  for (const userData of staffUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const staffUser = await prisma.staffUser.create({
      data: {
        email: userData.email,
        name: userData.name,
        roleId: userData.roleId,
        passwordHash: hashedPassword,
      },
      include: {
        role: true
      }
    })
    
    console.log(`✅ Created staff user: ${staffUser.name} (${staffUser.role.name})`)
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 