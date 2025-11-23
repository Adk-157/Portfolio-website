document.addEventListener('DOMContentLoaded', function() {
    // Custom cursor elements
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');
    const spotlight = document.getElementById('spotlight');

    // Cursor movement handler
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        if (cursorDot) {
            cursorDot.style.left = x + 'px';
            cursorDot.style.top = y + 'px';
        }
        
        if (cursorCircle) {
            cursorCircle.style.left = (x - 20) + 'px';
            cursorCircle.style.top = (y - 20) + 'px';
        }
        
        if (spotlight) {
            spotlight.style.setProperty('--x', x + 'px');
            spotlight.style.setProperty('--y', y + 'px');
        }
    });

    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .card, .cert, .timeline-item, .extracurricular-item, .research-card');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (cursorCircle) {
                cursorCircle.style.transform = 'scale(1.5)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (cursorCircle) {
                cursorCircle.style.transform = 'scale(1)';
            }
        });
    });

    // FIXED: Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-list a, a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only handle anchor links (starting with #)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Calculate offset accounting for fixed header
                    const navHeight = document.querySelector('.top-nav')?.offsetHeight || 64;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - navHeight - 20; // Extra 20px padding
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Fade-in animation observer
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all fade-in items individually
    const fadeInItems = document.querySelectorAll('.fade-in-item');
    fadeInItems.forEach((item, index) => {
        // Add staggered delay based on index
        item.style.transitionDelay = `${index * 0.05}s`;
        fadeInObserver.observe(item);
    });

    // Initial animation for elements already in view on page load
    setTimeout(() => {
        fadeInItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.top > 0) {
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 50);
            }
        });
    }, 100);

    // Active navigation highlighting on scroll
    const sections = document.querySelectorAll('.section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const navHeight = document.querySelector('.top-nav')?.offsetHeight || 64;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= (sectionTop - navHeight - 100)) {
                current = section.getAttribute('id');
            }
        });

        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});