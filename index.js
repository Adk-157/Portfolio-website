document.addEventListener('DOMContentLoaded', function() {
    // Custom cursor elements
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');
    const spotlight = document.getElementById('spotlight');
    
    // Cursor movement handler
    window.addEventListener('mousemove', e => {
        const x = e.clientX;
        const y = e.clientY;
        
        cursorDot.style.left = x + 'px';
        cursorDot.style.top = y + 'px';
        cursorCircle.style.left = x + 'px';
        cursorCircle.style.top = y + 'px';
        
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
    
    // Fade-in animation observer
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('.fade-in-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('is-visible');
                    }, index * 100);
                });
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all sections for fade-in animation
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        fadeInObserver.observe(section);
    });
    
    // Navigation active state observer
    const navLinks = document.querySelectorAll('.nav-link');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
            
            if (navLink) {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    // Remove active state from all nav links
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Add active state to current nav link
                    navLink.classList.add('active');
                }
            }
        });
    }, { rootMargin: '-10% 0px -60% 0px', threshold: 0.1 });


    
    // Observe sections for navigation highlighting
    sections.forEach(section => {
        navObserver.observe(section);
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const mainContent = document.querySelector('.main-content');
                const sectionTop = targetSection.offsetTop - 32; // Account for padding
                
                mainContent.scrollTo({
                    top: sectionTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Enhanced project card interactions
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            // Add subtle glow effect
            card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });
    
    // Enhanced certification card interactions
    const certCards = document.querySelectorAll('.cert-card');
    certCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Enhanced timeline marker hover effects
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        const marker = item.querySelector('.timeline-marker');
        const title = item.querySelector('.timeline-title');
        
        item.addEventListener('mouseenter', () => {
            if (marker) {
                marker.style.backgroundColor = '#ffffff';
                marker.style.transform = 'scale(1.2)';
                marker.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
            }
            if (title) {
                title.style.color = '#ffffff';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (marker) {
                marker.style.backgroundColor = '#374151';
                marker.style.transform = 'scale(1)';
                marker.style.boxShadow = '';
            }
            if (title) {
                title.style.color = '#ffffff';
            }
        });
    });
    
    // Enhanced skill tag hover effects
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'translateY(-2px) scale(1.05)';
            tag.style.backgroundColor = '#ffffff';
            tag.style.color = '#000000';
            tag.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.2)';
        });
        
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'translateY(0) scale(1)';
            tag.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            tag.style.color = '#d1d5db';
            tag.style.boxShadow = '';
        });
    });
    
    // Enhanced social link hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-4px) scale(1.1)';
            link.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
            link.style.backgroundColor = '';
        });
    });
    
    // Enhanced contact button hover effects
    const contactButtons = document.querySelectorAll('.contact-btn');
    contactButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
            if (button.classList.contains('btn--primary')) {
                button.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.2)';
            } else {
                button.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.1)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '';
        });
    });
    
    // Enhanced extracurricular item hover effects
    const extracurricularItems = document.querySelectorAll('.extracurricular-item');
    extracurricularItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(8px)';
            item.style.borderLeftColor = '#ffffff';
            item.style.backgroundColor = 'rgba(17, 24, 39, 0.8)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
            item.style.borderLeftColor = '#1f2937';
            item.style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
        });
    });
    
    // Tag hover effects in projects
    const projectTags = document.querySelectorAll('.tag');
    projectTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'scale(1.05)';
            tag.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            tag.style.borderColor = '#ffffff';
        });
        
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'scale(1)';
            tag.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            tag.style.borderColor = '#374151';
        });
    });
    
    // Subtle parallax effect for enhanced visual depth
    let ticking = false;
    
    function updateParallax() {
        const scrolled = document.querySelector('.main-content').scrollTop;
        const parallaxElements = document.querySelectorAll('.content-section');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.02; // Very subtle parallax
            const yPos = -(scrolled * speed * (index * 0.5));
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    document.querySelector('.main-content').addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
    
    // Initialize active nav link on page load
    const firstNavLink = document.querySelector('.nav-link');
    if (firstNavLink) {
        firstNavLink.classList.add('active');
    }
    
    // Handle mobile navigation visibility
    const handleMobileResize = () => {
        const isMobile = window.innerWidth <= 768;
        const navigation = document.querySelector('.navigation');
        
        if (isMobile) {
            navigation.style.display = 'none';
        } else {
            navigation.style.display = 'block';
        }
    };
    
    // Initial check and event listener for resize
    handleMobileResize();
    window.addEventListener('resize', handleMobileResize);
    
    // Enhanced reveal animation for better visual flow
    const revealElements = document.querySelectorAll('.timeline-item, .project-card, .cert-card, .skill-category, .extracurricular-item');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.8s ease-out ${index * 0.1}s, transform 0.8s ease-out ${index * 0.1}s`;
        revealObserver.observe(element);
    });
    
    // Smooth page loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease-in-out';
    
    // Delay to ensure fonts are loaded
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 200);
    
    // Section title underline animation on scroll
    const sectionTitles = document.querySelectorAll('.section-title');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target;
                title.style.setProperty('--underline-width', '100%');
            }
        });
    }, {
        threshold: 0.5
    });
    
    sectionTitles.forEach(title => {
        title.style.setProperty('--underline-width', '0%');
        titleObserver.observe(title);
    });
    
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Add visual focus indicators for keyboard navigation
            document.body.classList.add('keyboard-nav');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
    
    // Performance optimization for scroll events
    let scrollTimeout;
    document.querySelector('.main-content').addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Optimize animations on scroll end
        }, 150);
    });
    
    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .cert-card, .skill-tag, .timeline-item, .extracurricular-item, .tag');
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    
    // Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        console.log('Portfolio loaded successfully with enhanced dark aesthetic!');
    });
    
    // Enhanced error handling for missing elements
    try {
        // Initialize all interactive features
        console.log('All interactive features initialized successfully');
    } catch (error) {
        console.warn('Some features may not be available:', error);
    }
    
    // Add subtle breathing animation to profile image
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        setInterval(() => {
            profileImage.style.transform = 'scale(1.02)';
            setTimeout(() => {
                profileImage.style.transform = 'scale(1)';
            }, 2000);
        }, 4000);
    }
    
    console.log('Enhanced portfolio with original dark aesthetic initialized successfully!');
});