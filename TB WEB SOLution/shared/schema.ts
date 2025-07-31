import { pgTable, serial, text, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for authentication and user management
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 50 }).notNull().default('client'), // client, admin, staff
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Contact submissions from the website contact form
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  service: varchar('service', { length: 100 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'), // new, contacted, in-progress, completed
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Projects table to track client projects
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  serviceType: varchar('service_type', { length: 100 }).notNull(), // website, mobile-app, ecommerce, ui-ux, etc.
  status: varchar('status', { length: 50 }).notNull().default('planning'), // planning, in-progress, testing, completed, delivered
  budget: integer('budget'), // in cents
  deadline: timestamp('deadline'),
  startDate: timestamp('start_date'),
  completedDate: timestamp('completed_date'),
  projectUrl: varchar('project_url', { length: 500 }),
  githubUrl: varchar('github_url', { length: 500 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Chat messages for the live chat system
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // user, bot, agent
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON string for additional data
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Portfolio items for showcasing work
export const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(), // website, mobile-app, ecommerce, ui-ux
  technologies: text('technologies'), // JSON array of technologies used
  imageUrl: varchar('image_url', { length: 500 }),
  projectUrl: varchar('project_url', { length: 500 }),
  clientName: varchar('client_name', { length: 255 }),
  completedDate: timestamp('completed_date'),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Testimonials from clients
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientTitle: varchar('client_title', { length: 255 }),
  clientCompany: varchar('client_company', { length: 255 }),
  message: text('message').notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  avatarUrl: varchar('avatar_url', { length: 500 }),
  projectId: integer('project_id').references(() => projects.id),
  featured: boolean('featured').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Blog posts for content marketing
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  category: varchar('category', { length: 100 }).notNull(),
  tags: text('tags'), // JSON array of tags
  featuredImage: varchar('featured_image', { length: 500 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Newsletter subscribers
export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  source: varchar('source', { length: 100 }), // website, social, referral
  isActive: boolean('is_active').notNull().default(true),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at')
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  blogPosts: many(blogPosts)
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id]
  }),
  testimonials: many(testimonials)
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  project: one(projects, {
    fields: [testimonials.projectId],
    references: [projects.id]
  })
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id]
  })
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;