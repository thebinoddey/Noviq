(function(){
  "use strict";

  var form = document.getElementById('regForm');
  var pages = Array.prototype.slice.call(form.querySelectorAll('.reg-page'));
  var stepItems = Array.prototype.slice.call(document.querySelectorAll('.step-item'));
  var backBtn = document.getElementById('backBtn');
  var nextBtn = document.getElementById('nextBtn');
  var submitBtn = document.getElementById('submitBtn');
  var actions = document.querySelector('.reg-actions');

  var current = 1; // 1, 2, 3, or 'success'

  /* ---- Populate graduation year select ---- */
  var gradSelect = document.getElementById('gradYear');
  var thisYear = new Date().getFullYear();
  for (var y = thisYear + 5; y >= thisYear - 10; y--){
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    gradSelect.appendChild(opt);
  }

  /* ---- Helpers ---- */
  function getPage(n){
    return pages.filter(function(p){ return p.getAttribute('data-page') == n; })[0];
  }

  function showPage(n){
    pages.forEach(function(p){ p.classList.remove('active'); });
    var target = getPage(n);
    if(target) target.classList.add('active');

    stepItems.forEach(function(item){
      var s = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('active','done');
      if(n === 'success'){
        item.classList.add('done');
      } else if(s < n){
        item.classList.add('done');
      } else if(s === n){
        item.classList.add('active');
      }
    });

    if(n === 'success'){
      actions.style.display = 'none';
    } else {
      actions.style.display = 'flex';
      backBtn.classList.toggle('show', n > 1);
      nextBtn.style.display = (n < 3) ? 'inline-flex' : 'none';
      submitBtn.style.display = (n === 3) ? 'inline-flex' : 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function urlLooksValid(v){
    if(!v) return true; // optional field
    try{ var u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch(e){ return false; }
  }

  function phoneLooksValid(v){
    var digits = v.replace(/[^0-9]/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  function setInvalid(field, invalid){
    field.classList.toggle('invalid', invalid);
  }

  function validatePage(n){
    var page = getPage(n);
    var valid = true;

    if(n === 1){
      [
        ['fullName', function(v){ return v.trim().length > 0; }],
        ['email', function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }],
        ['phone', phoneLooksValid],
        ['gradYear', function(v){ return v !== ''; }],
        ['collegeName', function(v){ return v.trim().length > 0; }],
        ['linkedin', urlLooksValid],
        ['github', urlLooksValid]
      ].forEach(function(pair){
        var el = document.getElementById(pair[0]);
        var field = el.closest('.field');
        var ok = pair[1](el.value);
        setInvalid(field, !ok);
        if(!ok) valid = false;
      });
    }

    if(n === 2){
      var checked = page.querySelector('input[name="level"]:checked');
      var errorEl = page.querySelector('.level-error');
      if(!checked){
        errorEl.style.display = 'block';
        valid = false;
      } else {
        errorEl.style.display = 'none';
      }
    }

    if(n === 3){
      var skillsHave = document.getElementById('skillsHave');
      var domain = document.getElementById('domain');

      var haveOk = skillsHave.value.trim().length > 0;
      setInvalid(skillsHave.closest('.field'), !haveOk);
      if(!haveOk) valid = false;

      var domainOk = domain.value !== '';
      setInvalid(domain.closest('.field'), !domainOk);
      if(!domainOk) valid = false;
    }

    return valid;
  }

  /* ---- Skill chips preview ---- */
  function renderChips(textareaId, chipRowId){
    var ta = document.getElementById(textareaId);
    var row = document.getElementById(chipRowId);
    function update(){
      var items = ta.value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
      row.innerHTML = '';
      items.forEach(function(item){
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = item;
        row.appendChild(chip);
      });
    }
    ta.addEventListener('input', update);
    update();
  }
  renderChips('skillsHave', 'skillsHaveChips');
  renderChips('skillsWant', 'skillsWantChips');

  /* ---- Nav buttons ---- */
  nextBtn.addEventListener('click', function(){
    if(!validatePage(current)) return;
    current = current + 1;
    showPage(current);
  });

  backBtn.addEventListener('click', function(){
    if(current === 1) return;
    current = current - 1;
    showPage(current);
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validatePage(3)) return;

    // Demo behavior: no backend, just show success state.
    var data = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      gradYear: document.getElementById('gradYear').value,
      collegeName: document.getElementById('collegeName').value.trim(),
      linkedin: document.getElementById('linkedin').value.trim(),
      github: document.getElementById('github').value.trim(),
      level: (form.querySelector('input[name="level"]:checked') || {}).value,
      skillsHave: document.getElementById('skillsHave').value.trim(),
      skillsWant: document.getElementById('skillsWant').value.trim(),
      domain: document.getElementById('domain').value
    };
    console.log('Noviq registration (demo):', data);

    current = 'success';
    showPage(current);
  });

  /* ---- Clear invalid state as user types ---- */
  form.querySelectorAll('input, select, textarea').forEach(function(el){
    el.addEventListener('input', function(){
      var field = el.closest('.field');
      if(field) field.classList.remove('invalid');
    });
    el.addEventListener('change', function(){
      var field = el.closest('.field');
      if(field) field.classList.remove('invalid');
      var levelError = form.querySelector('.level-error');
      if(el.name === 'level' && levelError) levelError.style.display = 'none';
    });
  });

  showPage(current);
})();