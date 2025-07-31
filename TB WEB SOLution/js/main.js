// Main JavaScript functionality for ThinkBright Web Solutions

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('show');
            const icon = mobileMenuButton.querySelector('i');
            
            if (mobileMenu.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                mobileMenu.style.display = 'block';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                setTimeout(() => {
                    if (!mobileMenu.classList.contains('show')) {
                        mobileMenu.style.display = 'none';
                    }
                }, 300);
            }
        });
    }

    // Close mobile menu when clicking on links
    const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('show');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 300);
        });
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos <= bottom) {
                navLinksAll.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.display = 'none';
                }
            });

            // Toggle current FAQ item
            if (isActive) {
                faqItem.classList.remove('active');
                answer.style.display = 'none';
            } else {
                faqItem.classList.add('active');
                answer.style.display = 'block';
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const service = formData.get('service');
            const message = formData.get('message');

            // Basic form validation
            if (!firstName || !lastName || !email || !service || !message) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = 'Sending...';
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            // Submit form to API
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone || '',
                    service: service,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                // Reset button state
                submitButton.innerHTML = originalText;
                submitButton.classList.remove('loading');
                submitButton.disabled = false;

                if (data.success) {
                    // Show success message
                    showFormMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error message
                    showFormMessage(data.message || 'There was an error sending your message. Please try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                
                // Reset button state
                submitButton.innerHTML = originalText;
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
                
                // Show error message
                showFormMessage('There was an error sending your message. Please try again.', 'error');
            });
        });
    }

    function showFormMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `mt-4 text-center ${type === 'error' ? 'text-red-400' : 'text-green-400'}`;
        formMessage.classList.remove('hidden');

        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Back to top button
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Header background on scroll
    const header = document.querySelector('nav');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('bg-white/95');
                header.classList.add('shadow-lg');
            } else {
                header.classList.remove('shadow-lg');
            }
        });
    }

    // Service card interactions
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Portfolio item interactions
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Pricing card interactions
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('scale-105')) {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('scale-105')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Testimonial card interactions
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize statistics counter animation
    const statsElements = document.querySelectorAll('[data-stat]');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        statsElements.forEach(element => {
            const target = parseInt(element.textContent);
            const increment = target / 100;
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    element.textContent = Math.floor(current) + (element.textContent.includes('%') ? '%' : '+');
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target + (element.textContent.includes('%') ? '%' : '+');
                }
            };

            updateCounter();
        });

        statsAnimated = true;
    }

    // Trigger stats animation when stats section is visible
    const statsSection = document.querySelector('#home');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(animateStats, 1000);
                }
            });
        });

        observer.observe(statsSection);
    }

    // Add loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Error handling for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('Failed to load image:', this.src);
        });
    });

    // Prevent form submission on Enter for specific inputs
    const preventEnterInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    preventEnterInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.form && this !== this.form.querySelector('button[type="submit"]')) {
                e.preventDefault();
            }
        });
    });

    console.log('ThinkBright Web Solutions - JavaScript initialized successfully!');
});
