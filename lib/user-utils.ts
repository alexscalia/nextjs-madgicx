import { PrismaClient } from "../app/generated/prisma"

const prisma = new PrismaClient()

export type UserType = 'staff' | 'customer' | 'subcustomer'

export interface UserStatusCheck {
  isActive: boolean
  status: string
  reason?: string
}

/**
 * Check if a user account is active and can access the system
 */
export async function checkUserStatus(userId: string, userType: UserType): Promise<UserStatusCheck> {
  try {
    let user
    
    switch (userType) {
      case 'staff':
        user = await prisma.staffUser.findUnique({
          where: { id: userId },
          select: { status: true, deletedAt: true }
        })
        break
      case 'customer':
        user = await prisma.customerUser.findUnique({
          where: { id: userId },
          select: { status: true, deletedAt: true }
        })
        break
      case 'subcustomer':
        user = await prisma.subCustomer.findUnique({
          where: { id: userId },
          select: { status: true, deletedAt: true }
        })
        break
      default:
        return { isActive: false, status: 'UNKNOWN', reason: 'Invalid user type' }
    }

    if (!user) {
      return { isActive: false, status: 'NOT_FOUND', reason: 'User not found' }
    }

    if (user.deletedAt) {
      return { isActive: false, status: 'DELETED', reason: 'User account has been deleted' }
    }

    if (user.status !== 'ACTIVE') {
      const reasonMap = {
        'INACTIVE': 'User account is temporarily disabled',
        'SUSPENDED': 'User account has been suspended',
        'PENDING': 'User account is pending approval'
      }
      return { 
        isActive: false, 
        status: user.status, 
        reason: reasonMap[user.status as keyof typeof reasonMap] || 'User account is not active'
      }
    }

    return { isActive: true, status: user.status }
  } catch (error) {
    console.error('Error checking user status:', error)
    return { isActive: false, status: 'ERROR', reason: 'Error checking user status' }
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(userId: string, userType: UserType, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'): Promise<boolean> {
  try {
    switch (userType) {
      case 'staff':
        await prisma.staffUser.update({
          where: { id: userId },
          data: { status, updatedAt: new Date() }
        })
        break
      case 'customer':
        await prisma.customerUser.update({
          where: { id: userId },
          data: { status, updatedAt: new Date() }
        })
        break
      case 'subcustomer':
        await prisma.subCustomer.update({
          where: { id: userId },
          data: { status, updatedAt: new Date() }
        })
        break
      default:
        return false
    }
    return true
  } catch (error) {
    console.error('Error updating user status:', error)
    return false
  }
} 