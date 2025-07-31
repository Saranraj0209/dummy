const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq, desc, asc } = require('drizzle-orm');
const { pgTable, serial, text, timestamp, varchar, boolean, integer } = require('drizzle-orm/pg-core');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

// Define schema in CommonJS
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 50 }).notNull().default('client'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  service: varchar('service', { length: 100 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('planning'),
  budget: integer('budget'),
  deadline: timestamp('deadline'),
  startDate: timestamp('start_date'),
  completedDate: timestamp('completed_date'),
  projectUrl: varchar('project_url', { length: 500 }),
  githubUrl: varchar('github_url', { length: 500 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  senderType: varchar('sender_type', { length: 20 }).notNull(),
  message: text('message').notNull(),
  metadata: text('metadata'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

const portfolioItems = pgTable('portfolio_items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  technologies: text('technologies'),
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

const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientTitle: varchar('client_title', { length: 255 }),
  clientCompany: varchar('client_company', { length: 255 }),
  message: text('message').notNull(),
  rating: integer('rating').notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  projectId: integer('project_id').references(() => projects.id),
  featured: boolean('featured').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  category: varchar('category', { length: 100 }).notNull(),
  tags: text('tags'),
  featuredImage: varchar('featured_image', { length: 500 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  isPublished: boolean('is_published').notNull().default(false),
  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  source: varchar('source', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at')
});

// Database connection
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// Database storage implementation
class DatabaseStorage {
  // Contact operations
  async createContact(contact) {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContacts() {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async getContactById(id) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));
    return contact || undefined;
  }

  async updateContactStatus(id, status, isRead) {
    const updateData = { status };
    if (isRead !== undefined) {
      updateData.isRead = isRead;
    }
    
    const [updatedContact] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact || undefined;
  }

  // User operations
  async createUser(user) {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async getUserById(id) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || undefined;
  }

  // Chat operations
  async createChatMessage(message) {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(sessionId) {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async markChatMessagesAsRead(sessionId) {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.sessionId, sessionId));
  }

  // Portfolio operations
  async getPortfolioItems() {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))
      .orderBy(asc(portfolioItems.sortOrder), desc(portfolioItems.createdAt));
  }

  async getFeaturedPortfolioItems() {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.featured, true))
      .orderBy(asc(portfolioItems.sortOrder));
  }

  async createPortfolioItem(item) {
    const [newItem] = await db
      .insert(portfolioItems)
      .values(item)
      .returning();
    return newItem;
  }

  // Testimonial operations
  async getApprovedTestimonials() {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isApproved, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async getFeaturedTestimonials() {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(testimonial) {
    const [newTestimonial] = await db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return newTestimonial;
  }

  // Newsletter operations
  async createSubscriber(subscriber) {
    const [newSubscriber] = await db
      .insert(subscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getActiveSubscribers() {
    return await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.isActive, true))
      .orderBy(desc(subscribers.subscribedAt));
  }
}

const storage = new DatabaseStorage();

module.exports = { storage, DatabaseStorage };