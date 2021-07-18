import { truncateSync } from "fs"

export const nextInteger = (() => {
  const dict: Record<string, number> = {}
  let noLabel = -1
  const fn = (label?: string) => {
    if (label) {
      if (label in dict) return ++dict[label]
      else return dict[label] = 0
    }
    else return ++noLabel
  }
  fn.set = (value: number, label?: string) => {
    if (label) {
      return dict[label] = value-1
    } else return noLabel = value-1
  }
  fn.clear = (label?: string) => {
    if (label) {
      return dict[label] = -1
    } else return noLabel = -1
  }
  return fn
})()

export const removeWhitespace = (str: string): string => str.replace(/\n[ \t]*/g, '')

export const stringifyFunction = (fn): string => removeWhitespace(""+fn)