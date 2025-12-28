import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Database file path - use data directory for SQLite file
const dbPath = path.join(process.cwd(), "data", "portfolio.db");

// Create database connection
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent access
sqlite.pragma("journal_mode = WAL");

// Export drizzle database instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from "./schema";
