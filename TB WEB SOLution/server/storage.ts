import { contacts, users, projects, chatMessages, portfolioItems, testimonials, blogPosts, subscribers } from "../shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import type { 
  Contact, InsertContact, 
  User, InsertUser, 
  Project, InsertProject,
  ChatMessage, InsertChatMessage,
  PortfolioItem, InsertPortfolioItem,
  Testimonial, InsertTestimonial,
  BlogPost, InsertBlogPost,
  Subscriber, InsertSubscriber
} from "../shared/schema";

// Interface for storage operations
export interface IStorage {
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getContactById(id: number): Promise<Contact | undefined>;
  updateContactStatus(id: number, status: string, isRead?: boolean): Promise<Contact | undefined>;
  
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(): Promise<Project[]>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  updateProjectStatus(id: number, status: string): Promise<Project | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  markChatMessagesAsRead(sessionId: string): Promise<void>;
  
  // Portfolio operations
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getFeaturedPortfolioItems(): Promise<PortfolioItem[]>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  
  // Testimonial operations
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Blog operations
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Newsletter operations
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getActiveSubscribers(): Promise<Subscriber[]>;
}

export class DatabaseStorage implements IStorage {
  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));
    return contact || undefined;
  }

  async updateContactStatus(id: number, status: string, isRead?: boolean): Promise<Contact | undefined> {
    const updateData: Partial<Contact> = { status };
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
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || undefined;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProjectStatus(id: number, status: string): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async markChatMessagesAsRead(sessionId: string): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.sessionId, sessionId));
  }

  // Portfolio operations
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.isActive, true))
      .orderBy(asc(portfolioItems.sortOrder), desc(portfolioItems.createdAt));
  }

  async getFeaturedPortfolioItems(): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.featured, true))
      .orderBy(asc(portfolioItems.sortOrder));
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [newItem] = await db
      .insert(portfolioItems)
      .values(item)
      .returning();
    return newItem;
  }

  // Testimonial operations
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isApproved, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db
      .insert(testimonials)
      .values(testimonial)
      .returning();
    return newTestimonial;
  }

  // Blog operations
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db
      .insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  }

  // Newsletter operations
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const [newSubscriber] = await db
      .insert(subscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getActiveSubscribers(): Promise<Subscriber[]> {
    return await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.isActive, true))
      .orderBy(desc(subscribers.subscribedAt));
  }
}

export const storage = new DatabaseStorage();