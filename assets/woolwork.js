/* WOOLWORK v1.1.0 progressive enhancement.
   Everything renders without this file; it only adds motion and physics. */
(function(){
  'use strict';
  document.documentElement.classList.add('ww-js');
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Place, then stitch: reveal choreography ----
     The patch settles into place, then its running stitch draws on around
     the edge as one thread and resolves into dashes. Visual only. */
  function stitchOn(el){
    if(rm || !el.classList.contains('stitch')) { el.classList.remove('unstitched'); return; }
    var r = el.getBoundingClientRect();
    var inset = 8, sw = 2.5;
    var w = Math.max(0, r.width - inset * 2), h = Math.max(0, r.height - inset * 2);
    var cs = getComputedStyle(el);
    var rad = parseFloat(cs.borderTopLeftRadius) || 14;
    rad = Math.min(rad, w / 2, h / 2);
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','stitch-thread');
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', sw / 2); rect.setAttribute('y', sw / 2);
    rect.setAttribute('width', Math.max(0, w - sw));
    rect.setAttribute('height', Math.max(0, h - sw));
    rect.setAttribute('rx', rad);
    rect.setAttribute('pathLength','100');
    rect.style.strokeDasharray = '100';
    rect.style.strokeDashoffset = '100';
    rect.style.transition = 'stroke-dashoffset .7s ease-in-out';
    svg.appendChild(rect); el.appendChild(svg);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      rect.style.strokeDashoffset = '0';
    });});
    setTimeout(function(){
      el.classList.remove('unstitched');   /* dashed stitch fades in */
      svg.style.transition = 'opacity .3s'; svg.style.opacity = '0';
      setTimeout(function(){ svg.remove(); }, 350);
    }, 720);
  }
  var io;
  function armReveal(el){
    if(el.classList.contains('stitch')) el.classList.add('unstitched');
    el.classList.remove('on');
    io.observe(el);
  }
  io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      /* Force the browser to paint the hidden state before flipping to
         visible. Elements already on screen at observe() time otherwise
         get 'on' added in the same frame as their first paint, and the
         transition never has a start frame to animate from. */
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        el.classList.add('on');
        stitchOn(el);
      }); });
    });
  }, {threshold:.12});
  document.querySelectorAll('.sew').forEach(armReveal);
  /* Back-forward cache restores the page without re-running this script,
     so a page reached via browser back/forward can arrive with reveals
     already resolved from before navigation. Re-arm them on that path. */
  window.addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    document.querySelectorAll('.sew').forEach(armReveal);
  });
  /* Sewn elements mounted after load (by a framework, htmx, or plain DOM
     work) arm the same way, keeping the whole kit live for late content. */
  if('MutationObserver' in window){
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        for(var i = 0; i < m.addedNodes.length; i++){
          var n = m.addedNodes[i];
          if(n.nodeType !== 1) continue;
          if(n.classList.contains('sew')) armReveal(n);
          if(n.querySelectorAll) n.querySelectorAll('.sew').forEach(armReveal);
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

  /* ---- Tabs: one selected folder tab, its panel shown, siblings hidden ----
     Markup: .tabs > button[aria-controls=panelId]; panels are .tab-panel.
     Panels sync to the selected tab at init, so markup can ship every panel
     visible and no-JS readers still get all the content. */
  function syncTabs(group){
    group.querySelectorAll('button[aria-controls]').forEach(function(b){
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if(panel) panel.hidden = b.getAttribute('aria-selected') !== 'true';
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
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if(panel) panel.hidden = !sel;
    });
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
      b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    }
  });

  /* ---- Fabric flap dropdowns: close on outside pointerdown ---- */
  document.addEventListener('pointerdown', function(e){
    document.querySelectorAll('details.flap[open]').forEach(function(d){
      if(!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  /* ---- Toast: a note slides in and gets tacked to the board ---- */
  window.woolwork = window.woolwork || {};
  window.woolwork.toast = function(msg, ms){
    var t = document.createElement('div');
    t.className = 'toast felt stitch';
    t.style.setProperty('--c','var(--butter)');
    t.style.setProperty('--t','var(--thread-butter)');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){
      t.classList.add('leaving');
      setTimeout(function(){ t.remove(); }, 320);
    }, ms || 2600);
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
