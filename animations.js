(function() {
  'use strict';

  // Bail out for reduced motion
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.documentElement.classList.remove('am');
    return;
  }

  document.addEventListener('DOMContentLoaded', function() {
    initPageTransition();
    initCustomCursor();
    initScrollReveal();
    initParallax();
    initMenu();
    initTrustFlipper();
  });

  // ─── 1. Page Transition Curtain ───
  var transitionOverlay;
  function initPageTransition() {
    // Inject overlay if missing
    transitionOverlay = document.querySelector('.page-transition');
    if (!transitionOverlay) {
      transitionOverlay = document.createElement('div');
      transitionOverlay.className = 'page-transition';
      document.body.appendChild(transitionOverlay);
    }

    // Trigger exit wipe on load
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        transitionOverlay.classList.add('out');
      });
    });

    // Intercept internal link clicks for transition
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      
      // Ignore hashes, external, mail, tel links
      if (!href || href.charAt(0) === '#' || /^(https?|mailto|tel):/.test(href)) return;
      // Ignore links with target="_blank"
      if (a.getAttribute('target') === '_blank') return;

      e.preventDefault();
      
      // Wipe down curtain
      transitionOverlay.classList.remove('out');
      transitionOverlay.classList.add('active');
      
      setTimeout(function() {
        window.location.href = href;
      }, 550);
    });
  }

  // ─── 2. Custom Magnetic Cursor ───
  function initCustomCursor() {
    if (window.innerWidth <= 1024) return; // Disable on tablet/mobile

    // Inject cursor elements
    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    
    var follower = document.createElement('div');
    follower.className = 'custom-cursor-follower';
    
    var cursorText = document.createElement('span');
    cursorText.className = 'custom-cursor-text';
    
    follower.appendChild(cursorText);
    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    var mouseX = 0, mouseY = 0; // Current mouse coords
    var followerX = 0, followerY = 0; // Current follower coords
    var targetX = 0, targetY = 0; // Target coordinates

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Cursor dot moves instantly
      cursor.style.transform = 'translate3d(' + mouseX + 'px, ' + mouseY + 'px, 0) translate(-50%, -50%)';
    });

    // Lerp (Linear Interpolation) loop for smooth cursor lag
    function updateFollower() {
      // Lerp formula: current = current + (target - current) * easeRate
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;

      follower.style.transform = 'translate3d(' + followerX + 'px, ' + followerY + 'px, 0) translate(-50%, -50%)';
      requestAnimationFrame(updateFollower);
    }
    requestAnimationFrame(updateFollower);

    // Hover interactions
    var hoverSelectors = 'a, button, .project-card, .service-card, .award-row, .hamburger';
    
    document.addEventListener('mouseover', function(e) {
      var target = e.target.closest(hoverSelectors);
      if (!target) return;

      document.body.classList.add('cursor-hovering');

      // Determine text label based on target
      if (target.classList.contains('project-card')) {
        cursorText.textContent = 'View';
      } else if (target.classList.contains('service-card')) {
        cursorText.textContent = 'Explore';
      } else if (target.classList.contains('hamburger') || target.classList.contains('menu-close')) {
        cursorText.textContent = 'Menu';
      } else if (target.classList.contains('btn')) {
        cursorText.textContent = 'Go';
      } else if (target.tagName === 'A' && target.closest('.footer')) {
        document.body.classList.remove('cursor-hovering');
        document.body.classList.add('cursor-hovering-light');
      } else {
        cursorText.textContent = 'Link';
      }
    });

    document.addEventListener('mouseout', function(e) {
      var target = e.target.closest(hoverSelectors);
      if (!target) return;

      document.body.classList.remove('cursor-hovering');
      document.body.classList.remove('cursor-hovering-light');
      cursorText.textContent = '';
    });
  }

  // ─── 3. Scroll Reveal System ───
  function initScrollReveal() {
    // Automatically wrap text within reveal elements into clip animations if needed,
    // or just animate elements that have reveal classes
    var revealElements = document.querySelectorAll('.reveal-fade-up, .clip-item');
    
    // Assign stagger delays dynamically
    var delays = [
      { sel: '.hero h1 span, .hero h1 .clip-item', stagger: 120 },
      { sel: '.hero p.sub', delay: 350 },
      { sel: '.hero .cta-row', delay: 450 },
      { sel: '.step', stagger: 150 },
      { sel: '.project-card', stagger: 120 },
      { sel: '.pillar', stagger: 150 },
      { sel: '.service-card', stagger: 180 },
      { sel: '.award-row', stagger: 100 },
      { sel: '.review-card', stagger: 80 }
    ];

    delays.forEach(function(d) {
      var els = document.querySelectorAll(d.sel);
      els.forEach(function(el, idx) {
        var delayTime = d.stagger ? (idx * d.stagger) : (d.delay || 0);
        el.style.setProperty('--d', delayTime + 'ms');
        el.style.transitionDelay = delayTime + 'ms';
      });
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // ─── 4. Parallax Effect ───
  function initParallax() {
    var parallaxItems = [];
    
    // Add images inside containers for slow scrolling
    document.querySelectorAll('.zoom-image-container img').forEach(function(img) {
      parallaxItems.push({
        el: img,
        rate: -0.06,
        isImage: true
      });
    });

    // Add decorative numbers
    document.querySelectorAll('.step .num, .pillar .quote-mark, .tally-item .num').forEach(function(num) {
      parallaxItems.push({
        el: num,
        rate: 0.08,
        isImage: false
      });
    });

    if (!parallaxItems.length) return;

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function() {
        var wh = window.innerHeight;
        parallaxItems.forEach(function(item) {
          var rect = item.el.getBoundingClientRect();
          // Skip off-screen elements
          if (rect.bottom < 0 || rect.top > wh) return;

          var center = rect.top + rect.height / 2;
          var progress = (center / wh) - 0.5;
          var offset = progress * 60 * item.rate;
          
          if (item.isImage) {
            // Apply parallax scroll as scale + translate to ensure full container bleed
            item.el.style.transform = 'scale(1.08) translateY(' + offset + 'px)';
          } else {
            item.el.style.transform = 'translate3d(0, ' + Math.round(offset) + 'px, 0)';
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // ─── 5. Sliding Navigation Menu ───
  function initMenu() {
    var ham = document.querySelector('.hamburger');
    var nav = document.querySelector('.nav');
    if (!ham || !nav) return;

    // Build/inject backdrop if missing
    var backdrop = document.querySelector('.menu-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      document.body.appendChild(backdrop);
    }

    // Build/inject menu panel if missing
    var panel = document.querySelector('.menu-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'menu-panel';
      panel.innerHTML =
        '<button class="menu-close" aria-label="Close menu">' +
          '<svg width="18" height="18" viewBox="0 0 18 18"><line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/></svg>' +
        '</button>' +
        '<nav class="menu-nav">' +
          '<a href="index.html">Home</a>' +
          '<a href="projects.html">Projects</a>' +
          '<a href="about.html">About</a>' +
          '<a href="services.html">Services</a>' +
          '<a href="awards.html">Awards</a>' +
          '<a href="reviews.html">Reviews</a>' +
          '<a href="contact.html">Contact</a>' +
        '</nav>' +
        '<div class="menu-divider"></div>' +
        '<div class="menu-contact">' +
          '<a href="mailto:jenny@ambathrooms.com.au">jenny@ambathrooms.com.au</a>' +
          '<a href="tel:+61291814776">(02) 9181 4776</a>' +
          '<span>Shop 8, 77-105 Victoria Rd, Drummoyne 2047</span>' +
        '</div>';
      document.body.appendChild(panel);
    }

    // Highlight current page active link
    var page = window.location.pathname.split('/').pop() || 'index.html';
    panel.querySelectorAll('.menu-nav a').forEach(function(a) {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });

    function openMenu() {
      panel.classList.add('open');
      backdrop.classList.add('open');
      ham.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      ham.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    ham.addEventListener('click', function() {
      panel.classList.contains('open') ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    
    var closeBtn = panel.querySelector('.menu-close');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closeMenu();
    });

    // Magnetic menu toggle button micro-drag
    ham.addEventListener('mousemove', function(e) {
      if (ham.classList.contains('is-open')) return;
      var rect = ham.getBoundingClientRect();
      var x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      var y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      ham.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    });
    
    ham.addEventListener('mouseleave', function() {
      if (!ham.classList.contains('is-open')) {
        ham.style.transform = '';
      }
    });
  }

  // ─── 6. Trust Bar Flip ───
  function initTrustFlipper() {
    var flipper = document.getElementById('trustFlipper');
    if (!flipper) return;

    var reviews = [
      { text: '"The process was seamless and stress-free."', who: 'Sarah K. · Lilyfield' },
      { text: '"A team you can trust to get the job done smoothly, headache-free."', who: 'Robert W. · Drummoyne' },
      { text: '"Ante\'s craftsmanship was world class."', who: 'David M. · Mosman' },
      { text: '"Honest, reliable and left the site clean every single day."', who: 'Tom B. · Bondi' },
      { text: '"What could have been a very daunting task, was straightforward and enjoyable."', who: 'Catherine L. · Balmain' }
    ];
    var rIdx = 0;
    var quoteEl = document.getElementById('trustQuote');

    function updateReview(i) {
      if (!quoteEl) return;
      quoteEl.querySelector('.qt').textContent = reviews[i].text;
      var whoEl = quoteEl.querySelector('.who');
      if (whoEl) {
        whoEl.textContent = reviews[i].who;
        whoEl.style.display = reviews[i].who ? '' : 'none';
      }
    }

    setInterval(function() {
      if (flipper.classList.contains('flipped')) {
        flipper.classList.remove('flipped');
        rIdx = (rIdx + 1) % reviews.length;
        setTimeout(function() { updateReview(rIdx); }, 500);
      } else {
        flipper.classList.add('flipped');
      }
    }, 5000);
  }

})();
