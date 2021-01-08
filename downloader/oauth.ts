import {Issuer, TokenSet} from 'openid-client'
import * as readline from 'readline'

export async function getUserToken(clientId: string, clientSecret: string, scope: string): Promise<TokenSet> {
  const googleIssuer = await Issuer.discover('https://accounts.google.com')
  console.debug("issuer", googleIssuer)
  const client = new googleIssuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    response_types: ['code'],
    redirect_uris: ['urn:ietf:wg:oauth:2.0:oob']
  })

  const url = client.authorizationUrl({
    scope
  })
  console.log("auth url:", url)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const code = await new Promise((resolve, reject) => {
    rl.question("Input the verification code:", (code) => {
      resolve(code)
      rl.close()
    })
  })
  console.log("got code", code)

  const tokenSet = await client.grant({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
  })
  console.log('received tokens %j', tokenSet);
  return tokenSet
}

export async function refreshToken(clientId: string, clientSecret: string, tokenSet: TokenSet): Promise<TokenSet> {
  const googleIssuer = await Issuer.discover('https://accounts.google.com')
  const client = new googleIssuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    response_types: ['code'],
    redirect_uris: ['urn:ietf:wg:oauth:2.0:oob']
  })

  return client.refresh(tokenSet)
}

export function readTokens(str: string): TokenSet {
  return new TokenSet(JSON.parse(str))
}