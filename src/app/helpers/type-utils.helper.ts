/* eslint-disable @typescript-eslint/no-explicit-any */
export const isOfType = <T extends new (...args: any[]) => any>(obj: any, type: T): obj is T => obj instanceof type;
