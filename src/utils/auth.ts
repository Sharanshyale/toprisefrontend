import Cookies from "js-cookie"

export function getCookie(name: string): string | undefined {
  const value = Cookies.get(name)
  return value
}

export function getAllCookies(): { [key: string]: string } {
  const allCookies = Cookies.get()
  return allCookies
}

export function getUserIdFromToken(): string | null {
  try {
    // First, let's see all available cookies
    const allCookies = getAllCookies()

    // Try different possible token cookie names
    const possibleTokenNames = ["token", "authToken", "auth_token", "accessToken", "access_token"]
    let token: string | undefined
    let tokenName: string | undefined

    for (const name of possibleTokenNames) {
      token = getCookie(name)
      if (token) {
        tokenName = name
        break
      }
    }

    if (!token) {
      return null
    }

    const payloadBase64 = token.split(".")[1]
    if (!payloadBase64) {
      return null
    }

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    const payloadJson = atob(paddedBase64)
    const payload = JSON.parse(payloadJson)

    if (payload.id) {
      return payload.id
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

// Helper function to get token for API calls
export function getAuthToken(): string | null {
  // Try different possible token cookie names
  const possibleTokenNames = ["token", "authToken", "auth_token", "accessToken", "access_token"]

  for (const name of possibleTokenNames) {
    const token = getCookie(name)
    if (token) {
      return token
    }
  }

  return null
}
