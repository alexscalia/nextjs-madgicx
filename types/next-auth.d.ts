import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      firstName?: string | null
      middleName?: string | null
      lastName?: string | null
      name?: string | null
      role?: string
      roleId?: string
      companyName?: string | null
      plan?: string | null
      customerId?: string
      customerRole?: string
    }
  }

  interface User {
    id: string
    email: string
    firstName?: string | null
    middleName?: string | null
    lastName?: string | null
    name?: string | null
    role?: string
    roleId?: string
    companyName?: string | null
    plan?: string | null
    customerId?: string
    customerRole?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string | null
    middleName?: string | null
    lastName?: string | null
    role?: string
    roleId?: string
    companyName?: string | null
    plan?: string | null
    customerId?: string
    customerRole?: string
  }
} 