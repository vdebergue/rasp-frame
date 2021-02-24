import {Client, Issuer, TokenSet} from 'openid-client'
import * as readline from 'readline'

export async function getUserToken(clientId: string, clientSecret: string, scope: string): Promise<TokenSet> {
  const client = await getClient(clientId, clientSecret)
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
  const client = await getClient(clientId, clientSecret)
  console.debug("client", client)
  const refreshed = await client.refresh(tokenSet.refresh_token!!)
  refreshed.refresh_token = tokenSet.refresh_token
  return refreshed
}

export function readTokens(str: string): TokenSet {
  return new TokenSet(JSON.parse(str))
}

async function getClient(clientId: string, clientSecret: string): Promise<Client> {
  const googleIssuer = await Issuer.discover('https://accounts.google.com')
  const client = new googleIssuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    response_types: ['code'],
    access_type: 'offline',
    redirect_uris: ['urn:ietf:wg:oauth:2.0:oob']
  })
  return client
}