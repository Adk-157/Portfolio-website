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
    // Select only the navigation bar links
    const navLinks = document.querySelectorAll('.nav-list a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default immediately
            
            const href = this.getAttribute('href');
            console.log('Clicked link:', href); // Debug log
            
            // Remove the # to get the ID
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);
            
            console.log('Target element:', targetElement); // Debug log
            
            if (targetElement) {
                // Get the navigation bar height
                const navBar = document.querySelector('.top-nav');
                const navHeight = navBar ? navBar.offsetHeight : 64;
                
                // Get the target position
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;
                
                console.log('Scrolling to:', offsetPosition); // Debug log
                
                // Scroll to the position
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            } else {
                console.error('Target element not found:', targetId);
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
            const linkHref = link.getAttribute('href').replace('#', '');
            if (linkHref === current) {
                link.classList.add('active');
            }
        });
    });
});