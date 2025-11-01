export const extractOwnerAndRepoFromGitRemoteURL = (url: string) => url
  ?.replace(/^git@github.com:|.git$/gims, '')
  ?.replace(/^https:\/\/github.com\/|.git$/gims, '')
  ?.trim()
