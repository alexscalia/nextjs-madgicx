import NextAuth, { type NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../../../../app/generated/prisma"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "staff-login",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find staff user by email
          const staffUser = await prisma.staffUser.findUnique({
            where: {
              email: credentials.email,
              deletedAt: null // Only active users
            },
            include: {
              role: true
            }
          })

          if (!staffUser) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            staffUser.passwordHash
          )

          if (!isValidPassword) {
            return null
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
          return null
        }
      }
    }),
    CredentialsProvider({
      id: "customer-login",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find customer by email
          const customer = await prisma.customer.findUnique({
            where: {
              email: credentials.email,
              deletedAt: null
            }
          })

          if (!customer) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            customer.passwordHash
          )

          if (!isValidPassword) {
            return null
          }

          // Return user object
          return {
            id: customer.id,
            email: customer.email,
            name: customer.name,
            role: "customer",
            companyName: customer.companyName,
            plan: customer.plan
          }
        } catch (error) {
          console.error("Auth error:", error)
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

export { handler as GET, handler as POST } 