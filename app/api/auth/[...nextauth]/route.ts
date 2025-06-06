import NextAuth, { type NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../../../../app/generated/prisma"

const prisma = new PrismaClient()

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "staff-signin",
      name: "Staff Signin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find staff user by email (regardless of status)
          const staffUser = await prisma.staffUser.findFirst({
            where: {
              email: credentials.email,
              deletedAt: null // Only non-deleted users
            },
            include: {
              role: true
            }
          })

          if (!staffUser) {
            return null
          }

          // Verify password first
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            staffUser.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          // Check user status after password validation
          if (staffUser.status !== "ACTIVE") {
            throw new Error(`ACCOUNT_${staffUser.status}`)
          }

          // Return user object
          return {
            id: staffUser.id,
            email: staffUser.email,
            name: staffUser.name,
            role: staffUser.role.name,
            roleId: staffUser.roleId
          }
        } catch (error) {
          console.error("Auth error:", error)
          if (error instanceof Error && error.message.startsWith('ACCOUNT_')) {
            // Re-throw status errors to be handled by NextAuth
            throw error
          }
          return null
        }
      }
    }),
    CredentialsProvider({
      id: "customer-signin",
      name: "Customer User Signin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find customer user by email (regardless of status)
          const customerUser = await prisma.customerUser.findFirst({
            where: {
              email: credentials.email,
              deletedAt: null
            },
            include: {
              customer: true,
              role: true
            }
          })

          if (!customerUser) {
            return null
          }

          // Verify password first
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            customerUser.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          // Check customer (company) status first - this overrides user status
          if (customerUser.customer.status !== "ACTIVE") {
            throw new Error(`COMPANY_${customerUser.customer.status}`)
          }

          // Check individual user status only if company is active
          if (customerUser.status !== "ACTIVE") {
            throw new Error(`ACCOUNT_${customerUser.status}`)
          }

          // Return user object
          return {
            id: customerUser.id,
            email: customerUser.email,
            name: customerUser.name,
            role: "customer-user",
            customerRole: customerUser.role.name,
            customerId: customerUser.customerId,
            companyName: customerUser.customer.companyName,
            plan: customerUser.customer.plan
          }
        } catch (error) {
          console.error("Auth error:", error)
          if (error instanceof Error && error.message.startsWith('ACCOUNT_') || error instanceof Error && error.message.startsWith('COMPANY_')) {
            // Re-throw status errors to be handled by NextAuth
            throw error
          }
          return null
        }
      }
    }),
    CredentialsProvider({
      id: "subcustomer-signin",
      name: "Sub-Customer Signin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find sub-customer by email (regardless of status)
          const subCustomer = await prisma.subCustomer.findFirst({
            where: {
              email: credentials.email,
              deletedAt: null
            },
            include: {
              customer: true
            }
          })

          if (!subCustomer) {
            return null
          }

          // Verify password first
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            subCustomer.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          // Check customer (company) status first - this overrides subcustomer status
          if (subCustomer.customer.status !== "ACTIVE") {
            throw new Error(`COMPANY_${subCustomer.customer.status}`)
          }

          // Check individual subcustomer status only if company is active
          if (subCustomer.status !== "ACTIVE") {
            throw new Error(`ACCOUNT_${subCustomer.status}`)
          }

          // Return user object
          return {
            id: subCustomer.id,
            email: subCustomer.email,
            name: subCustomer.name,
            role: "subcustomer",
            customerId: subCustomer.customerId,
            customerName: subCustomer.customer.name
          }
        } catch (error) {
          console.error("Auth error:", error)
          if (error instanceof Error && error.message.startsWith('ACCOUNT_') || error instanceof Error && error.message.startsWith('COMPANY_')) {
            // Re-throw status errors to be handled by NextAuth
            throw error
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.roleId = user.roleId
        token.companyName = user.companyName
        token.plan = user.plan
        token.customerId = user.customerId
        token.customerRole = user.customerRole
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ""
        session.user.role = token.role
        session.user.roleId = token.roleId
        session.user.companyName = token.companyName
        session.user.plan = token.plan
        session.user.customerId = token.customerId
        session.user.customerRole = token.customerRole
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin", // This will be our selector page
    error: "/auth/error"
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions } 