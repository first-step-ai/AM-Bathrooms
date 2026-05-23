(function(){
  'use strict';

  // Bail out for reduced motion — removing .am shows everything normally
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    document.documentElement.classList.remove('am');
    return;
  }

  // ─── Page Transition ───
  var overlay=document.querySelector('.page-transition');
  if(overlay){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ overlay.classList.add('out'); });
    });
  }

  // Exit transition on internal links
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]');
    if(!a) return;
    var href=a.getAttribute('href');
    if(!href||href.charAt(0)==='#'||/^(https?|mailto|tel):/.test(href)) return;
    if(!overlay) return;
    e.preventDefault();
    overlay.classList.remove('out');
    setTimeout(function(){ window.location.href=href; },400);
  });

  // ─── Stagger Delay Assignment ───
  var config=[
    // Nav
    {sel:'.nav',delay:0},
    // Homepage hero
    {sel:'.hero h1 span',stagger:100},
    {sel:'.hero .sub',delay:280},
    {sel:'.hero .cta-row',delay:380},
    {sel:'.hero-bg',delay:0},
    // Homepage sections
    {sel:'.trust',delay:0},
    {sel:'.how-header > *',stagger:80},
    {sel:'.step',stagger:100},
    {sel:'.featured-header > *',stagger:80},
    {sel:'.featured .project-card',stagger:120},
    {sel:'.featured-link',delay:0},
    {sel:'.why-header > *',stagger:80},
    {sel:'.pillar',stagger:120},
    // Sub-page headers
    {sel:'.page-head .section-eyebrow',delay:0},
    {sel:'.page-head h1',delay:80},
    {sel:'.page-head .sub',delay:160},
    // About
    {sel:'.founder-photo',delay:0},
    {sel:'.founder-text > *',stagger:60},
    {sel:'.cred-col',stagger:150},
    {sel:'.why-do > *',stagger:80},
    {sel:'.stat',stagger:120},
    // Projects
    {sel:'.filter-bar',delay:0},
    {sel:'.projects .project-card',stagger:80},
    // Services
    {sel:'.service-card',stagger:140},
    {sel:'.why-band > *',stagger:80},
    // Awards
    {sel:'.tally-item',stagger:100},
    {sel:'.award-row',stagger:80},
    // Reviews
    {sel:'.google-strip > *',stagger:80},
    {sel:'.review-card',stagger:60},
    // Contact
    {sel:'.form-container',delay:0},
    {sel:'.expect-header > *',stagger:80},
    {sel:'.expect-step',stagger:120},
    {sel:'.area-note > *',stagger:80},
    // Shared sections
    {sel:'.cta-inner > *',stagger:80},
    {sel:'.footer-grid > *',stagger:60},
    {sel:'.footer-bottom',delay:0}
  ];

  config.forEach(function(c){
    var els=document.querySelectorAll(c.sel);
    els.forEach(function(el,i){
      var d=c.stagger?i*c.stagger:(c.delay||0);
      el.style.setProperty('--d',d+'ms');
    });
  });

  // ─── Intersection Observer ───
  var allSelectors=config.map(function(c){return c.sel;}).join(',')
    +', .founder-photo';

  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});

  document.querySelectorAll(allSelectors).forEach(function(el){
    observer.observe(el);
  });

  // ─── Parallax ───
  var parallaxEls=[];
  var founderPhoto=document.querySelector('.founder-photo');
  if(founderPhoto) parallaxEls.push({el:founderPhoto,rate:0.08});

  // Decorative elements: gentler parallax
  document.querySelectorAll('.step .num, .pillar .quote-mark, .expect-step .num')
    .forEach(function(el){ parallaxEls.push({el:el,rate:0.06,decorative:true}); });

  if(parallaxEls.length){
    var ticking=false;
    window.addEventListener('scroll',function(){
      if(ticking) return;
      ticking=true;
      requestAnimationFrame(function(){
        var wh=window.innerHeight;
        parallaxEls.forEach(function(p){
          var rect=p.el.getBoundingClientRect();
          var center=rect.top+rect.height/2;
          var progress=(center/wh)-0.5;
          var offset=Math.round(progress*80*p.rate);
          if(p.decorative){
            p.el.style.transform='translateY('+offset+'px)';
          }else if(p.el.classList.contains('is-visible')){
            p.el.style.setProperty('--py',offset+'px');
          }
        });
        ticking=false;
      });
    },{passive:true});
  }

  // ─── Trust Bar Flip ───
  var flipper=document.getElementById('trustFlipper');
  if(flipper){
    var reviews=[
      {text:'"We were initially nervous about a full bathroom renovation, but AM Bathrooms made the entire process feel effortless. Every detail was executed to a first-class standard."',who:'Terry · Rozelle'},
      {text:'"From design through to construction, the process was seamless, with clear communication and exceptional project management throughout. The result has completely transformed our home."',who:'Biana · Roseville'},
      {text:'"From the very first meeting, Jenny understood exactly what we wanted and guided us through every step. The result is a beautifully designed home that feels cohesive, personal and truly special."',who:'Tanya · Annandale'}
    ];
    var rIdx=0;
    var quoteEl=document.getElementById('trustQuote');

    function updateReview(i){
      if(!quoteEl) return;
      quoteEl.querySelector('.qt').textContent=reviews[i].text;
      quoteEl.querySelector('.who').textContent=reviews[i].who;
    }

    setInterval(function(){
      if(flipper.classList.contains('flipped')){
        flipper.classList.remove('flipped');
        rIdx=(rIdx+1)%reviews.length;
        setTimeout(function(){updateReview(rIdx);},500);
      }else{
        flipper.classList.add('flipped');
      }
    },5000);
  }

  // ─── Slide-in Menu Panel ───
  var ham=document.querySelector('.hamburger');
  var nav=document.querySelector('.nav');

  if(ham&&nav){
    // Backdrop
    var backdrop=document.createElement('div');
    backdrop.className='menu-backdrop';
    document.body.appendChild(backdrop);

    // Panel
    var panel=document.createElement('div');
    panel.className='menu-panel';
    panel.innerHTML=
      '<button class="menu-close" aria-label="Close menu">'+
        '<svg width="18" height="18" viewBox="0 0 18 18"><line x1="1" y1="1" x2="17" y2="17"/><line x1="17" y1="1" x2="1" y2="17"/></svg>'+
      '</button>'+
      '<nav class="menu-nav">'+
        '<a href="index.html">Home</a>'+
        '<a href="projects.html">Projects</a>'+
        '<a href="about.html">About</a>'+
        '<a href="services.html">Services</a>'+
        '<a href="awards.html">Awards</a>'+
        '<a href="reviews.html">Reviews</a>'+
        '<a href="contact.html">Contact</a>'+
      '</nav>'+
      '<div class="menu-divider"></div>'+
      '<div class="menu-contact">'+
        '<a href="mailto:jenny@ambathrooms.com.au">jenny@ambathrooms.com.au</a>'+
        '<a href="tel:+61291814776">(02) 9181 4776</a>'+
        '<span>Drummoyne 2047</span>'+
      '</div>';
    document.body.appendChild(panel);

    // Mark current page
    var page=window.location.pathname.split('/').pop()||'index.html';
    panel.querySelectorAll('.menu-nav a').forEach(function(a){
      if(a.getAttribute('href')===page) a.classList.add('active');
    });

    function openMenu(){
      panel.classList.add('open');
      backdrop.classList.add('open');
      ham.classList.add('is-open');
      document.body.style.overflow='hidden';
    }
    function closeMenu(){
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      ham.classList.remove('is-open');
      document.body.style.overflow='';
    }

    ham.addEventListener('click',function(){
      panel.classList.contains('open')?closeMenu():openMenu();
    });
    backdrop.addEventListener('click',closeMenu);
    panel.querySelector('.menu-close').addEventListener('click',closeMenu);

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&panel.classList.contains('open')) closeMenu();
    });

    // Magnetic hamburger (only when menu closed)
    ham.addEventListener('mousemove',function(e){
      if(ham.classList.contains('is-open')) return;
      var r=ham.getBoundingClientRect();
      var x=(e.clientX-r.left-r.width/2)*0.2;
      var y=(e.clientY-r.top-r.height/2)*0.2;
      ham.style.transform='translate('+x+'px,'+y+'px)';
    });
    ham.addEventListener('mouseleave',function(){
      if(!ham.classList.contains('is-open')) ham.style.transform='';
    });
  }

})();
