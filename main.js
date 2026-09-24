document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
      const icon = menuBtn.querySelector('svg');
      if (mobileNav.classList.contains('open')) {
        // Change to X icon
        icon.innerHTML = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';
      } else {
        // Change to Menu icon
        icon.innerHTML = '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>';
      }
    });
  }

  // Set Active Nav Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });

  // Testimonial Carousel Logic
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  
  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = Array.from(track.children);
    let currentIndex = 0;
    
    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
    
    const dots = Array.from(dotsContainer.children);
    
    function updateSlider() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }
    
    function goToSlide(index) {
      currentIndex = index;
      updateSlider();
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    }
    
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Auto-play
    let autoplay = setInterval(nextSlide, 5000);
    
    const carousel = document.querySelector('.testimonial-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', () => {
      autoplay = setInterval(nextSlide, 5000);
    });
  }

  // Hero Carousel Logic
  const heroTrack = document.getElementById('hero-track');
  const heroDotsContainer = document.getElementById('hero-dots');
  
  if (heroTrack && heroDotsContainer) {
    const heroSlides = Array.from(heroTrack.children);
    let heroCurrentIndex = 0;
    
    // Create dots
    heroSlides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('hero-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to hero slide ${i + 1}`);
      dot.addEventListener('click', () => goToHeroSlide(i));
      heroDotsContainer.appendChild(dot);
    });
    
    const heroDots = Array.from(heroDotsContainer.children);
    
    function updateHeroSlider() {
      heroTrack.style.transform = `translateX(-${heroCurrentIndex * 100}%)`;
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === heroCurrentIndex);
      });
      heroDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === heroCurrentIndex);
      });
    }
    
    function goToHeroSlide(index) {
      heroCurrentIndex = index;
      updateHeroSlider();
    }
    
    function nextHeroSlide() {
      heroCurrentIndex = (heroCurrentIndex + 1) % heroSlides.length;
      updateHeroSlider();
    }
    
    // Auto-play
    let heroAutoplay = setInterval(nextHeroSlide, 6000); // Slower for hero
    
    const heroContainer = document.querySelector('.hero-carousel-container');
    heroContainer.addEventListener('mouseenter', () => clearInterval(heroAutoplay));
    heroContainer.addEventListener('mouseleave', () => {
      heroAutoplay = setInterval(nextHeroSlide, 6000);
    });
  }

  // ==== 404 Redirection Logic ====
  
  // 1. Handle ALL links
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Exclude navbar, mobile-nav, premium-footer, footer-bottom, sidebar
      const isExcluded = link.closest('.navbar') || 
                         link.closest('.mobile-nav') || 
                         link.closest('.premium-footer') || 
                         link.closest('.footer-bottom') || 
                         link.closest('.sidebar') ||
                         link.closest('.sidebar-menu') ||
                         link.getAttribute('href') === '#' ||
                         link.id === 'backToHomeBtn' ||
                         link.hasAttribute('target'); // Ignore _blank etc just in case

      if (!isExcluded) {
        e.preventDefault();
        window.location.href = '404.html';
      }
    });
  });

  // 2. Handle ALL forms
  const allForms = document.querySelectorAll('form');
  allForms.forEach(form => {
    // Prevent default form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const isExcluded = form.closest('.navbar') || 
                         form.closest('.mobile-nav') || 
                         form.closest('.premium-footer') || 
                         form.closest('.footer-bottom') || 
                         form.closest('.sidebar') ||
                         form.closest('.sidebar-menu') ||
                         form.id === 'loginForm' ||
                         form.id === 'signupForm';
                         
      if (form.reportValidity()) {
        if (!isExcluded) {
           window.location.href = '404.html';
        }
      }
    });
    
    // Some forms might use button type="button" to submit 
    // We attach a click listener to all buttons in the form just in case
    const buttons = form.querySelectorAll('button, input[type="button"], input[type="submit"]');
    buttons.forEach(btn => {
      if (btn.type !== 'submit') {
        btn.addEventListener('click', (e) => {
           // We might need to manually trigger reportValidity and then route
           if (form.reportValidity()) {
             const isExcluded = form.closest('.navbar') || 
                                form.closest('.mobile-nav') || 
                                form.closest('.premium-footer') || 
                                form.closest('.footer-bottom') || 
                                form.closest('.sidebar') ||
                                form.closest('.sidebar-menu') ||
                                form.id === 'loginForm' ||
                                form.id === 'signupForm';
             if (!isExcluded) {
               e.preventDefault();
               window.location.href = '404.html';
             }
           }
        });
      }
    });
  });
});
