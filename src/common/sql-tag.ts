import { QueryConfig } from "pg";

export const sql = (name: string) => (strings: TemplateStringsArray, ...values: any[]): QueryConfig => ({
    name,
    text: String.raw(strings, ...values.map((_, i) => `$${i + 1}`)),
    values,
});
