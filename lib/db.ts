import { neon } from "@neondatabase/serverless";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlFn = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

let _raw: ReturnType<typeof neon> | null = null;

function getRaw() {
  if (!_raw) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _raw = neon(process.env.DATABASE_URL);
  }
  return _raw;
}

const sql: SqlFn = (strings, ...values) =>
  getRaw()(strings, ...values) as Promise<any[]>; // eslint-disable-line @typescript-eslint/no-explicit-any

export default sql;
