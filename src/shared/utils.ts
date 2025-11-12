import { author as _author, name } from '~/package.json'

const author = _author.name ?? _author
const authorInKebabCase = author.replace(/\s+/g, '-')
const appId = `com.${authorInKebabCase}.${name}`.toLowerCase()

/**
 * @param {string} id
 * @description Create the app id using the name and author from package.json transformed to kebab case if the id is not provided.
 * @default 'com.{author}.{app}' - the author and app comes from package.json
 * @example
 * makeAppId('com.example.app')
 * // => 'com.example.app'
 */
export const makeAppId = (id: string = appId): string => id

export const getFavourites = (): string[] => {
  try {
    const saved = localStorage.getItem('favourites')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const setFavourites = (favs: string[]) => {
  localStorage.setItem('favourites', JSON.stringify(favs))
}

export const toggleFavourite = (name: string) => {
  const favs = getFavourites()
  const updated = favs.includes(name)
    ? favs.filter((f) => f !== name)
    : [...favs, name]
  setFavourites(updated)
  return updated
}
