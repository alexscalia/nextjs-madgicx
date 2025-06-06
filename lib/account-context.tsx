"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ConnectedAccount {
  id: string
  platform: string
  accountId: string
  accountName: string
  accessToken: string
  refreshToken?: string | null
  expiresAt?: Date | null
  isActive: boolean
  currency?: string
  createdAt: Date
  updatedAt: Date
}

interface AccountContextType {
  selectedAccount: ConnectedAccount | null
  accounts: ConnectedAccount[]
  setSelectedAccount: (account: ConnectedAccount | null) => void
  setAccounts: (accounts: ConnectedAccount[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(null)
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Auto-select first account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0])
    }
  }, [accounts, selectedAccount])

  return (
    <AccountContext.Provider value={{
      selectedAccount,
      accounts,
      setSelectedAccount,
      setAccounts,
      isLoading,
      setIsLoading
    }}>
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
} 