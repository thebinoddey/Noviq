(function(){
  "use strict";

  /* ==========================================================
     SUPABASE CONFIG
     Replace these two values with your project's details.
     Project Settings -> API -> Project URL / anon public key.
     The anon key is safe to expose in client-side code as long
     as Row Level Security (RLS) is enabled on the table with a
     policy that only allows INSERT for anon/public role.

     ========================================================== */

    
  var SUPABASE_URL = 'https://ppfohfoiwcbzymiadmhe.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_SidEwYjBsYS1pMmqbuIj8A_yiYoCorX';

  var supabaseClient = null;
  if (window.supabase && SUPABASE_URL.indexOf('YOUR_') !== 0 && SUPABASE_ANON_KEY.indexOf('YOUR_') !== 0) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  /* ---- Nav scroll state (shared with main site) ---- */
  var nav = document.getElementById('nav');
  function onScroll(){
    if (!nav) return;
    if (window.scrollY > 8) { nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('menuIconOpen');
  var iconClose = document.getElementById('menuIconClose');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function(){
      var isOpen = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      if (iconOpen) iconOpen.style.display = isOpen ? 'none' : 'block';
      if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';
    });
  }

  /* ---- Form handling ---- */
  var form = document.getElementById('waitlistForm');
  var panel = document.getElementById('wlPanel');
  var successBox = document.getElementById('wlSuccess');
  var statusBox = document.getElementById('wlStatus');
  var submitBtn = document.getElementById('wlSubmitBtn');

  var fields = {
    name: document.getElementById('wlName'),
    email: document.getElementById('wlEmail'),
    phone: document.getElementById('wlPhone'),
    graduation_year: document.getElementById('wlGradYear'),
    college: document.getElementById('wlCollege'),
    linkedin: document.getElementById('wlLinkedin'),
    github: document.getElementById('wlGithub'),
    challenge: document.getElementById('wlChallenge')
  };

  function setFieldError(fieldEl, message){
    var wrap = fieldEl.closest('.wl-field');
    if (!wrap) return;
    wrap.classList.add('has-error');
    fieldEl.classList.add('invalid');
    var errEl = wrap.querySelector('.wl-error-text');
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(fieldEl){
    var wrap = fieldEl.closest('.wl-field');
    if (!wrap) return;
    wrap.classList.remove('has-error');
    fieldEl.classList.remove('invalid');
  }

  function clearAllErrors(){
    Object.keys(fields).forEach(function(key){
      var el = fields[key];
      if (el) clearFieldError(el);
    });
  }

  function isValidEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidUrl(value){
    if (!value) return true;
    try {
      var u = new URL(value.indexOf('http') === 0 ? value : 'https://' + value);
      return !!u.hostname;
    } catch (e) {
      return false;
    }
  }

  function showStatus(message, type){
    statusBox.textContent = message;
    statusBox.className = 'wl-status show ' + type;
  }

  function hideStatus(){
    statusBox.className = 'wl-status';
    statusBox.textContent = '';
  }

  function validate(){
    var valid = true;
    clearAllErrors();

    var name = fields.name.value.trim();
    if (!name) {
      setFieldError(fields.name, 'Please enter your full name.');
      valid = false;
    }

    var email = fields.email.value.trim();
    if (email && !isValidEmail(email)) {
      setFieldError(fields.email, 'Enter a valid email address.');
      valid = false;
    }

    var gradYear = fields.graduation_year.value.trim();
    if (gradYear) {
      var yearNum = parseInt(gradYear, 10);
      var currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < currentYear - 10 || yearNum > currentYear + 10) {
        setFieldError(fields.graduation_year, 'Enter a realistic graduation year.');
        valid = false;
      }
    }

    var linkedin = fields.linkedin.value.trim();
    if (linkedin && !isValidUrl(linkedin)) {
      setFieldError(fields.linkedin, 'Enter a valid LinkedIn URL.');
      valid = false;
    }

    var github = fields.github.value.trim();
    if (github && !isValidUrl(github)) {
      setFieldError(fields.github, 'Enter a valid GitHub URL.');
      valid = false;
    }

    return valid;
  }

  function collectPayload(){
    var gradYearRaw = fields.graduation_year.value.trim();
    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim() || null,
      phone: fields.phone.value.trim() || null,
      graduation_year: gradYearRaw ? parseInt(gradYearRaw, 10) : null,
      college: fields.college.value.trim() || null,
      linkedin: fields.linkedin.value.trim() || null,
      github: fields.github.value.trim() || null,
      challenge: fields.challenge.value.trim() || null,
      created_at: new Date().toISOString()
    };
  }

  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      hideStatus();

      if (!validate()) {
        showStatus('Please fix the highlighted fields above.', 'err');
        return;
      }

      if (!supabaseClient) {
        showStatus('Form is not connected yet — add your Supabase URL and anon key in waitlist.js.', 'err');
        return;
      }

      var payload = collectPayload();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      supabaseClient
        .from('waitlist')
        .insert([payload])
        .then(function(res){
          if (res.error) {
            console.error('Supabase insert error:', res.error);
            showStatus(res.error.message || 'Something went wrong. Please try again.', 'err');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Join the Waitlist';
            return;
          }
          panel.style.display = 'none';
          successBox.classList.add('show');
        })
        .catch(function(err){
          console.error('Supabase request failed:', err);
          showStatus('Network error — please try again.', 'err');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Join the Waitlist';
        });
    });

    /* Clear individual field errors as the user types */
    Object.keys(fields).forEach(function(key){
      var el = fields[key];
      if (!el) return;
      el.addEventListener('input', function(){ clearFieldError(el); });
    });
  }

})();