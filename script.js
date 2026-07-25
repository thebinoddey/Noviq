(function(){
  "use strict";

  /* ---- Nav scroll state ---- */
  var nav = document.getElementById('nav');
  function onScroll(){
    if(window.scrollY > 8){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('menuIconOpen');
  var iconClose = document.getElementById('menuIconClose');

  menuBtn.addEventListener('click', function(){
    var isOpen = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    iconOpen.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
  });

  Array.prototype.forEach.call(mobileMenu.querySelectorAll('a'), function(link){
    link.addEventListener('click', function(){
      mobileMenu.classList.remove('open');
      iconOpen.style.display = 'block';
      iconClose.style.display = 'none';
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Scroll reveal ---- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  if('IntersectionObserver' in window && !reduceMotion){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---- Hero mockup enter animation ---- */
  var mockWindow = document.getElementById('mockWindow');
  if('IntersectionObserver' in window){
    var mockObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          mockObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    mockObserver.observe(mockWindow);
  } else {
    mockWindow.classList.add('in-view');
  }

  /* ---- Animated stat counters ---- */
  var counters = document.querySelectorAll('.proof-num');
  function animateCounter(el){
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduceMotion){
      el.textContent = target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts){
      if(start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
      else{ el.textContent = target + suffix; }
    }
    requestAnimationFrame(step);
  }

  if('IntersectionObserver' in window){
    var counterObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function(el){ counterObserver.observe(el); });
  } else {
    counters.forEach(function(el){
      el.textContent = (el.getAttribute('data-count') || '0') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---- Request Access CTA (demo behavior: smooth scroll + focus) ---- */
  var finalCtaBtn = document.getElementById('finalCtaBtn');
  finalCtaBtn.addEventListener('click', function(e){
    e.preventDefault();
    finalCtaBtn.textContent = 'You\u2019re on the list';
    finalCtaBtn.style.pointerEvents = 'none';
    finalCtaBtn.style.opacity = '0.85';
  });

})();