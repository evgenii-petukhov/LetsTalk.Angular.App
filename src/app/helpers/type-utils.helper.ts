export const isOfType = <T extends new(...args: any[]) => any>(obj: any, type: T): obj is T => obj instanceof type;
