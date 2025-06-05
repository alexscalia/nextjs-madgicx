import { toast } from "sonner"

export interface AuthError {
  type: 'credentials' | 'network' | 'server' | 'unknown'
  message: string
  details?: string
}

export function getAuthError(result: any): AuthError {
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

  if (result.status >= 500) {
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