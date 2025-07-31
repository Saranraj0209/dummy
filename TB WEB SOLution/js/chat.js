// Live Chat functionality for ThinkBright Web Solutions

class LiveChat {
    constructor() {
        this.isOpen = false;
        this.messages = [
            {
                type: 'bot',
                message: 'Hello! Welcome to ThinkBright Web Solutions. How can we help you today?',
                timestamp: new Date()
            }
        ];
        this.init();
    }

    init() {
        this.createChatWidget();
        this.attachEventListeners();
        this.addPredefinedResponses();
    }

    createChatWidget() {
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        chatContainer.className = 'fixed bottom-4 left-4 z-100';
        
        chatContainer.innerHTML = `
            <!-- Chat Toggle Button -->
            <div id="chat-toggle" class="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 mb-4">
                <i class="fas fa-comments text-xl"></i>
                <span id="chat-notification" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hidden">1</span>
            </div>

            <!-- Chat Window -->
            <div id="chat-window" class="bg-white rounded-2xl shadow-2xl w-80 h-96 hidden flex flex-col overflow-hidden border border-gray-200">
                <!-- Chat Header -->
                <div class="bg-gradient-to-r from-primary to-secondary text-white p-4 flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-user-headset text-sm"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-sm">ThinkBright Support</h3>
                            <p class="text-xs opacity-90">Online now</p>
                        </div>
                    </div>
                    <button id="chat-close" class="text-white hover:text-gray-200 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Chat Messages -->
                <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3">
                    <!-- Messages will be inserted here -->
                </div>

                <!-- Chat Input -->
                <div class="p-4 border-t border-gray-100">
                    <div class="flex items-center space-x-2">
                        <input 
                            type="text" 
                            id="chat-input" 
                            placeholder="Type your message..." 
                            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        >
                        <button 
                            id="chat-send" 
                            class="bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                            <i class="fas fa-paper-plane text-sm"></i>
                        </button>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">We typically reply within minutes</p>
                </div>
            </div>
        `;

        document.body.appendChild(chatContainer);
        this.renderMessages();
    }

    attachEventListeners() {
        const chatToggle = document.getElementById('chat-toggle');
        const chatClose = document.getElementById('chat-close');
        const chatSend = document.getElementById('chat-send');
        const chatInput = document.getElementById('chat-input');
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');

        chatToggle.addEventListener('click', () => this.toggleChat());
        chatClose.addEventListener('click', () => this.closeChat());
        chatSend.addEventListener('click', () => this.sendMessage());
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatNotification = document.getElementById('chat-notification');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            chatWindow.classList.remove('hidden');
            chatWindow.classList.add('flex');
            chatNotification.classList.add('hidden');
            this.isOpen = true;
            
            // Focus on input
            setTimeout(() => {
                document.getElementById('chat-input').focus();
            }, 300);
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        chatWindow.classList.add('hidden');
        chatWindow.classList.remove('flex');
        this.isOpen = false;
    }

    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            this.addMessage('user', message);
            chatInput.value = '';
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Send message to API
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.getSessionId(),
                    message: message,
                    senderType: 'user'
                })
            })
            .then(response => response.json())
            .then(data => {
                this.hideTypingIndicator();
                if (data.success && data.botResponse) {
                    this.addMessage('bot', data.botResponse.message);
                } else {
                    this.generateBotResponse(message); // Fallback to local response
                }
            })
            .catch(error => {
                console.error('Chat API error:', error);
                this.hideTypingIndicator();
                this.generateBotResponse(message); // Fallback to local response
            });
        }
    }

    getSessionId() {
        // Get or create session ID for chat
        let sessionId = localStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatSessionId', sessionId);
        }
        return sessionId;
    }

    addMessage(type, message, timestamp = new Date()) {
        this.messages.push({ type, message, timestamp });
        this.renderMessages();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = this.messages.map(msg => {
            const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (msg.type === 'user') {
                return `
                    <div class="flex justify-end">
                        <div class="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
                            <p class="text-sm">${msg.message}</p>
                            <p class="text-xs opacity-75 mt-1">${time}</p>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="flex justify-start">
                        <div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs">
                            <p class="text-sm">${msg.message}</p>
                            <p class="text-xs text-gray-500 mt-1">${time}</p>
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'flex justify-start';
        typingIndicator.innerHTML = `
            <div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response;
        
        // Simple keyword-based responses
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
            response = "Our pricing varies based on project complexity. For a custom quote, please check our pricing section or contact us directly. We offer competitive rates for web development, mobile apps, and design services.";
        } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('work') || lowerMessage.includes('examples')) {
            response = "You can view our portfolio showcasing various projects including e-commerce sites, business websites, and mobile applications. Would you like me to direct you to our portfolio section?";
        } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
            response = "We develop both iOS and Android mobile applications using modern technologies. Our apps are designed for optimal performance and user experience. What type of mobile app are you looking to develop?";
        } else if (lowerMessage.includes('website') || lowerMessage.includes('web')) {
            response = "We create custom, responsive websites tailored to your business needs. This includes e-commerce sites, business websites, portfolios, and more. What type of website do you need?";
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('quote') || lowerMessage.includes('estimate')) {
            response = "I'd be happy to connect you with our team for a detailed quote. You can fill out our contact form or call us directly. What's your project about?";
        } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            response = "Hello! Thanks for reaching out to ThinkBright Web Solutions. I'm here to help you with any questions about our web development and mobile app services. What can I assist you with today?";
        } else if (lowerMessage.includes('time') || lowerMessage.includes('timeline') || lowerMessage.includes('how long')) {
            response = "Project timelines vary depending on complexity. A basic website typically takes 2-4 weeks, while more complex applications can take 6-12 weeks. We'll provide a detailed timeline after understanding your requirements.";
        } else if (lowerMessage.includes('support') || lowerMessage.includes('maintenance')) {
            response = "We offer ongoing support and maintenance services including regular updates, security monitoring, and technical support. Our team is available 24/7 to ensure your website runs smoothly.";
        } else {
            // Default responses
            const defaultResponses = [
                "That's a great question! Our team would be happy to discuss this with you in detail. Would you like to schedule a consultation?",
                "I'd love to help you with that. Can you tell me more about your specific needs so I can provide better assistance?",
                "Thanks for your interest in ThinkBright Web Solutions! For detailed information about this, I recommend speaking with one of our specialists. Shall I connect you?",
                "That sounds like an interesting project! Our team has experience with various types of solutions. Would you like to discuss your requirements with our experts?"
            ];
            response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        this.addMessage('bot', response);
    }
    addPredefinedResponses() {
        // Show notification after 10 seconds if chat hasn't been opened
        setTimeout(() => {
            if (!this.isOpen) {
                const notification = document.getElementById('chat-notification');
                notification.classList.remove('hidden');
                
                // Add a new message
                this.addMessage('bot', 'Need help getting started? I\'m here to answer any questions about our services!');
            }
        }, 10000);
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const liveChat = new LiveChat();
    
    console.log('Live chat initialized successfully!');
});