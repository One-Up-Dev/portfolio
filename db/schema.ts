import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Generate UUID helper
function generateUUID() {
  return crypto.randomUUID();
}

// Users table - for admin authentication
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  lastLogin: text("last_login"),
});

// Projects table
export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  technologies: text("technologies", { mode: "json" })
    .$type<string[]>()
    .default([]),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  status: text("status", { enum: ["en_cours", "termine", "abandonne"] })
    .default("en_cours")
    .notNull(),
  projectDate: text("project_date"),
  mainImageUrl: text("main_image_url"),
  galleryImages: text("gallery_images", { mode: "json" })
    .$type<string[]>()
    .default([]),
  visible: integer("visible", { mode: "boolean" }).default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  orderIndex: integer("order_index").default(0),
});

// Blog posts table
export const blogPosts = sqliteTable("blog_posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImageUrl: text("cover_image_url"),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  status: text("status", { enum: ["draft", "published"] })
    .default("draft")
    .notNull(),
  publishedAt: text("published_at"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  readTimeMinutes: integer("read_time_minutes").default(1),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  authorId: text("author_id").references(() => users.id),
});

// Skills table
export const skills = sqliteTable("skills", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  name: text("name").notNull(),
  category: text("category", {
    enum: ["frontend", "backend", "outils", "soft_skills"],
  }).notNull(),
  iconUrl: text("icon_url"),
  orderIndex: integer("order_index").default(0),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// Media library table
export const mediaLibrary = sqliteTable("media_library", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  altText: text("alt_text"),
  usedIn: text("used_in", { mode: "json" }).$type<string[]>().default([]),
});

// Page views table for analytics
export const pageViews = sqliteTable("page_views", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  pagePath: text("page_path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  viewedAt: text("viewed_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  sessionId: text("session_id"),
});

// Contact messages table
export const contactMessages = sqliteTable("contact_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  ipAddress: text("ip_address"),
  status: text("status", { enum: ["new", "read", "archived"] })
    .default("new")
    .notNull(),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// AI generations table for tracking
export const aiGenerations = sqliteTable("ai_generations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUUID()),
  prompt: text("prompt").notNull(),
  generatedContent: text("generated_content").notNull(),
  model: text("model"),
  tokensUsed: integer("tokens_used"),
  createdAt: text("created_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
  usedInPostId: text("used_in_post_id").references(() => blogPosts.id),
});

// Site settings table (key-value store)
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }),
  updatedAt: text("updated_at")
    .default(sql`(datetime('now'))`)
    .notNull(),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

export type MediaItem = typeof mediaLibrary.$inferSelect;
export type NewMediaItem = typeof mediaLibrary.$inferInsert;

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

export type AIGeneration = typeof aiGenerations.$inferSelect;
export type NewAIGeneration = typeof aiGenerations.$inferInsert;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
