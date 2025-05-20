// Add any landing page specific JavaScript here
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .benefit-item, .step');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.classList.add('animate');
            }
        });
    };

    // Initial animation check
    animateOnScroll();
    
    // Check for animations on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Stats counter animation
    const stats = document.querySelectorAll('.stat-number');
    
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + (element.textContent.includes('+') ? '+' : '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const animateStats = () => {
        stats.forEach(stat => {
            const value = parseInt(stat.textContent);
            if (!isNaN(value)) {
                animateValue(stat, 0, value, 2000);
            }
        });
    };

    // Trigger stats animation when stats section is in view
    const statsSection = document.querySelector('.hero-stats');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    });

    if (statsSection) {
        observer.observe(statsSection);
    }

    // Add hover effect to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Demo button click handler
    const demoButton = document.querySelector('.cta-button.secondary');
    if (demoButton) {
        demoButton.addEventListener('click', () => {
            // Add your demo video modal or redirect logic here
            alert('Demo video coming soon!');
        });
    }

    // Image loading handling
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Add loading animation
        img.style.opacity = '0';
        
        // Handle successful load
        img.onload = function() {
            this.style.transition = 'opacity 0.5s ease';
            this.style.opacity = '1';
        };
        
        // Handle load error
        img.onerror = function() {
            console.warn('Failed to load image:', this.src);
            this.style.opacity = '1'; // Show fallback image immediately
        };
    });
}); 