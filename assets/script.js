/* ============================================
   LUCAS MANIVIT — PORTFOLIO JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Typewriter Effect ---
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const titles = [
      'Ingénieur Réseaux & Sécurité',
      'SCCM/Intune Engineer',
      'Ingénieur Workstation · Intune · SCCM',
      'Passionné Cybersécurité & Infrastructure'
    ];
    let titleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const TYPE_SPEED = 50;
    const DELETE_SPEED = 30;
    const PAUSE = 1800;

    function typewrite() {
      const current = titles[titleIdx];
      if (!deleting) {
        typewriterEl.textContent = current.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(typewrite, PAUSE);
          return;
        }
        setTimeout(typewrite, TYPE_SPEED);
      } else {
        typewriterEl.textContent = current.slice(0, charIdx);
        charIdx--;
        if (charIdx < 0) {
          deleting = false;
          charIdx = 0;
          titleIdx = (titleIdx + 1) % titles.length;
          setTimeout(typewrite, 300);
          return;
        }
        setTimeout(typewrite, DELETE_SPEED);
      }
    }
    typewrite();
  }

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  // --- Staggered reveal for children ---
  document.querySelectorAll('.reveal-stagger').forEach(parent => {
    const children = parent.querySelectorAll('.reveal-child');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * 60);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    obs.observe(parent);
  });

  // --- Nav hamburger ---
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Active nav link ---
  const navItems = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      item.classList.add('active');
    }
    // Handle hash links for index page
    if (href && href.startsWith('#')) {
      item.classList.remove('active');
    }
  });

  // --- Scroll to Top ---
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Project Filters ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- Contact Form ---
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  if (form && formSuccess) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      formSuccess.classList.add('show');
      setTimeout(() => {
        form.style.display = '';
        form.reset();
        formSuccess.classList.remove('show');
      }, 4000);
    });
  }

  // --- Hero fade-in on load ---
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      heroContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    });
  }

  // --- Smooth anchor scrolling (for same-page links) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
