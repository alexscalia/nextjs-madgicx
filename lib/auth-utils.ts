import { toast } from "sonner"

export interface AuthError {
  type: 'credentials' | 'network' | 'server' | 'unknown'
  message: string
  details?: string
}

export function getAuthError(result: { error?: string | null; status?: number } | null | undefined): AuthError {
  if (!result) {
    return {
      type: 'network',
      message: 'Network error occurred',
      details: 'Please check your internet connection and try again.'
    }
  }

  if (result.error) {
    switch (result.error) {
      case 'CredentialsSignin':
        return {
          type: 'credentials',
          message: 'Invalid credentials',
          details: 'The email or password you entered is incorrect. Please try again.'
        }
      case 'AccessDenied':
        return {
          type: 'credentials',
          message: 'Access denied',
          details: 'You do not have permission to access this portal.'
        }
      case 'AccountDisabled':
        return {
          type: 'credentials',
          message: 'Account disabled',
          details: 'Your account has been disabled. Please contact support for assistance.'
        }
      case 'ACCOUNT_INACTIVE':
        return {
          type: 'credentials',
          message: 'Account temporarily disabled',
          details: 'Your account is temporarily disabled. Please contact support for assistance.'
        }
      case 'ACCOUNT_SUSPENDED':
        return {
          type: 'credentials',
          message: 'Account suspended',
          details: 'Your account has been suspended due to policy violations. Please contact support.'
        }
      case 'ACCOUNT_PENDING':
        return {
          type: 'credentials',
          message: 'Account pending approval',
          details: 'Your account is awaiting approval. Please wait for activation or contact support.'
        }
      case 'COMPANY_INACTIVE':
        return {
          type: 'credentials',
          message: 'Company account disabled',
          details: 'Your company account is temporarily disabled. Please contact support for assistance.'
        }
      case 'COMPANY_SUSPENDED':
        return {
          type: 'credentials',
          message: 'Company account suspended',
          details: 'Your company account has been suspended. Please contact support immediately.'
        }
      case 'COMPANY_PENDING':
        return {
          type: 'credentials',
          message: 'Company pending approval',
          details: 'Your company account is awaiting approval. Please wait for activation or contact support.'
        }
      case 'SessionRequired':
        return {
          type: 'credentials',
          message: 'Session required',
          details: 'Please sign in to continue.'
        }
      default:
        return {
          type: 'server',
          message: 'Authentication failed',
          details: 'An error occurred during sign in. Please try again.'
        }
    }
  }

  if (result.status === 401) {
    return {
      type: 'credentials',
      message: 'Unauthorized',
      details: 'Invalid email or password. Please check your credentials.'
    }
  }

  if (result.status && result.status >= 500) {
    return {
      type: 'server',
      message: 'Server error',
      details: 'Our servers are experiencing issues. Please try again later.'
    }
  }

  return {
    type: 'unknown',
    message: 'Sign in failed',
    details: 'An unexpected error occurred. Please try again.'
  }
}

export function showAuthError(error: AuthError) {
  toast.error(error.message, {
    description: error.details,
    duration: 5000,
  })
}

export function showAuthSuccess(message: string = 'Successfully signed in!') {
  toast.success(message, {
    duration: 3000,
  })
} 