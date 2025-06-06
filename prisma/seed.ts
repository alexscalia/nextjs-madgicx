import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.subCustomer.deleteMany()
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
      name: 'Owner',
      description: 'Full access to organization account and can manage other users'
    }
  })
  console.log(`✅ Created customer role: ${customerAdminRole.name}`)

  const customerEditorRole = await prisma.customerRole.create({
    data: {
      name: 'Editor',
      description: 'Can manage campaigns and view reports'
    }
  })
  console.log(`✅ Created customer role: ${customerEditorRole.name}`)

  const customerViewerRole = await prisma.customerRole.create({
    data: {
      name: 'Viewer',
      description: 'Read-only access to campaigns and reports'
    }
  })
  console.log(`✅ Created customer role: ${customerViewerRole.name}`)

  // Create customers (organizations)
  const acmeCustomer = await prisma.customer.create({
    data: {
      name: 'Acme', // Clean display name
      companyName: 'Acme Corporation',
      plan: 'enterprise'
    }
  })
  console.log(`✅ Created customer: ${acmeCustomer.companyName}`)

  const techStartupCustomer = await prisma.customer.create({
    data: {
      name: 'TechStartup', // Clean display name
      companyName: 'Tech Startup Inc',
      plan: 'pro'
    }
  })
  console.log(`✅ Created customer: ${techStartupCustomer.companyName}`)

  // Create additional customers to test pagination
  const additionalCustomers = [
    { name: 'Global Solutions', companyName: 'Global Solutions Ltd', plan: 'basic' },
    { name: 'Creative Agency', companyName: 'Creative Agency Inc', plan: 'pro' },
    { name: 'Data Analytics', companyName: 'Data Analytics Corp', plan: 'enterprise' },
    { name: 'Marketing Hub', companyName: 'Marketing Hub Solutions', plan: 'pro' },
    { name: 'E-commerce Plus', companyName: 'E-commerce Plus Ltd', plan: 'basic' },
    { name: 'Digital Transform', companyName: 'Digital Transform Corp', plan: 'enterprise' },
    { name: 'SaaS Solutions', companyName: 'SaaS Solutions Inc', plan: 'pro' },
    { name: 'Mobile Apps', companyName: 'Mobile Apps Co', plan: 'basic' },
    { name: 'Cloud Services', companyName: 'Cloud Services Ltd', plan: 'enterprise' },
    { name: 'AI Research', companyName: 'AI Research Inc', plan: 'pro' },
    { name: 'Blockchain Tech', companyName: 'Blockchain Tech Corp', plan: 'enterprise' },
    { name: 'Social Media', companyName: 'Social Media Co', plan: 'basic' },
  ]

  const createdCustomers = [acmeCustomer, techStartupCustomer]

  for (const customerData of additionalCustomers) {
    const customer = await prisma.customer.create({
      data: customerData
    })
    createdCustomers.push(customer)
    console.log(`✅ Created customer: ${customer.companyName}`)
  }

  // Define staff users data
  const staffUsers = [
    {
      email: 'admin001@admin.com',
      firstName: 'Alex',
      lastName: 'Scalia',
      roleId: adminRole.id,
      password: 'password'
    },
    {
      email: 'admin002@admin.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      roleId: supportRole.id,
      password: 'password'
    },
    {
      email: 'admin003@admin.com', 
      firstName: 'Michael',
      lastName: 'Chen',
      roleId: supportRole.id,
      password: 'password'
    },
    {
      email: 'admin004@admin.com',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      roleId: adminRole.id,
      password: 'password'
    },
    {
      email: 'admin005@admin.com',
      firstName: 'David',
      lastName: 'Thompson',
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
        firstName: userData.firstName,
        lastName: userData.lastName,
        roleId: userData.roleId,
        passwordHash: hashedPassword,
      },
      include: {
        role: true
      }
    })
    
    console.log(`✅ Created staff user: ${staffUser.firstName} ${staffUser.lastName} (${staffUser.role.name})`)
  }

  // Define customer users data
  const customerUsers = [
    {
      email: 'john@acmecorp.com',
      firstName: 'John',
      lastName: 'Smith',
      customerId: acmeCustomer.id,
      roleId: customerAdminRole.id,
      password: 'password'
    },
    {
      email: 'jane@acmecorp.com',
      firstName: 'Jane',
      lastName: 'Doe',
      customerId: acmeCustomer.id,
      roleId: customerEditorRole.id,
      password: 'password'
    },
    {
      email: 'bob@acmecorp.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      customerId: acmeCustomer.id,
      roleId: customerViewerRole.id,
      password: 'password'
    },
    {
      email: 'alice@techstartup.com',
      firstName: 'Alice',
      lastName: 'Johnson',
      customerId: techStartupCustomer.id,
      roleId: customerAdminRole.id,
      password: 'password'
    },
    {
      email: 'mike@techstartup.com',
      firstName: 'Mike',
      lastName: 'Davis',
      customerId: techStartupCustomer.id,
      roleId: customerEditorRole.id,
      password: 'password'
    }
  ]

  // Add owner users for the additional customers
  const additionalOwners = [
    { email: 'admin@globalsolutions.com', firstName: 'Sarah', lastName: 'Global', customer: createdCustomers[2] },
    { email: 'owner@creativeagency.com', firstName: 'Mark', lastName: 'Creative', customer: createdCustomers[3] },
    { email: 'ceo@dataanalytics.com', firstName: 'Lisa', lastName: 'Analytics', customer: createdCustomers[4] },
    { email: 'founder@marketinghub.com', firstName: 'Tom', lastName: 'Marketing', customer: createdCustomers[5] },
    { email: 'admin@ecommerceplus.com', firstName: 'Emma', lastName: 'Commerce', customer: createdCustomers[6] },
    { email: 'cto@digitaltransform.com', firstName: 'Alex', lastName: 'Digital', customer: createdCustomers[7] },
    { email: 'lead@saassolutions.com', firstName: 'Chris', lastName: 'SaaS', customer: createdCustomers[8] },
    { email: 'dev@mobileapps.com', firstName: 'Jordan', lastName: 'Mobile', customer: createdCustomers[9] },
    { email: 'admin@cloudservices.com', firstName: 'Taylor', lastName: 'Cloud', customer: createdCustomers[10] },
    { email: 'researcher@airesearch.com', firstName: 'Sam', lastName: 'AI', customer: createdCustomers[11] },
    { email: 'founder@blockchaintech.com', firstName: 'Morgan', lastName: 'Block', customer: createdCustomers[12] },
    { email: 'manager@socialmedia.com', firstName: 'Casey', lastName: 'Social', customer: createdCustomers[13] },
  ]

  // Add additional owners to the customer users array
  additionalOwners.forEach(owner => {
    customerUsers.push({
      email: owner.email,
      firstName: owner.firstName,
      lastName: owner.lastName,
      customerId: owner.customer.id,
      roleId: customerAdminRole.id,
      password: 'password'
    })
  })

  // Create customer users with hashed passwords
  for (const userData of customerUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const customerUser = await prisma.customerUser.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        customerId: userData.customerId,
        roleId: userData.roleId,
        passwordHash: hashedPassword,
      },
      include: {
        role: true,
        customer: true
      }
    })
    
    console.log(`✅ Created customer user: ${customerUser.firstName} ${customerUser.lastName} (${customerUser.role.name} at ${customerUser.customer.companyName})`)
  }

  // Create sub customers (10 for each customer)
  console.log('🔧 Creating sub customers...')
  
  for (let i = 0; i < createdCustomers.length; i++) {
    const customer = createdCustomers[i]
    const companyDomain = customer.companyName?.toLowerCase().replace(/\s+/g, '') || 'company'
    
    for (let j = 1; j <= 10; j++) {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}.com`
      const hashedPassword = await bcrypt.hash('password', 12)
      
      const subCustomer = await prisma.subCustomer.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          customerId: customer.id,
          passwordHash: hashedPassword,
          status: j <= 8 ? 'ACTIVE' : (j === 9 ? 'INACTIVE' : 'SUSPENDED'), // Mix of statuses
        }
      })
      
      if (j === 1) {
        console.log(`✅ Created sub customers for ${customer.companyName} (showing first): ${subCustomer.firstName} ${subCustomer.lastName}`)
      }
    }
  }
  
  const totalSubCustomers = createdCustomers.length * 10
  console.log(`✅ Created ${totalSubCustomers} sub customers total`)

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