import {
  execSync,
  type ExecSyncOptionsWithStringEncoding,
} from 'node:child_process'

import { resolve } from 'node:path'

interface Options {
  inherit?: boolean
}

const makeOptions = (
  options?: Options
): Partial<ExecSyncOptionsWithStringEncoding> => {
  return {
    stdio: options?.inherit ? 'inherit' : 'pipe',
    cwd: resolve(),
    encoding: 'utf8',
  }
}

export const exec = (commands: string[], options?: Options) => {
  const outputs = []

  for (const command of commands) {
    const output = execSync(command, makeOptions(options)) as string
    outputs.push(output)
  }

  return outputs
}
