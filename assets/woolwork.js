/* WOOLWORK v1.3.0 progressive enhancement.
   Everything renders without this file; it only adds motion and physics. */
(function(){
  'use strict';
  document.documentElement.classList.add('ww-js');
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Place, then stitch: reveal choreography ----
     The running stitch on a .stitch element is a real drawn thread that traces
     the element's exact box: equal inset on every side, following its own four
     corner radii. It is the resting border too, so what draws on is exactly
     what remains (the CSS dashed border is only the no-JS fallback). On reveal
     the thread sews on in place from the top-left corner; a ResizeObserver
     keeps the path fitted to the box. Visual only. */
  var NS = 'http://www.w3.org/2000/svg';
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function(entries){
    entries.forEach(function(en){ resizeThread(en.target); });
  }) : null;

  /* The dashed-border path for the element's current size: inset 8px, stroke
     centerline half a stroke further in, each corner its own measured radius. */
  function stitchGeom(el){
    var r = el.getBoundingClientRect();
    var inset = 8, sw = 2.5, edge = sw / 2;
    var w = Math.max(0, r.width - inset * 2), h = Math.max(0, r.height - inset * 2);
    var cs = getComputedStyle(el);
    function corner(prop){
      var v = cs[prop].split(' ');
      var x = parseFloat(v[0]) || 0;
      var y = v.length > 1 ? (parseFloat(v[1]) || 0) : x;
      return {x:Math.max(0, Math.min(x - edge, w / 2 - edge)),
              y:Math.max(0, Math.min(y - edge, h / 2 - edge))};
    }
    var tl = corner('borderTopLeftRadius'), tr = corner('borderTopRightRadius');
    var br = corner('borderBottomRightRadius'), bl = corner('borderBottomLeftRadius');
    var d = 'M' + (edge + tl.x) + ' ' + edge +
      'H' + (w - edge - tr.x) +
      'A' + tr.x + ' ' + tr.y + ' 0 0 1 ' + (w - edge) + ' ' + (edge + tr.y) +
      'V' + (h - edge - br.y) +
      'A' + br.x + ' ' + br.y + ' 0 0 1 ' + (w - edge - br.x) + ' ' + (h - edge) +
      'H' + (edge + bl.x) +
      'A' + bl.x + ' ' + bl.y + ' 0 0 1 ' + edge + ' ' + (h - edge - bl.y) +
      'V' + (edge + tl.y) +
      'A' + tl.x + ' ' + tl.y + ' 0 0 1 ' + (edge + tl.x) + ' ' + edge + 'Z';
    return {d:d, w:w, h:h};
  }

  function dashPath(guide, start, end){
    var steps = Math.max(1, Math.ceil((end - start) / 1.25));
    var first = guide.getPointAtLength(start);
    var d = 'M' + first.x + ' ' + first.y;
    for(var i = 1; i <= steps; i++){
      var point = guide.getPointAtLength(start + (end - start) * i / steps);
      d += 'L' + point.x + ' ' + point.y;
    }
    return d;
  }

  /* Build the resting stitch as its actual individual dashes. These same
     nodes appear one by one during sewing and remain afterward, so animation
     and rest can never differ through mask compositing or a path swap. */
  function buildDashes(rec, g){
    rec.svg.setAttribute('width', g.w); rec.svg.setAttribute('height', g.h);
    rec.svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    rec.guide.setAttribute('d', g.d);
    var total = rec.guide.getTotalLength();
    var count = Math.max(1, Math.ceil(total / 11.1));
    while(rec.dashes.length < count){
      var added = document.createElementNS(NS,'path');
      added.setAttribute('class','stitch-dash');
      if(rec.phase === 'armed' || rec.phase === 'drawing') added.style.opacity = '0';
      rec.group.appendChild(added); rec.dashes.push(added);
    }
    while(rec.dashes.length > count) rec.dashes.pop().remove();
    rec.dashes.forEach(function(dash, i){
      var start = i * 11.1;
      dash.setAttribute('d', dashPath(rec.guide, start, Math.min(start + 6.5, total)));
    });
  }

  function settleThread(rec){
    clearTimeout(rec.timer); rec.phase = 'settled';
    rec.dashes.forEach(function(dash){ dash.style.transition = 'none'; dash.style.opacity = '.85'; });
  }

  /* Attach a persistent thread SVG to a .stitch element (idempotent). */
  function ensureThread(el){
    if(el._wwThread) return el._wwThread;
    var g = stitchGeom(el);
    var svg = document.createElementNS(NS,'svg');
    svg.setAttribute('class','stitch-thread');
    svg.setAttribute('width', g.w); svg.setAttribute('height', g.h);
    svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    var guide = document.createElementNS(NS,'path'); guide.setAttribute('class','stitch-guide');
    var group = document.createElementNS(NS,'g'); group.setAttribute('class','stitch-dashes');
    svg.appendChild(guide); svg.appendChild(group);
    var rec = {svg:svg, guide:guide, group:group, dashes:[], phase:'settled', timer:0};
    buildDashes(rec, g);
    el.appendChild(svg);
    el.classList.add('threaded');
    el._wwThread = rec;
    if(ro) ro.observe(el);
    return el._wwThread;
  }

  function resizeThread(el){
    var rec = el._wwThread; if(!rec) return;
    var g = stitchGeom(el);
    var phase = rec.phase;
    buildDashes(rec, g);
    if(phase === 'armed'){
      rec.dashes.forEach(function(dash){ dash.style.opacity = '0'; });
    }else if(phase === 'settled'){
      settleThread(rec);
    }
  }

  /* Undrawn state for a .sew element awaiting reveal. */
  function armThread(el){
    var rec = ensureThread(el);
    if(rm){ settleThread(rec); return; }
    clearTimeout(rec.timer); rec.phase = 'armed';
    rec.dashes.forEach(function(dash){ dash.style.transition = 'none'; dash.style.opacity = '0'; });
  }

  /* Sew the exact resting dashes on in order. A one-step opacity change means
     every visible dash arrives at its final color and weight immediately. */
  function drawThread(el){
    var rec = el._wwThread; if(!rec || rec.phase !== 'armed') return;
    rec.phase = 'drawing';
    var step = rec.dashes.length > 1 ? 1600 / (rec.dashes.length - 1) : 0;
    rec.dashes.forEach(function(dash, i){
      dash.style.transition = 'opacity 1ms step-end ' + (650 + i * step) + 'ms';
      dash.style.opacity = '.85';
    });
    rec.timer = setTimeout(function(){ settleThread(rec); }, 2350);
  }

  var io;
  function armReveal(el){
    if(rm){
      if(el.classList.contains('stitch')) armThread(el);
      el.classList.add('on'); return;
    }
    el.classList.remove('on');
    io.observe(el);
  }
  /* The observation root extends far above the viewport: an element is
     revealed when it approaches from below OR is already anywhere above the
     viewport. Anchor navigation, an End-key jump, or a scrollbar drag can
     move past content without it ever crossing the viewport, and without
     this it would stay invisible until the user happened to scroll back
     over it. With the extended root, everything jumped past reveals
     immediately, while content still below the viewport keeps the normal
     arrival choreography. */
  io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      /* Build the persistent dash nodes only when this card joins the viewing
         path. Hidden cards below the viewport carry no unused SVG subtree. */
      if(el.classList.contains('stitch')) armThread(el);
      /* Force the browser to paint the hidden state before flipping to
         visible, so the reveal transition has a start frame to animate from. */
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        el.classList.add('on');
        if(el.classList.contains('stitch')) drawThread(el);
      }); });
    });
  }, {threshold:.12, rootMargin:'1000000px 0px 0px 0px'});
  /* Static stitches draw at once. Sewn cards build their persistent thread
     when the observer reaches them, before their two-frame reveal starts. */
  document.querySelectorAll('.stitch:not(.sew)').forEach(ensureThread);
  document.querySelectorAll('.sew').forEach(armReveal);
  /* Back-forward cache restores the page without re-running this script, so a
     page reached via back/forward can arrive with reveals already resolved.
     Re-arm them on that path. */
  window.addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    document.querySelectorAll('.sew').forEach(armReveal);
  });
  /* Elements mounted after load (a framework, htmx, or plain DOM work) get the
     same treatment, keeping the whole kit live for late content. */
  if('MutationObserver' in window){
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        for(var i = 0; i < m.addedNodes.length; i++){
          var n = m.addedNodes[i];
          if(n.nodeType !== 1) continue;
          if(n.classList.contains('sew')) armReveal(n);
          else if(n.classList.contains('stitch')) ensureThread(n);
          if(n.matches && n.matches('select.pocket')) enhancePaperSelect(n);
          if(n.matches && n.matches('dialog.pinned')) watchPinnedDialog(n);
          if(n.matches && n.matches('a[href]')) syncNightLink(n, document.documentElement.getAttribute('data-theme') === 'night');
          if(n.matches && n.matches('[data-woolwork-theme-toggle]')) syncNightControl(n, document.documentElement.getAttribute('data-theme') === 'night');
          if(n.querySelectorAll){
            n.querySelectorAll('.sew').forEach(armReveal);
            n.querySelectorAll('.stitch:not(.sew)').forEach(ensureThread);
            n.querySelectorAll('select.pocket').forEach(enhancePaperSelect);
            n.querySelectorAll('dialog.pinned').forEach(watchPinnedDialog);
            n.querySelectorAll('a[href]').forEach(function(link){ syncNightLink(link, document.documentElement.getAttribute('data-theme') === 'night'); });
            n.querySelectorAll('[data-woolwork-theme-toggle]').forEach(function(control){ syncNightControl(control, document.documentElement.getAttribute('data-theme') === 'night'); });
          }
        }
      });
    }).observe(document.documentElement, {childList:true, subtree:true});
  }

  /* ---- Sew-check press phases: stroke one on press, stroke two on release ---- */
  document.addEventListener('pointerdown', function(e){
    var el = e.target.closest ? e.target.closest('.sew-check') : null;
    if(el) el.classList.add('pre');
  }, {passive:true});
  document.addEventListener('pointerup', function(){
    document.querySelectorAll('.sew-check.pre').forEach(function(el){ el.classList.remove('pre'); });
  }, {passive:true});

  /* ---- Paper selects: the native select remains the form value and no-JS
     fallback; the visible control is a sheet tucked into a felt slot whose
     choices unfold as alternating concertina folds. ---- */
  var paperSelectSeq = 0;
  function enhancePaperSelect(select){
    if(select.dataset.wwPaperSelect) return;
    select.dataset.wwPaperSelect = 'true';

    var slot = document.createElement('div');
    slot.className = 'select-slot'; slot.dataset.open = 'false';
    select.parentNode.insertBefore(slot, select); slot.appendChild(select);

    var base = select.id || ('ww-paper-select-' + (++paperSelectSeq));
    var listId = base + '-paper-options';
    var trigger = document.createElement('button');
    trigger.type = 'button'; trigger.className = 'paper-choice';
    trigger.setAttribute('role','combobox'); trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false'); trigger.setAttribute('aria-controls',listId);
    var value = document.createElement('span'); value.className = 'paper-choice-value'; value.id = base + '-paper-value';
    trigger.appendChild(value);

    var folds = document.createElement('div');
    folds.className = 'paper-folds'; folds.id = listId; folds.setAttribute('role','listbox');
    var paperOptions = [];
    Array.from(select.options).forEach(function(option, i){
      var paper = document.createElement('button');
      paper.className = 'paper-option'; paper.id = base + '-paper-option-' + i;
      paper.setAttribute('role','option');
      var paperLabel = document.createElement('span'); paperLabel.className = 'paper-option-label';
      paperLabel.textContent = option.textContent; paper.appendChild(paperLabel);
      paper.dataset.value = option.value; paper.style.setProperty('--fold', String(i + 1));
      paper.style.setProperty('--fold-delay', ((i + 1) * 45) + 'ms');
      paper.style.setProperty('--fold-angle', i % 2 ? '-82deg' : '82deg');
      paper.disabled = option.disabled; paper.setAttribute('aria-disabled', option.disabled ? 'true' : 'false');
      paper.type = 'button';
      folds.appendChild(paper); paperOptions.push(paper);
    });
    slot.insertBefore(trigger, select); slot.appendChild(folds);
    select.tabIndex = -1; select.setAttribute('aria-hidden','true');

    var label = select.id ? document.querySelector('label[for="' + CSS.escape(select.id) + '"]') : select.closest('label');
    if(label){
      if(!label.id) label.id = base + '-label';
      trigger.setAttribute('aria-labelledby', label.id + ' ' + value.id);
      label.addEventListener('click', function(e){ e.preventDefault(); trigger.focus(); });
    }

    var active = Math.max(0, select.selectedIndex);
    function sync(){
      active = Math.max(0, select.selectedIndex);
      value.textContent = select.options[active] ? select.options[active].textContent : '';
      paperOptions.forEach(function(paper, i){
        paper.setAttribute('aria-selected', i === active ? 'true' : 'false');
        paper.dataset.active = i === active ? 'true' : 'false';
      });
      trigger.setAttribute('aria-activedescendant', paperOptions[active] ? paperOptions[active].id : '');
      trigger.disabled = select.disabled;
    }
    function setActive(i, direction){
      i = Math.max(0, Math.min(paperOptions.length - 1, i));
      direction = direction || 1;
      while(paperOptions[i] && paperOptions[i].disabled){
        i += direction;
        if(i < 0 || i >= paperOptions.length) return;
      }
      active = i;
      paperOptions.forEach(function(paper, n){ paper.dataset.active = n === active ? 'true' : 'false'; });
      if(paperOptions[active]) trigger.setAttribute('aria-activedescendant', paperOptions[active].id);
    }
    function setOpen(open){
      if(trigger.disabled) open = false;
      if(!open && slot.dataset.open !== 'true'){
        trigger.setAttribute('aria-expanded','false');
        return;
      }
      if(open){
        slot.dataset.open = 'true';
      }else{
        /* Edge-on paper reads as transparent bars, not a physical reverse
           fold. Hide the panel immediately and reset its folds offscreen. */
        slot.dataset.reset = 'true'; slot.dataset.open = 'false';
        void folds.offsetWidth;
        delete slot.dataset.reset;
      }
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) setActive(Math.max(0, select.selectedIndex));
    }
    function choose(i){
      if(!select.options[i] || select.options[i].disabled) return;
      select.selectedIndex = i; sync(); setOpen(false);
      select.dispatchEvent(new Event('change',{bubbles:true})); trigger.focus();
    }

    trigger.addEventListener('click', function(){ setOpen(slot.dataset.open !== 'true'); });
    trigger.addEventListener('keydown', function(e){
      var open = slot.dataset.open === 'true';
      if(e.key === 'Escape' && open){ e.preventDefault(); setOpen(false); return; }
      if(e.key === 'Tab'){ setOpen(false); return; }
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        e.preventDefault(); if(!open){ setOpen(true); return; }
        setActive(active + (e.key === 'ArrowDown' ? 1 : -1), e.key === 'ArrowDown' ? 1 : -1); return;
      }
      if(e.key === 'Home' && open){ e.preventDefault(); setActive(0, 1); return; }
      if(e.key === 'End' && open){ e.preventDefault(); setActive(paperOptions.length - 1, -1); return; }
      if((e.key === 'Enter' || e.key === ' ') && open){ e.preventDefault(); choose(active); }
    });
    folds.addEventListener('click', function(e){
      var paper = e.target.closest ? e.target.closest('.paper-option') : null;
      if(paper) choose(paperOptions.indexOf(paper));
    });
    folds.addEventListener('pointermove', function(e){
      var paper = e.target.closest ? e.target.closest('.paper-option') : null;
      if(paper) setActive(paperOptions.indexOf(paper));
    });
    document.addEventListener('pointerdown', function(e){ if(!slot.contains(e.target)) setOpen(false); });
    select.addEventListener('change', sync);
    if(select.form) select.form.addEventListener('reset', function(){ setTimeout(sync); });
    sync();
  }
  document.querySelectorAll('select.pocket').forEach(enhancePaperSelect);

  /* ---- Tabs: one selected folder tab, its panel shown, siblings hidden ----
     Markup: .tabs > button[aria-controls=panelId]; panels are .tab-panel.
     Panels sync to the selected tab at init, so markup can ship every panel
     visible and no-JS readers still get all the content. */
  function syncTabs(group){
    group.querySelectorAll('button[aria-controls]').forEach(function(b){
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      var selected = b.getAttribute('aria-selected') === 'true';
      b.tabIndex = selected ? 0 : -1;
      if(panel) panel.hidden = !selected;
    });
  }
  document.querySelectorAll('.tabs').forEach(syncTabs);
  document.addEventListener('click', function(e){
    var tab = e.target.closest ? e.target.closest('.tabs>button') : null;
    if(!tab || !tab.getAttribute('aria-controls')) return;
    var group = tab.parentElement;
    group.querySelectorAll('button').forEach(function(b){
      var sel = b === tab;
      b.setAttribute('aria-selected', sel ? 'true' : 'false');
      b.tabIndex = sel ? 0 : -1;
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if(panel) panel.hidden = !sel;
    });
  });
  document.addEventListener('keydown', function(e){
    var tab = e.target.closest ? e.target.closest('.tabs>button[role="tab"]') : null;
    if(!tab || ['ArrowLeft','ArrowRight','Home','End'].indexOf(e.key) < 0) return;
    var tabs = Array.from(tab.parentElement.querySelectorAll('button[role="tab"]'));
    var i = tabs.indexOf(tab), next = i;
    if(e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if(e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if(e.key === 'Home') next = 0;
    if(e.key === 'End') next = tabs.length - 1;
    e.preventDefault(); tabs[next].focus(); tabs[next].click();
  });

  /* ---- Buttonhole toggles and hamburger strands ----
     Delegated like everything else, so toggles added after load are live too. */
  document.addEventListener('click', function(e){
    if(!e.target.closest) return;
    var t = e.target.closest('.buttonhole');
    if(t){
      t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      return;
    }
    var b = e.target.closest('.strands');
    if(b){
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  });

  /* ---- Fabric flap dropdowns: close on outside pointerdown ---- */
  document.addEventListener('pointerdown', function(e){
    document.querySelectorAll('details.flap[open]').forEach(function(d){
      if(!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  /* ---- Pinned notes: pressing the board around a note unpins it ----
     A click on the backdrop (or the dialog's own padding ring outside its
     box) targets the dialog element itself; anything inside targets content.
     Only truly-outside clicks close, so the padding stays safe to press. */
  document.addEventListener('click', function(e){
    var d = e.target;
    if(!d || !d.tagName || d.tagName !== 'DIALOG' || !d.classList.contains('pinned') || !d.open) return;
    var r = d.getBoundingClientRect();
    if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });

  /* ---- Pinned notes: lock the board behind an open note ----
     A CSS :has() rule (body:has(dialog.pinned[open])) already does this
     declaratively; this watcher is a reinforcement for browsers without
     :has() support, keyed off the same [open] attribute regardless of how a
     project calls showModal()/close(). overflow:hidden alone (no
     position:fixed scroll-jacking) preserves the exact prior scroll offset,
     since hiding overflow does not reset scrollTop; the permanent
     scrollbar-gutter:stable in the kit CSS keeps the viewport width (and so
     every fixed-positioned sibling's offset) constant whether or not the
     lock is active. */
  var wwLockCount = 0;
  function wwApplyScrollLock(){
    if(wwLockCount > 0) document.body.classList.add('ww-scroll-lock');
    else document.body.classList.remove('ww-scroll-lock');
  }
  function watchPinnedDialog(d){
    if(d._wwLockWatched) return; d._wwLockWatched = true;
    if(d.open){ wwLockCount++; wwApplyScrollLock(); }
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        if(m.attributeName !== 'open') return;
        wwLockCount = Math.max(0, wwLockCount + (d.open ? 1 : -1));
        wwApplyScrollLock();
      });
    }).observe(d, {attributes:true, attributeFilter:['open']});
  }
  document.querySelectorAll('dialog.pinned').forEach(watchPinnedDialog);

  /* ---- Toast: notes tacked to a corner tray, dismissable by X or swipe ----
     All toasts share one fixed .toast-tray so they stack in a column instead
     of piling on the same spot. Each carries a yarn-cross close and can be
     flung sideways to dismiss. */
  window.woolwork = window.woolwork || {};
  function toastTray(){
    var tray = document.querySelector('.toast-tray');
    if(!tray){
      tray = document.createElement('div'); tray.className = 'toast-tray';
      tray.setAttribute('role','region'); tray.setAttribute('aria-label','Notifications');
      tray.setAttribute('aria-live','polite'); tray.setAttribute('aria-atomic','false');
      document.body.appendChild(tray);
    }
    return tray;
  }
  window.woolwork.toast = function(msg, ms){
    var t = document.createElement('div');
    t.className = 'toast felt stitch';
    t.style.setProperty('--c','var(--butter)');
    t.style.setProperty('--t','var(--thread-butter)');
    var label = document.createElement('span');
    label.textContent = msg; t.appendChild(label);
    var x = document.createElement('button');
    x.type = 'button'; x.className = 'yarn-x'; x.setAttribute('aria-label','Dismiss notification');
    x.style.setProperty('--c','var(--thread-butter)');
    x.innerHTML = '<span class="yarn"></span><span class="yarn"></span>';
    x.querySelectorAll('.yarn').forEach(function(y){ y.style.setProperty('--c','var(--thread-butter)'); });
    t.appendChild(x);
    var tray = toastTray(); tray.appendChild(t);
    while(tray.children.length > 4) tray.firstElementChild.remove();
    ensureThread(t);
    var timer = setTimeout(dismiss, ms || 3200);
    var gone = false;
    function dismiss(){
      if(gone) return; gone = true; clearTimeout(timer);
      t.classList.add('leaving');
      setTimeout(function(){ t.remove(); }, 380);
    }
    function restartTimer(){
      clearTimeout(timer);
      if(!gone) timer = setTimeout(dismiss, ms || 3200);
    }
    x.addEventListener('click', dismiss);
    t.addEventListener('pointerenter', function(){ clearTimeout(timer); });
    t.addEventListener('pointerleave', restartTimer);
    t.addEventListener('focusin', function(){ clearTimeout(timer); });
    t.addEventListener('focusout', restartTimer);
    /* Swipe to dismiss: drag past a threshold flings the note off the board. */
    var startX = 0, dx = 0, dragging = false;
    t.addEventListener('pointerdown', function(e){
      if(e.target.closest('.yarn-x')) return;
      dragging = true; startX = e.clientX; dx = 0;
      t.classList.add('swiping');
      try{ t.setPointerCapture(e.pointerId); }catch(err){}
    });
    t.addEventListener('pointermove', function(e){
      if(!dragging) return;
      dx = e.clientX - startX;
      t.style.translate = dx + 'px 0';
      t.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / 240));
    });
    function endDrag(){
      if(!dragging) return; dragging = false; t.classList.remove('swiping');
      if(Math.abs(dx) > 110){
        clearTimeout(timer); gone = true;
        t.style.transition = 'translate .25s ease,opacity .25s ease';
        t.style.translate = (dx > 0 ? 420 : -420) + 'px 0'; t.style.opacity = '0';
        setTimeout(function(){ t.remove(); }, 260);
      }else{
        t.style.transition = 'translate .3s var(--spring),opacity .3s';
        t.style.translate = '0 0'; t.style.opacity = '1';
        setTimeout(function(){ t.style.transition = ''; }, 320);
      }
    }
    t.addEventListener('pointerup', endDrag);
    t.addEventListener('pointercancel', endDrag);
  };

  /* ---- Night dye: URL-backed theme helper ---- */
  function nightFromUrl(){
    try{
      var url = new URL(location.href);
      var values = url.searchParams.getAll('theme');
      var on = values[0] === 'night';
      if(values.length !== (on ? 1 : 0) || (values.length && values[0] !== 'night')){
        url.searchParams.delete('theme');
        if(on) url.searchParams.set('theme','night');
        history.replaceState(history.state,'',url.href);
      }
      return on;
    }
    catch(e){ return false; }
  }
  function syncNightLink(link, on){
    var raw = link.getAttribute('href');
    if(!raw || /^(mailto:|tel:|javascript:)/i.test(raw)) return;
    try{
      var url = new URL(raw, location.href);
      if(url.origin !== location.origin) return;
      url.searchParams.delete('theme');
      if(on) url.searchParams.set('theme','night');
      link.setAttribute('href', url.href);
    }catch(e){}
  }
  function syncNightLinks(on){
    document.querySelectorAll('a[href]').forEach(function(link){ syncNightLink(link, on); });
  }
  function syncNightControl(control, on){
    control.setAttribute('aria-pressed', on ? 'true' : 'false');
    control.textContent = on ? (control.dataset.dayLabel || 'Day') : (control.dataset.nightLabel || 'Night');
  }
  function syncNightControls(on){
    document.querySelectorAll('[data-woolwork-theme-toggle]').forEach(function(control){
      syncNightControl(control, on);
    });
  }
  function applyNight(on, writeUrl){
    var root = document.documentElement;
    if(on) root.setAttribute('data-theme','night');
    else root.removeAttribute('data-theme');
    if(writeUrl){
      try{
        var url = new URL(location.href);
        if(on) url.searchParams.set('theme','night');
        else url.searchParams.delete('theme');
        history.replaceState(history.state,'',url.href);
      }catch(e){}
    }
    syncNightLinks(on); syncNightControls(on);
    return on;
  }
  window.woolwork.night = function(on){
    if(on === undefined) on = document.documentElement.getAttribute('data-theme') !== 'night';
    return applyNight(!!on, true);
  };
  applyNight(nightFromUrl(), false);
  addEventListener('popstate', function(){ applyNight(nightFromUrl(), false); });
})();
