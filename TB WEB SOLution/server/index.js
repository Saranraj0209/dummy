const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Handle API routes (future expansion)
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, pathname);
    return;
  }

  // Serve static files
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Security: prevent directory traversal
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(process.cwd(), safePath);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Page Not Found</h1>');
      return;
    }

    // Get file extension and set content type
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Internal Server Error</h1>');
        return;
      }

      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      });
      res.end(content);
    });
  });
});

const ApiHandler = require('./api');

// Handle API requests with database integration
function handleApiRequest(req, res, pathname) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route API requests to appropriate handlers
  try {
    if (pathname === '/api/health') {
      ApiHandler.health(req, res);
    } else if (pathname === '/api/contact' && req.method === 'POST') {
      ApiHandler.createContact(req, res);
    } else if (pathname === '/api/portfolio' && req.method === 'GET') {
      ApiHandler.getPortfolio(req, res);
    } else if (pathname === '/api/testimonials' && req.method === 'GET') {
      ApiHandler.getTestimonials(req, res);
    } else if (pathname === '/api/chat' && req.method === 'POST') {
      ApiHandler.createChatMessage(req, res);
    } else if (pathname === '/api/subscribe' && req.method === 'POST') {
      ApiHandler.subscribe(req, res);
    } else {
      ApiHandler.notFound(req, res);
    }
  } catch (error) {
    console.error('API error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }));
  }
}

// Start the server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 ThinkBright Web Solutions server running at http://${HOST}:${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = server;