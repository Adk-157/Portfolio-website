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
    const hoverElements = document.querySelectorAll('a, button, .project-card, .cert-card, .skill-tag, .timeline-item, .extracurricular-item');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        
        element.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100; // Account for fixed header
                
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
                const items = entry.target.querySelectorAll('.fade-in-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate');
                    }, index * 100);
                });
            }
        });
    }, { threshold: 0.1 });

    // Observe all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        fadeInObserver.observe(section);
    });

    // Initial animation for elements already in view
    const initialItems = document.querySelectorAll('.fade-in-item');
    initialItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 100);
        }
    });
});
