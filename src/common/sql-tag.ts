export interface Query {
	name?: string;
	text: string;
	values: any[];
}

export const sql = (name: string) => (strings: TemplateStringsArray, ...values: any[]): Query => ({
    name,
    text: String.raw(strings, ...values.map((_, i) => `$${i + 1}`)),
    values,
});
