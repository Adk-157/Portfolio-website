document.addEventListener('DOMContentLoaded', function() {
    // Custom cursor elements
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');
    const spotlight = document.getElementById('spotlight');

    // Cursor movement handler
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        cursorDot.style.left = x + 'px';
        cursorDot.style.top = y + 'px';
        
        cursorCircle.style.left = (x - 20) + 'px';
        cursorCircle.style.top = (y - 20) + 'px';
        
        spotlight.style.setProperty('--x', x + 'px');
        spotlight.style.setProperty('--y', y + 'px');
    });

    // Cursor hover effects
    const hoverElements = document.querySelectorAll('a, button, .card, .cert, .timeline-item, .extracurricular-item, .research-card');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursorCircle.style.transform = 'scale(1.5)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursorCircle.style.transform = 'scale(1)';
        });
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
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
});