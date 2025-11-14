// app.js - interactive behavior for prototype

(() => {
  // Points are persisted to localStorage so they survive reloads.
  const POINTS_KEY = 'ql_points';
  // History persists in localStorage (change HISTORY_KEY if you want that reset too).
  const HISTORY_KEY = 'ql_history';
  // Redeemed rewards persisted in localStorage
  const REDEEMED_REWARDS_KEY = 'ql_redeemed_rewards';

  // initialize runtimePoints from localStorage
  let runtimePoints = parseInt(localStorage.getItem(POINTS_KEY) || '0', 10) || 0;
  // migrate redeemed rewards from sessionStorage (old behaviour) to localStorage
  try {
    const ses = sessionStorage.getItem(REDEEMED_REWARDS_KEY);
    const loc = localStorage.getItem(REDEEMED_REWARDS_KEY);
    if (ses && !loc) {
      localStorage.setItem(REDEEMED_REWARDS_KEY, ses);
    }
  } catch (e) {}

  function $(sel, root=document) { return root.querySelector(sel); }
  function $$(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }

  function getPoints() {
    return parseInt(String(runtimePoints || 0), 10);
  }
  function setPoints(n) {
    runtimePoints = Number(n) || 0;
    // persist
    try { localStorage.setItem(POINTS_KEY, String(runtimePoints)); } catch (e) {}
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

  function updateRewardsUI() {
    const balance = $('#reward-points-balance');
    if (balance) balance.textContent = getPoints();
  }

  function redeemReward(rewardId, rewardCost, rewardTitle) {
    const currentPoints = getPoints();
    if (currentPoints < rewardCost) {
      alert('Not enough points! You need ' + rewardCost + ' points but only have ' + currentPoints);
      return false;
    }

    // Deduct points
    setPoints(currentPoints - rewardCost);
    updateRewardsUI();

    // Add to redeemed list (persist across reloads)
    const redeemedList = JSON.parse(localStorage.getItem(REDEEMED_REWARDS_KEY) || '[]');
    redeemedList.unshift({
      id: rewardId,
      title: rewardTitle,
      cost: rewardCost,
      redeemedAt: Date.now()
    });
    try { localStorage.setItem(REDEEMED_REWARDS_KEY, JSON.stringify(redeemedList.slice(0, 100))); } catch (e) {}
    renderRedeemedRewards();

    alert('Reward redeemed successfully! Check your rewards list.');
    return true;
  }

  function renderRedeemedRewards() {
    const list = $('#redeemed-list');
    if (!list) return;
    const redeemed = JSON.parse(localStorage.getItem(REDEEMED_REWARDS_KEY) || '[]');
    list.innerHTML = '';
    if (redeemed.length === 0) {
      list.innerHTML = '<p class="text-gray-500 text-center py-8">No rewards redeemed yet. Start earning points!</p>';
      return;
    }
    redeemed.forEach((r, idx) => {
      const date = new Date(r.redeemedAt);
      const el = document.createElement('div');
      el.className = 'flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500';
      el.innerHTML = `
        <div>
          <p class="font-semibold text-gray-800">${r.title}</p>
          <p class="text-xs text-gray-500 mt-1">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
        </div>
        <div class="text-right">
          <p class="font-medium text-green-600 flex items-center gap-1"><i class="ri-check-circle-line"></i> Redeemed</p>
          <p class="text-xs text-gray-500 mt-1">-${r.cost} pts</p>
        </div>
      `;
      list.appendChild(el);
    });
  }

  // Reset stored points and redeemed rewards (keeps history intact)
  function resetData() {
    if (!confirm('Reset points and redeemed rewards? This cannot be undone.')) return;
    try {
      localStorage.setItem(POINTS_KEY, '0');
      localStorage.removeItem(REDEEMED_REWARDS_KEY);
    } catch (e) {}
    // update runtime and UI
    setPoints(0);
    renderRedeemedRewards();
    updateRewardsUI();
    alert('Points and redeemed rewards have been reset.');
  }

  document.addEventListener('DOMContentLoaded', () => {
    updatePointsUI();
    updateRewardsUI();
    renderHistory();
    renderRedeemedRewards();

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

    // Nav buttons for switching views
    const navQuestBoard = $('#nav-questboard-btn');
    const navRewards = $('#nav-rewards-btn');
    const navPoints = $('#nav-mypoints-btn');
    const questsSection = $('#quests');
    const rewardsSection = $('#rewards-section');

    if (navQuestBoard) {
      navQuestBoard.addEventListener('click', () => {
        if (questsSection) questsSection.classList.remove('hidden');
        if (rewardsSection) rewardsSection.classList.add('hidden');
        navQuestBoard.classList.add('bg-blue-600', 'text-white', 'shadow-md');
        navQuestBoard.classList.remove('text-gray-600');
        if (navRewards) {
          navRewards.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
          navRewards.classList.add('text-gray-600');
        }
      });
    }

    if (navRewards) {
      navRewards.addEventListener('click', () => {
        if (questsSection) questsSection.classList.add('hidden');
        if (rewardsSection) rewardsSection.classList.remove('hidden');
        navRewards.classList.add('bg-blue-600', 'text-white', 'shadow-md');
        navRewards.classList.remove('text-gray-600');
        if (navQuestBoard) {
          navQuestBoard.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
          navQuestBoard.classList.add('text-gray-600');
        }
        updateRewardsUI();
      });
    }

    // Points button opens drawer
    if (navPoints) navPoints.addEventListener('click', openDrawer);

    // Drawer close
    const closeBtn = $('#close-drawer');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    const overlay = $('#overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Reset button (clear points and redeemed rewards)
    const resetBtn = $('#reset-data-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetData);

    // Redeem reward buttons
    $$('.redeem-reward-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.reward-card');
        if (!card) return;
        const rewardId = card.getAttribute('data-reward-id');
        const rewardCost = parseInt(card.getAttribute('data-reward-cost') || '0', 10);
        const rewardTitle = card.getAttribute('data-reward-title') || 'Unknown Reward';
        redeemReward(rewardId, rewardCost, rewardTitle);
      });
    });

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
