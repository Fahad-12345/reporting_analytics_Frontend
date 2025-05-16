export function replaceAll (str: string, find: string, replace: string): string {
    let re = new RegExp(find, 'g')
    return str.replace(re, replace)
}

export function isNil (obj: unknown): boolean {
    return obj === undefined || obj === null
}