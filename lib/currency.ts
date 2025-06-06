// Currency formatting utilities

export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'THB': '฿',
  'SGD': 'S$',
  'HKD': 'HK$',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'CHF',
  'CNY': '¥',
  'INR': '₹',
  'KRW': '₩',
  'MYR': 'RM',
  'PHP': '₱',
  'VND': '₫',
  'IDR': 'Rp',
  'TWD': 'NT$',
  'NZD': 'NZ$',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'TRY': '₺',
  'BRL': 'R$',
  'MXN': '$',
  'ARS': '$',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/',
  'ZAR': 'R',
  'EGP': 'E£',
  'MAD': 'MAD',
  'NGN': '₦',
  'KES': 'KSh',
  'GHS': 'GH₵',
  'UGX': 'USh',
  'TZS': 'TSh',
  'ZMW': 'ZK',
  'BWP': 'P',
  'MUR': '₨',
  'SCR': '₨',
  'AMD': '֏',
  'AZN': '₼',
  'BGN': 'лв',
  'BAM': 'KM',
  'GEL': '₾',
  'HRK': 'kn',
  'ISK': 'kr',
  'MDL': 'lei',
  'MKD': 'ден',
  'RON': 'lei',
  'RSD': 'дин',
  'UAH': '₴',
  'BYN': 'Br',
  'ALL': 'L',
  'XOF': 'CFA',
  'XAF': 'FCFA'
}

export const CURRENCY_LOCALES: Record<string, string> = {
  'USD': 'en-US',
  'EUR': 'de-DE',
  'GBP': 'en-GB',
  'JPY': 'ja-JP',
  'THB': 'th-TH',
  'SGD': 'en-SG',
  'HKD': 'en-HK',
  'AUD': 'en-AU',
  'CAD': 'en-CA',
  'CHF': 'de-CH',
  'CNY': 'zh-CN',
  'INR': 'en-IN',
  'KRW': 'ko-KR',
  'MYR': 'ms-MY',
  'PHP': 'en-PH',
  'VND': 'vi-VN',
  'IDR': 'id-ID',
  'TWD': 'zh-TW',
  'NZD': 'en-NZ',
  'SEK': 'sv-SE',
  'NOK': 'nb-NO',
  'DKK': 'da-DK',
  'PLN': 'pl-PL',
  'CZK': 'cs-CZ',
  'HUF': 'hu-HU',
  'RUB': 'ru-RU',
  'TRY': 'tr-TR',
  'BRL': 'pt-BR',
  'MXN': 'es-MX',
  'ARS': 'es-AR',
  'CLP': 'es-CL',
  'COP': 'es-CO',
  'PEN': 'es-PE',
  'ZAR': 'en-ZA',
  'EGP': 'ar-EG',
  'MAD': 'ar-MA',
  'NGN': 'en-NG',
  'KES': 'en-KE',
  'GHS': 'en-GH',
  'UGX': 'en-UG',
  'TZS': 'en-TZ',
  'ZMW': 'en-ZM',
  'BWP': 'en-BW',
  'MUR': 'en-MU',
  'SCR': 'en-SC',
  'AMD': 'hy-AM',
  'AZN': 'az-AZ',
  'BGN': 'bg-BG',
  'BAM': 'bs-BA',
  'GEL': 'ka-GE',
  'HRK': 'hr-HR',
  'ISK': 'is-IS',
  'MDL': 'ro-MD',
  'MKD': 'mk-MK',
  'RON': 'ro-RO',
  'RSD': 'sr-RS',
  'UAH': 'uk-UA',
  'BYN': 'be-BY',
  'ALL': 'sq-AL',
  'XOF': 'fr-SN',
  'XAF': 'fr-CM'
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = 'USD',
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true
  } = options

  // Get currency symbol
  const symbol = CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode

  // For currencies without decimals (like JPY, KRW, VND)
  const noDecimalCurrencies = ['JPY', 'KRW', 'VND', 'IDR', 'UGX', 'TZS', 'ZMW', 'XOF', 'XAF']
  const useDecimals = !noDecimalCurrencies.includes(currencyCode.toUpperCase())

  // Get locale for number formatting
  const locale = CURRENCY_LOCALES[currencyCode.toUpperCase()] || 'en-US'

  // Format the number
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: useDecimals ? minimumFractionDigits : 0,
    maximumFractionDigits: useDecimals ? maximumFractionDigits : 0
  }).format(amount)

  return showSymbol ? `${symbol}${formattedNumber}` : formattedNumber
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode
}

/**
 * Extract currency from campaign metrics
 */
export function getCampaignCurrency(campaign: { metrics?: { currency?: string } } | null): string {
  return campaign?.metrics?.currency || 'USD'
}

/**
 * Format currency for display in tables/cards
 */
export function formatDisplayCurrency(amount: number, currency: string = 'USD'): string {
  return formatCurrency(amount, currency, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
} 