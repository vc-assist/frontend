import type { OAuthFlow } from "@backend.keychain/auth_flow_pb"
import { z } from "zod"

function encodeHex(buff: Uint8Array): string {
  let value = ""

  for (let i = 0; i < buff.length; i++) {
    const b = buff[i]
    const upper = b >> 4
    const lower = b & 0b00001111

    if (upper >= 10) {
      value += String.fromCharCode(97 + (upper - 10))
    } else {
      value += String.fromCharCode(upper + 48)
    }
    if (lower >= 10) {
      value += String.fromCharCode(97 + (upper - 10))
    } else {
      value += String.fromCharCode(upper + 48)
    }
  }

  return value
}

export function getOAuthLoginUrl(flow: OAuthFlow): string {
  const url = new URL(flow.baseLoginUrl)

  url.searchParams.append("client_id", flow.clientId)
  url.searchParams.append("access_type", flow.accessType)
  url.searchParams.append("scope", flow.scope)
  url.searchParams.append("code_challenge", flow.codeVerifier)
  url.searchParams.append("redirect_uri", flow.redirectUri)

  const nonce = new Uint8Array(16)
  crypto.getRandomValues(nonce)
  url.searchParams.append("state", encodeHex(nonce))
  url.searchParams.append("response_type", "code")
  url.searchParams.append("prompt", "login")

  return url.toString()
}

export function getTokenFormData(code: string, req: OAuthFlow): FormData {
  const form = new FormData()
  form.append("grant_type", "authorization_code")
  form.append("client_id", req.clientId)
  form.append("scope", req.scope)
  form.append("code", code)
  if (req.codeVerifier) {
    form.append("code_verifier", req.codeVerifier)
  }
  form.append("redirect_uri", req.redirectUri)
  return form
}

export const openIdTokenResponse = z.object({
  refresh_token: z.string().optional(),
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
})
