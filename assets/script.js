/* ============================================
   LUCAS MANIVIT — PORTFOLIO JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll progress bar (GPU via transform scaleX) ---
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    let ticking = false;
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  // --- Count-up animation on hero metrics ---
  const metricValues = document.querySelectorAll('.hero-metric-value');
  if (metricValues.length && !reduceMotion) {
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    metricValues.forEach((el) => {
      const finalText = el.textContent.trim();
      const match = finalText.match(/^(\D*)([\d\s.,]+)(.*)$/);
      if (!match) return;
      const prefix = match[1] || '';
      const numStr = match[2].replace(/[\s,]/g, '').replace(',', '.');
      const target = parseFloat(numStr);
      if (!isFinite(target)) return;
      const suffix = match[3] || '';
      const duration = 1100;
      const format = (n) => {
        const rounded = target >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
        return prefix + rounded.toLocaleString('fr-FR').replace(/ /g, ' ') + suffix;
      };
      el.textContent = format(0);
      let start = null;
      const step = (ts) => {
        if (start === null) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        el.textContent = format(target * easeOut(t));
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = finalText;
      };
      // Slight delay so chip fade-in finishes first
      setTimeout(() => requestAnimationFrame(step), 200);
    });
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
    const setOpen = (open) => {
      hamburger.classList.toggle('open', open);
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    };
    hamburger.addEventListener('click', () => {
      setOpen(!hamburger.classList.contains('open'));
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false));
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) setOpen(false);
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
    // Prefill from ?project=slug (links from projects.html)
    const params = new URLSearchParams(window.location.search);
    const projectSlug = params.get('project');
    if (projectSlug) {
      const projectLabels = {
        'autopilot': 'Déploiement Autopilot zero-touch',
        'powershell-graph': 'Scripts PowerShell · Microsoft Graph',
        'pentest-final': "Tests d'intrusion — Cartographie & Exploitation (ESIEE-IT 5ᵉ a.)",
        'mpls-vpn': 'Backbone MPLS L3VPN — Projet transverse',
        'ad-secad': 'Active Directory durci — Install, GPO & attaques',
        'malware-analysis': 'Analyse de malware — Statique, dynamique, obfuscation',
        'secure-boot': 'Secure Boot UEFI — Windows, Linux & Intune',
        'proxmox-ansible': 'Provisionnement VM Proxmox via Ansible (IaC)',
        'openstack': 'OpenStack — Déploiement cloud privé',
        'audit-cis': 'Audit sécurité poste de travail (CIS Benchmark)'
      };
      const label = projectLabels[projectSlug] || projectSlug;
      const subjectSelect = document.getElementById('subject');
      const messageField = document.getElementById('message');
      if (subjectSelect) subjectSelect.value = 'projet';
      if (messageField && !messageField.value) {
        messageField.value = `Bonjour Lucas,\n\nJ'aimerais échanger avec vous au sujet du projet « ${label} ».\n\n`;
      }
    }

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
