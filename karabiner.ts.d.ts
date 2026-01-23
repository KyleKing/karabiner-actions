// Type declarations for karabiner.ts
declare module "karabiner.ts" {
  export function duoLayer(key1: string, key2: string, options?: any): any;
  export function hyperLayer(key: string, options?: any): any;
  export function ifVar(variable: string, value: number | string): any;
  export function map(key: string, options?: any): any;
  export function mapSimultaneous(keys: string[], options?: any): any;
  export function rule(description: string, options?: any): any;
  export function toKey(key: string, modifiers?: string[], options?: any): any;
  export function toSetVar(variable: string, value: number | string): any;
  export function withModifier(modifier: string): any;
  export function writeToProfile(
    profileName: string,
    rules: any[],
    parameters?: Record<string, number>,
  ): void;
}
