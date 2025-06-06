import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.staffUser.deleteMany()
  await prisma.staffRole.deleteMany()
  await prisma.customerUser.deleteMany()
  await prisma.customerRole.deleteMany()
  await prisma.customer.deleteMany()
  console.log('🗑️  Cleared existing data')

  // Create staff roles first
  const adminRole = await prisma.staffRole.create({
    data: {
      name: 'Administrator',
      description: 'Full system access and user management'
    }
  })
  console.log(`✅ Created staff role: ${adminRole.name}`)

  const supportRole = await prisma.staffRole.create({
    data: {
      name: 'Support Agent',
      description: 'Customer support and basic system access'
    }
  })
  console.log(`✅ Created staff role: ${supportRole.name}`)

  // Create customer roles
  const customerAdminRole = await prisma.customerRole.create({
    data: {
      name: 'Customer Admin',
      description: 'Full access to customer account and can manage other users'
    }
  })
  console.log(`✅ Created customer role: ${customerAdminRole.name}`)

  const customerEditorRole = await prisma.customerRole.create({
    data: {
      name: 'Customer Editor',
      description: 'Can manage campaigns and view reports'
    }
  })
  console.log(`✅ Created customer role: ${customerEditorRole.name}`)

  const customerViewerRole = await prisma.customerRole.create({
    data: {
      name: 'Customer Viewer',
      description: 'Read-only access to campaigns and reports'
    }
  })
  console.log(`✅ Created customer role: ${customerViewerRole.name}`)

  // Create customers (organizations)
  const acmeCustomer = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      companyName: 'Acme Corp',
      email: 'admin@acmecorp.com', // This is just for administrative purposes
      passwordHash: 'unused', // Customers don't authenticate directly
      plan: 'enterprise'
    }
  })
  console.log(`✅ Created customer: ${acmeCustomer.companyName}`)

  const techStartupCustomer = await prisma.customer.create({
    data: {
      name: 'Tech Startup Inc',
      companyName: 'TechStartup',
      email: 'admin@techstartup.com',
      passwordHash: 'unused',
      plan: 'professional'
    }
  })
  console.log(`✅ Created customer: ${techStartupCustomer.companyName}`)

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

  // Define customer users data
  const customerUsers = [
    {
      email: 'john@acmecorp.com',
      name: 'John Smith',
      customerId: acmeCustomer.id,
      roleId: customerAdminRole.id,
      password: 'password'
    },
    {
      email: 'jane@acmecorp.com',
      name: 'Jane Doe',
      customerId: acmeCustomer.id,
      roleId: customerEditorRole.id,
      password: 'password'
    },
    {
      email: 'bob@acmecorp.com',
      name: 'Bob Wilson',
      customerId: acmeCustomer.id,
      roleId: customerViewerRole.id,
      password: 'password'
    },
    {
      email: 'alice@techstartup.com',
      name: 'Alice Johnson',
      customerId: techStartupCustomer.id,
      roleId: customerAdminRole.id,
      password: 'password'
    },
    {
      email: 'mike@techstartup.com',
      name: 'Mike Davis',
      customerId: techStartupCustomer.id,
      roleId: customerEditorRole.id,
      password: 'password'
    }
  ]

  // Create customer users with hashed passwords
  for (const userData of customerUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const customerUser = await prisma.customerUser.create({
      data: {
        email: userData.email,
        name: userData.name,
        customerId: userData.customerId,
        roleId: userData.roleId,
        passwordHash: hashedPassword,
      },
      include: {
        role: true,
        customer: true
      }
    })
    
    console.log(`✅ Created customer user: ${customerUser.name} (${customerUser.role.name} at ${customerUser.customer.companyName})`)
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