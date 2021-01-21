import { program } from 'commander';
import { getUserToken, readTokens, refreshToken } from './oauth'
import { writeFile, readFile, mkdir, symlink, rm, stat } from 'fs/promises';
import { TokenSet } from 'openid-client';
import { albumList, mediaItemsSearch, downloadImage } from './google-photos';
import { existsSync, fstat } from 'fs';

program
  .command("oauth")
  .requiredOption("-c, --config <configFile>")
  .action(async (cmd) => {
    console.log("oauth cmd")
    try {
      const config = await loadConfig(cmd.config)
      const scope = "https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata"
      const tokens = await getUserToken(config.clientId, config.clientSecret, scope)
      console.log("user tokens:", tokens)
      saveTokens(tokens, config.workingFolder)
    } catch (error) {
      console.error("error during oauth flow", error)
    }
  })

program
  .command("list")
  .requiredOption("-c, --config <configFile>")
  .action(async (cmd) => {
    try {
      const config = await loadConfig(cmd.config)
      const tokens = await getTokens(config)
      const response = await albumList(tokens.access_token!)
      console.log(response.albums.map((a: any) => ({id: a.id, title: a.title})))
    } catch (error) {
      console.error(error)
    }
  })

program
  .command("downloadAlbum")
  .requiredOption("-c, --config <configFile>")
  .action(async (cmd) => {
    try {
      const config = await loadConfig(cmd.config)
      let items: any[] = []
      const tokens = await getTokens(config)
      const pageSize = 50
      let response = await mediaItemsSearch(tokens.access_token!, config.albumId, pageSize);
      items = items.concat(response.mediaItems)

      while(response.nextPageToken) {
        response = await mediaItemsSearch(tokens.access_token!, config.albumId, pageSize, response.nextPageToken);
        items = items.concat(response.mediaItems)
      }
      console.log(`got ${items.length} media items`)
      await writeFile(`${config.workingFolder}/album.json`, JSON.stringify(items))
    } catch (error) {
      console.error("error during downloadAlbum album:", error)
    }
  })

program
  .command("randomPhoto")
  .requiredOption("-c, --config <configFile>")
  .action(async (cmd) => {
    try {
      const config = await loadConfig(cmd.config)
      const content = await readFile(`${config.workingFolder}/album.json`)
      const tokens = await getTokens(config)
      const items = JSON.parse(content.toString())
      let tries = 3
      let item = randomElement(items)

      while(tries > 0) {
        const filename = getMediaItemFilename(item)
        const fileAlreadyExists = existsSync(`${config.workingFolder}/album/${filename}`)
        if (fileAlreadyExists) {
          item = randomElement(items)
          tries--
        } else {
          break;
        }
      }
      console.debug("item", item)
      const filename = getMediaItemFilename(item)
      try {
        await mkdir(`${config.workingFolder}/album`, {recursive: true})
      } catch (error) {
      }
      await downloadImage(tokens.access_token!, item, `${config.workingFolder}/album/${filename}`)
      await rm(`${config.workingFolder}/latest`, {force: true})
      await symlink(`${config.workingFolder}/album/${filename}`, `${config.workingFolder}/latest`)
      console.log("done")
    } catch (error) {
      console.error("error during random photo:", error)
    }
  })

program.parse(process.argv)

async function getTokens(config: Config): Promise<TokenSet> {
  const tokenStr = await readFile(`${config.workingFolder}/tokens.json`)
  let tokens = readTokens(tokenStr.toString())
  console.debug(tokens)
  if (tokens.expired()) {
    console.log("refreshing tokens")
    tokens = await refreshToken(config.clientId, config.clientSecret, tokens)
    saveTokens(tokens, config.workingFolder)
  }
  return tokens
}

async function saveTokens(tokens: TokenSet, workingFolder: string) {
  await writeFile(`${workingFolder}/tokens.json`, JSON.stringify(tokens))
}

function randomElement<T>(arr: T[]): T {
  const length = arr.length
  const index = Math.floor(Math.random() * Math.floor(length))
  return arr[index]
}

function getMediaItemFilename(mediaItem: any): string {
  const parts = (mediaItem.filename as string).split(".")
  const extension = parts[parts.length - 1]
  return `${mediaItem.id}.${extension}`
}

type Config = {
  clientId: string
  clientSecret: string
  workingFolder: string
  albumId: string
}
async function loadConfig(location: string): Promise<Config> {
  const content = await readFile(location)
  return JSON.parse(content.toString())
}
