// app.js - interactive behavior for prototype

(() => {
  // Points are now kept in-memory only so they reset on every page reload.
  // History still persists in localStorage (change HISTORY_KEY if you want that reset too).
  let runtimePoints = 0;
  const HISTORY_KEY = 'ql_history';

  function $(sel, root=document) { return root.querySelector(sel); }
  function $$(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }

  function getPoints() {
    return parseInt(String(runtimePoints || 0), 10);
  }
  function setPoints(n) {
    runtimePoints = Number(n) || 0;
    updatePointsUI();
  }
  function pushHistory(item) {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    hist.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0,50)));
    renderHistory();
  }

  function updatePointsUI() {
    const total = getPoints();
    const badge = $('#points-badge');
    const totalEl = $('#points-total');
    if (badge) badge.textContent = total || '';
    if (totalEl) totalEl.textContent = total;
  }

  function renderHistory() {
    const list = $('#points-list');
    if (!list) return;
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    list.innerHTML = '';
    if (hist.length === 0) {
      list.innerHTML = '<p class="text-sm text-gray-500">No completed quests yet.</p>';
      return;
    }
    hist.forEach(h => {
      const el = document.createElement('div');
      el.className = 'flex justify-between items-center';
      el.innerHTML = `<div class="text-sm">${h.title}</div><div class="text-sm font-medium text-yellow-600">+${h.points}</div>`;
      list.appendChild(el);
    });
  }

  function openDrawer() {
    const overlay = $('#overlay');
    const drawer = $('#points-drawer');
    if (overlay) overlay.classList.remove('hidden');
    if (drawer) {
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }
  }
  function closeDrawer() {
    const overlay = $('#overlay');
    const drawer = $('#points-drawer');
    if (overlay) overlay.classList.add('hidden');
    if (drawer) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updatePointsUI();
    renderHistory();

    // Hero buttons
    const heroStart = $('#hero-start-btn');
    if (heroStart) {
      heroStart.addEventListener('click', (e) => {
        const quests = $('#quests');
        if (quests) quests.scrollIntoView({behavior:'smooth', block:'start'});
      });
    }
    const heroProgress = $('#hero-progress-btn');
    if (heroProgress) heroProgress.addEventListener('click', openDrawer);

    // Nav points button opens drawer
    const navPoints = $('#nav-mypoints-btn');
    if (navPoints) navPoints.addEventListener('click', openDrawer);

    // Drawer close
    const closeBtn = $('#close-drawer');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    const overlay = $('#overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Filters
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = btn.getAttribute('data-filter');
        // toggle active styles
        $$('.filter-btn').forEach(b => b.classList.remove('bg-blue-600','text-white'));
        btn.classList.add('bg-blue-600','text-white');
        // show/hide
        $$('.quest-card').forEach(card => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || filter === cat) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });

    // Start Quest buttons
    $$('.start-quest-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.quest-card');
        if (!card) return;
        if (btn.disabled) return;
        // parse attributes
        let progress = parseInt(card.getAttribute('data-progress') || '0', 10);
        const total = parseInt(card.getAttribute('data-total') || '1', 10);
        const reward = parseInt(card.getAttribute('data-reward') || '0', 10);
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : 'Quest';

        // increment progress
        progress = Math.min(total, progress + 1);
        card.setAttribute('data-progress', String(progress));

        // update UI
        const progressText = card.querySelector('.progress-text');
        if (progressText) progressText.textContent = `${progress}/${total}`;
        const bar = card.querySelector('.progress-bar');
        if (bar) bar.style.width = (Math.round((progress/total)*10000)/100) + '%';

        // if completed
        if (progress >= total) {
          btn.disabled = true;
          btn.classList.remove('bg-blue-600','hover:bg-blue-700');
          btn.classList.add('bg-green-100','text-green-800','cursor-not-allowed');
          btn.innerHTML = '<i class="ri-check-line mr-2"></i>Completed';

          // award points
          if (reward > 0) {
            const prev = getPoints();
            setPoints(prev + reward);
            pushHistory({ title, points: reward, at: Date.now() });
          }
        }
      });
    });

    // Initialize filter default (All)
    const firstFilter = document.querySelector('.filter-btn[data-filter="all"]');
    if (firstFilter) firstFilter.click();

    // Enhance existing progress displays by converting static progress into data attributes if not present
    $$('.quest-card').forEach(card => {
      const progressText = card.querySelector('.progress-text');
      if (!progressText) {
        // try to find numeric progress like "7/10" inside the card
        const match = card.innerText.match(/(\d+)\s*\/\s*(\d+)/);
        if (match) {
          card.setAttribute('data-progress', match[1]);
          card.setAttribute('data-total', match[2]);
        }
      }
    });

  });
})();
