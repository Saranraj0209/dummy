const { storage } = require('./storage');

// API route handlers
class ApiHandler {
  // Health check endpoint
  static async health(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? 'connected' : 'not configured'
    }));
  }

  // Contact form submission
  static async createContact(req, res) {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const contactData = JSON.parse(body);
          
          // Validate required fields
          const { firstName, lastName, email, service, message } = contactData;
          if (!firstName || !lastName || !email || !service || !message) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Missing required fields' 
            }));
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Invalid email format' 
            }));
            return;
          }

          // Create contact in database
          const newContact = await storage.createContact({
            firstName,
            lastName,
            email,
            phone: contactData.phone || null,
            service,
            message,
            status: 'new',
            isRead: false
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Contact form submitted successfully',
            contactId: newContact.id
          }));
        } catch (error) {
          console.error('Contact creation error:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: 'Invalid JSON data' 
          }));
        }
      });
    } catch (error) {
      console.error('Contact API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }));
    }
  }

  // Get portfolio items
  static async getPortfolio(req, res) {
    try {
      const portfolioItems = await storage.getPortfolioItems();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        data: portfolioItems 
      }));
    } catch (error) {
      console.error('Portfolio API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Error fetching portfolio items' 
      }));
    }
  }

  // Get testimonials
  static async getTestimonials(req, res) {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        data: testimonials 
      }));
    } catch (error) {
      console.error('Testimonials API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Error fetching testimonials' 
      }));
    }
  }

  // Chat message handling
  static async createChatMessage(req, res) {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { sessionId, message, senderType = 'user' } = JSON.parse(body);
          
          if (!sessionId || !message) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Missing required fields' 
            }));
            return;
          }

          // Save user message
          const newMessage = await storage.createChatMessage({
            sessionId,
            senderType,
            message,
            isRead: false
          });

          // Generate bot response (simplified version)
          let botResponse = "Thank you for your message. Our team will get back to you shortly.";
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            botResponse = "Our pricing varies based on project complexity. Please check our pricing section or contact us for a custom quote.";
          } else if (lowerMessage.includes('portfolio')) {
            botResponse = "You can view our portfolio showcasing various projects. Would you like me to direct you there?";
          }

          // Save bot response
          const botMessage = await storage.createChatMessage({
            sessionId,
            senderType: 'bot',
            message: botResponse,
            isRead: false
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            userMessage: newMessage,
            botResponse: botMessage
          }));
        } catch (error) {
          console.error('Chat message parsing error:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: 'Invalid JSON data' 
          }));
        }
      });
    } catch (error) {
      console.error('Chat API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }));
    }
  }

  // Newsletter subscription
  static async subscribe(req, res) {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const { email, firstName, lastName, source = 'website' } = JSON.parse(body);
          
          if (!email) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Email is required' 
            }));
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Invalid email format' 
            }));
            return;
          }

          // Create subscriber
          const newSubscriber = await storage.createSubscriber({
            email,
            firstName: firstName || null,
            lastName: lastName || null,
            source,
            isActive: true
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Successfully subscribed to newsletter',
            subscriberId: newSubscriber.id
          }));
        } catch (error) {
          console.error('Newsletter subscription error:', error);
          // Check if it's a duplicate email error
          if (error.message.includes('unique') || error.message.includes('duplicate')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Email already subscribed' 
            }));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Invalid JSON data' 
            }));
          }
        }
      });
    } catch (error) {
      console.error('Newsletter API error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }));
    }
  }

  // 404 handler for unknown API routes
  static notFound(req, res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'API endpoint not found' 
    }));
  }
}

module.exports = ApiHandler;