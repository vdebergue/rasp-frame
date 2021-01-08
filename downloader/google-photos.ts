import fetch from 'node-fetch';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';

const baseUrl = "https://photoslibrary.googleapis.com/v1"

export async function albumList(accessToken: string, pageSize: number = 50): Promise<any> {
  const response = await fetch(`${baseUrl}/albums?pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  if (!response.ok) throw response
  return await response.json()
}

export async function mediaItemsSearch(accessToken: string, albumId: string, pageSize: number = 50, nextPageToken?: string): Promise<any> {
  const response = await fetch(`${baseUrl}/mediaItems:search`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ContentType: 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      albumId: albumId,
      pageSize: pageSize,
      pageToken: nextPageToken
    })
  })
  if (!response.ok) {
    const body = await response.text()
    throw `${response.status} ${response.statusText} ${body}`
  }
  return await response.json()
}

export async function getMediaItem(accessToken: string, id: string): Promise<any> {
  const response = await fetch(`${baseUrl}/mediaItems/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  if (!response.ok) {
    const body = await response.text()
    throw `${response.status} ${response.statusText} ${body}`
  }
  return await response.json()
}

// https://developers.google.com/photos/library/guides/access-media-items#base-urls
export async function downloadImage(accessToken: string, mediaItem: any, location: string): Promise<void> {
  const refreshedItem = await getMediaItem(accessToken, mediaItem.id)
  const response = await fetch(`${refreshedItem.baseUrl}=d`)
  if (!response.ok) {
    const body = await response.text()
    throw `${response.status} ${response.statusText} ${body}`
  }
  
  return new Promise<void>((resolve, reject) => {
    const p = pipeline(
      response.body,
      createWriteStream(location),
      (err) => reject(err)
    )
    p.on("finish", () => resolve())
  })
  
}
