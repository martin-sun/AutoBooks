// Type declarations for ESM imports
declare module 'https://esm.sh/graphql-tag@2.12.6' {
  export function gql(literals: TemplateStringsArray, ...placeholders: any[]): any;
}

declare module 'https://esm.sh/@graphql-tools/schema@9.0.0' {
  export function makeExecutableSchema(options: {
    typeDefs: any;
    resolvers: any;
  }): any;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export interface SupabaseClient {
    from: (table: string) => any;
    auth: any;
    rpc: (fn: string, params?: any) => any;
  }
  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}

declare module 'https://esm.sh/graphql@16.6.0' {
  export function graphql(options: {
    schema: any;
    source: string;
    variableValues?: any;
    contextValue?: any;
  }): Promise<any>;
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

// Deno namespace declaration
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  export const env: Env;
}
