/* WOOLWORK v1.2.0 progressive enhancement.
   Everything renders without this file; it only adds motion and physics. */
(function(){
  'use strict';
  document.documentElement.classList.add('ww-js');
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Place, then stitch: reveal choreography ----
     The patch settles into place, then its running stitch sews on around the
     edge: the same dashed outline the element keeps afterward, appearing
     segment by segment from the top-left corner. The drawn path rebuilds the
     dashed border's exact geometry (8px inset, the element's own four corner
     radii, stroke centerline half a stroke further in), so the thread and the
     final stitch coincide. Visual only. */
  var NS = 'http://www.w3.org/2000/svg', stitchSeq = 0;
  function stitchOn(el){
    if(rm || !el.classList.contains('stitch')) { el.classList.remove('unstitched'); return; }
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
    var svg = document.createElementNS(NS,'svg');
    svg.setAttribute('class','stitch-thread');
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    /* The dashed outline is revealed by a solid lead thread animated inside a
       mask, so the dashes appear in their final places instead of sliding. */
    var id = 'ww-stitch-' + (++stitchSeq);
    var defs = document.createElementNS(NS,'defs');
    var mask = document.createElementNS(NS,'mask');
    mask.setAttribute('id', id);
    mask.setAttribute('maskUnits','userSpaceOnUse');
    mask.setAttribute('x','-2'); mask.setAttribute('y','-2');
    mask.setAttribute('width', w + 4); mask.setAttribute('height', h + 4);
    var lead = document.createElementNS(NS,'path');
    lead.setAttribute('d', d);
    lead.setAttribute('fill','none');
    lead.setAttribute('stroke','#fff');
    lead.setAttribute('stroke-width', sw + 3);
    lead.setAttribute('pathLength','100');
    lead.style.strokeDasharray = '100';
    lead.style.strokeDashoffset = '100';
    lead.style.transition = 'stroke-dashoffset 1.05s ease-in-out .2s';
    mask.appendChild(lead); defs.appendChild(mask); svg.appendChild(defs);
    var path = document.createElementNS(NS,'path');
    path.setAttribute('d', d);
    path.setAttribute('mask','url(#' + id + ')');
    /* Dash rhythm close to the CSS dashed border, so the handoff is quiet. */
    path.style.strokeDasharray = '6.5 4.6';
    svg.appendChild(path); el.appendChild(svg);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      lead.style.strokeDashoffset = '0';
    });});
    setTimeout(function(){
      el.classList.remove('unstitched');   /* dashed stitch fades in */
      svg.style.transition = 'opacity .3s'; svg.style.opacity = '0';
      setTimeout(function(){ svg.remove(); }, 350);
    }, 1350);
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
