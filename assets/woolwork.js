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
  var NS = 'http://www.w3.org/2000/svg', stitchSeq = 0;
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

  /* Attach a persistent thread SVG to a .stitch element (idempotent). */
  function ensureThread(el){
    if(el._wwThread) return el._wwThread;
    var g = stitchGeom(el);
    var svg = document.createElementNS(NS,'svg');
    svg.setAttribute('class','stitch-thread');
    svg.setAttribute('width', g.w); svg.setAttribute('height', g.h);
    svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    var path = document.createElementNS(NS,'path');
    path.setAttribute('d', g.d);
    path.style.strokeDasharray = '6.5 4.6';
    svg.appendChild(path); el.appendChild(svg);
    el.classList.add('threaded');
    el._wwThread = {svg:svg, path:path, defs:null, lead:null, drawn:true};
    if(ro) ro.observe(el);
    return el._wwThread;
  }

  function resizeThread(el){
    var rec = el._wwThread; if(!rec) return;
    var g = stitchGeom(el);
    rec.svg.setAttribute('width', g.w); rec.svg.setAttribute('height', g.h);
    rec.svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    rec.path.setAttribute('d', g.d);
    if(rec.lead) rec.lead.setAttribute('d', g.d);
  }

  /* Undrawn state for a .sew element awaiting reveal: hide the dashed path
     behind a mask whose solid lead thread has not been drawn yet. */
  function armThread(el){
    var rec = ensureThread(el);
    if(rm){ rec.drawn = true; return; }
    if(rec.defs){ rec.defs.remove(); rec.defs = null; }
    var g = stitchGeom(el);
    var id = 'ww-stitch-' + (++stitchSeq);
    var defs = document.createElementNS(NS,'defs');
    var mask = document.createElementNS(NS,'mask');
    mask.setAttribute('id', id);
    mask.setAttribute('maskUnits','userSpaceOnUse');
    mask.setAttribute('x','-3'); mask.setAttribute('y','-3');
    mask.setAttribute('width', g.w + 6); mask.setAttribute('height', g.h + 6);
    var lead = document.createElementNS(NS,'path');
    lead.setAttribute('d', g.d);
    lead.setAttribute('fill','none');
    lead.setAttribute('stroke','#fff');
    lead.setAttribute('stroke-width','5.5');
    lead.setAttribute('pathLength','100');
    lead.style.strokeDasharray = '100';
    lead.style.strokeDashoffset = '100';
    mask.appendChild(lead); defs.appendChild(mask);
    rec.svg.insertBefore(defs, rec.svg.firstChild);
    rec.path.setAttribute('mask','url(#' + id + ')');
    rec.defs = defs; rec.lead = lead; rec.drawn = false;
  }

  /* Sew the thread on in place, then drop the mask so it rests as a plain
     dashed thread (the solid lead reveals the dashes where they will stay). */
  function drawThread(el){
    var rec = el._wwThread; if(!rec || rec.drawn) return;
    var lead = rec.lead;
    lead.style.transition = 'stroke-dashoffset 1.6s ease-in-out .15s';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      lead.style.strokeDashoffset = '0';
    });});
    rec.drawn = true;
    setTimeout(function(){
      if(rec.defs){ rec.defs.remove(); rec.defs = null; }
      rec.path.removeAttribute('mask'); rec.lead = null;
    }, 1850);
  }

  var io;
  function armReveal(el){
    if(el.classList.contains('stitch')) armThread(el);
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
      /* Force the browser to paint the hidden state before flipping to
         visible, so the reveal transition has a start frame to animate from. */
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        el.classList.add('on');
        if(el.classList.contains('stitch')) drawThread(el);
      }); });
    });
  }, {threshold:.12, rootMargin:'1000000px 0px 0px 0px'});
  /* Thread every stitched element up front: .sew ones arm undrawn and draw on
     reveal; stitched-but-not-sewn ones (toasts, static cards) draw at once. */
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
          if(n.matches && n.matches('dialog.pinned')) watchPinnedDialog(n);
          if(n.querySelectorAll){
            n.querySelectorAll('.sew').forEach(armReveal);
            n.querySelectorAll('.stitch:not(.sew)').forEach(ensureThread);
            n.querySelectorAll('dialog.pinned').forEach(watchPinnedDialog);
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
  function enhancePaperSelect(select, index){
    if(select.dataset.wwPaperSelect) return;
    select.dataset.wwPaperSelect = 'true';

    var slot = document.createElement('div');
    slot.className = 'select-slot'; slot.dataset.open = 'false';
    select.parentNode.insertBefore(slot, select); slot.appendChild(select);

    var base = select.id || ('ww-paper-select-' + index);
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
      paper.style.setProperty('--fold-close-delay', ((select.options.length - i) * 45) + 'ms');
      paper.style.setProperty('--fold-angle', i % 2 ? '-82deg' : '82deg');
      paper.type = 'button';
      folds.appendChild(paper); paperOptions.push(paper);
    });
    slot.insertBefore(trigger, select); slot.appendChild(folds);
    select.tabIndex = -1; select.setAttribute('aria-hidden','true');

    /* The panel must stay visible exactly as long as the slowest fold is
       still moving, no longer: the last option to close carries the
       longest --fold-close-delay, plus the opacity fade duration, plus a
       small buffer. A fixed constant either flashes the panel away mid-fold
       (fewer options) or leaves an invisible-but-present box lingering
       (more options); this scales with the real option count instead. */
    slot.style.setProperty('--fold-hide-delay', (select.options.length * 45 + 260) + 'ms');

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
    function setActive(i){
      active = Math.max(0, Math.min(paperOptions.length - 1, i));
      paperOptions.forEach(function(paper, n){ paper.dataset.active = n === active ? 'true' : 'false'; });
      if(paperOptions[active]) trigger.setAttribute('aria-activedescendant', paperOptions[active].id);
    }
    function setOpen(open){
      if(trigger.disabled) open = false;
      slot.dataset.open = open ? 'true' : 'false';
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
        setActive(active + (e.key === 'ArrowDown' ? 1 : -1)); return;
      }
      if(e.key === 'Home' && open){ e.preventDefault(); setActive(0); return; }
      if(e.key === 'End' && open){ e.preventDefault(); setActive(paperOptions.length - 1); return; }
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

  /* ---- Night dye: theme toggle helper ---- */
  window.woolwork.night = function(on){
    var root = document.documentElement;
    if(on === undefined) on = root.getAttribute('data-theme') !== 'night';
    if(on) root.setAttribute('data-theme','night');
    else root.removeAttribute('data-theme');
    return on;
  };
})();
