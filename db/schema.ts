import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Users table - for admin authentication
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
  lastLogin: timestamp("last_login"),
});

// Projects table
export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  technologies: text("technologies")
    .array()
    .default(sql`ARRAY[]::text[]`),
  githubUrl: text("github_url"),
  demoUrl: text("demo_url"),
  status: text("status").default("en_cours").notNull(),
  projectDate: timestamp("project_date"),
  mainImageUrl: text("main_image_url"),
  galleryImages: text("gallery_images")
    .array()
    .default(sql`ARRAY[]::text[]`),
  visible: boolean("visible").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
  orderIndex: integer("order_index").default(0),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImageUrl: text("cover_image_url"),
  tags: text("tags")
    .array()
    .default(sql`ARRAY[]::text[]`),
  status: text("status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  readTimeMinutes: integer("read_time_minutes").default(1),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
  authorId: text("author_id").references(() => users.id),
});

// Skills table
export const skills = pgTable("skills", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  iconUrl: text("icon_url"),
  proficiency: integer("proficiency").default(75).notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// Media library table
export const mediaLibrary = pgTable("media_library", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes"),
  width: integer("width"),
  height: integer("height"),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  altText: text("alt_text"),
  usedIn: text("used_in")
    .array()
    .default(sql`ARRAY[]::text[]`),
});

// Page views table for analytics
export const pageViews = pgTable("page_views", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pagePath: text("page_path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"),
  viewedAt: timestamp("viewed_at")
    .default(sql`now()`)
    .notNull(),
  sessionId: text("session_id"),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  ipAddress: text("ip_address"),
  status: text("status").default("new").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
});

// AI generations table for tracking
export const aiGenerations = pgTable("ai_generations", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  prompt: text("prompt").notNull(),
  generatedContent: text("generated_content").notNull(),
  model: text("model"),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  usedInPostId: text("used_in_post_id").references(() => blogPosts.id),
});

// Site settings table (key-value store)
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// Timeline entries table for My Journey section
export const timelineEntries = pgTable("timeline_entries", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  period: text("period").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  skills: text("skills"),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// Specialty frames table for Home page
export const specialtyFrames = pgTable("specialty_frames", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").default("⚡"),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
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

export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type NewTimelineEntry = typeof timelineEntries.$inferInsert;

export type SpecialtyFrame = typeof specialtyFrames.$inferSelect;
export type NewSpecialtyFrame = typeof specialtyFrames.$inferInsert;
