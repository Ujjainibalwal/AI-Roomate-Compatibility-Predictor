/* ============================================
   AI Roommate Compatibility Predictor
   App Logic — Navigation, Forms, Results
   ============================================ */

(function () {
  'use strict';

  // ─── State ──────────────────────────────────
  let currentScreen = 'landing';
  let model = null;
  let particleSystem = null;

  // ─── DOM References ─────────────────────────
  const screens = {
    landing:  document.getElementById('screen-landing'),
    person1:  document.getElementById('screen-person1'),
    person2:  document.getElementById('screen-person2'),
    results:  document.getElementById('screen-results'),
  };

  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText    = document.getElementById('loading-text');

  // Buttons
  const btnStart       = document.getElementById('btn-start');
  const btnBackLanding = document.getElementById('btn-back-to-landing');
  const btnToPerson2   = document.getElementById('btn-to-person2');
  const btnBackP1      = document.getElementById('btn-back-to-p1');
  const btnAnalyze     = document.getElementById('btn-analyze');
  const btnTryAgain    = document.getElementById('btn-try-again');
  const btnShare       = document.getElementById('btn-share');

  // Results elements
  const gaugeScore     = document.getElementById('gauge-score');
  const gaugeFill      = document.getElementById('gauge-fill');
  const gaugeGlow      = document.getElementById('gauge-glow');
  const badgeContainer = document.getElementById('badge-container');
  const categoryBars   = document.getElementById('category-bars');
  const tipsList       = document.getElementById('tips-list');

  // ─── Slider Value Formatters ────────────────

  const sliderFormatters = {
    sleep: (val) => {
      const hour = Math.floor(val);
      const min = (val % 1) * 60;
      const h = hour > 24 ? hour - 24 : hour;
      const ampm = hour >= 24 || hour < 12 ? 'AM' : 'PM';
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayH}:${min === 0 ? '00' : '30'} ${ampm}`;
    },
    cleanliness: (val) => {
      const labels = { 1: 'Very Relaxed', 2: 'Relaxed', 3: 'Moderate', 4: 'Tidy', 5: 'Spotless' };
      return labels[val] || val;
    },
    noise: (val) => {
      const labels = { 1: 'Need Silence', 2: 'Quiet', 3: 'Moderate', 4: 'Lively', 5: 'Loud & Proud' };
      return labels[val] || val;
    },
    social: (val) => {
      const labels = { 1: 'Almost Never', 2: 'Rarely', 3: 'Sometimes', 4: 'Often', 5: 'Very Often' };
      return labels[val] || val;
    },
    temperature: (val) => {
      const celsius = Math.round((val - 32) * 5 / 9);
      return `${val}°F (${celsius}°C)`;
    },
    work: (val) => {
      const labels = { 1: 'Early Bird', 2: 'Morning Person', 3: 'Flexible', 4: 'Evening Person', 5: 'Night Owl' };
      return labels[val] || val;
    },
    pets: (val) => {
      const labels = { 1: 'No Pets Please', 2: 'Prefer No Pets', 3: 'Okay with some', 4: 'Love Pets', 5: 'All Pets Welcome!' };
      return labels[val] || val;
    },
    sharing: (val) => {
      const labels = { 1: 'Very Private', 2: 'Mostly Private', 3: 'Some things', 4: 'Happy to Share', 5: 'What\'s mine is yours' };
      return labels[val] || val;
    },
  };

  const featureKeys = ['sleep', 'cleanliness', 'noise', 'social', 'temperature', 'work', 'pets', 'sharing'];

  // ─── Initialize Sliders ─────────────────────

  function initSliders() {
    ['p1', 'p2'].forEach(person => {
      featureKeys.forEach(key => {
        const slider = document.getElementById(`${person}-${key}`);
        const display = document.getElementById(`${person}-${key}-val`);

        if (slider && display) {
          // Set initial display
          display.textContent = sliderFormatters[key](parseFloat(slider.value));

          // Live update
          slider.addEventListener('input', () => {
            display.textContent = sliderFormatters[key](parseFloat(slider.value));

            // Add a quick highlight effect
            display.style.color = '#67e8f9';
            display.style.transform = 'scale(1.05)';
            display.style.transition = 'all 0.15s ease';
            setTimeout(() => {
              display.style.color = '';
              display.style.transform = '';
            }, 200);
          });
        }
      });
    });
  }

  // ─── Screen Navigation ──────────────────────

  function navigateTo(screenName) {
    // Hide current
    if (screens[currentScreen]) {
      screens[currentScreen].classList.remove('active');
    }

    currentScreen = screenName;

    // Show target
    const target = screens[screenName];
    if (target) {
      target.classList.add('active');
      // Re-trigger animation
      target.style.animation = 'none';
      target.offsetHeight; // trigger reflow
      target.style.animation = '';

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-animate question cards
      if (screenName === 'person1' || screenName === 'person2') {
        const cards = target.querySelectorAll('.question-card');
        cards.forEach((card, i) => {
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = `cardSlideIn 0.5s var(--ease-out-expo) ${i * 0.05}s both`;
        });
      }
    }
  }

  // ─── Collect Form Data ──────────────────────

  function getPersonData(person) {
    return featureKeys.map(key => {
      const slider = document.getElementById(`${person}-${key}`);
      return parseFloat(slider.value);
    });
  }

  // ─── Render Results ─────────────────────────

  function renderResults(overallScore, categoryScores, tips, badge) {
    // 1. Animate gauge
    renderGauge(overallScore);

    // 2. Badge
    badgeContainer.innerHTML = `
      <div class="badge badge--${badge.class}">${badge.label}</div>
    `;

    // 3. Category bars
    renderCategoryBars(categoryScores);

    // 4. Tips
    renderTips(tips);
  }

  function renderGauge(score) {
    const circumference = 2 * Math.PI * 110; // r=110
    const offset = circumference - (score / 100) * circumference;

    // Choose color based on score
    let strokeColor;
    if (score >= 80) strokeColor = '#10b981';
    else if (score >= 60) strokeColor = '#06b6d4';
    else if (score >= 40) strokeColor = '#f59e0b';
    else strokeColor = '#ef4444';

    gaugeFill.style.stroke = strokeColor;
    gaugeGlow.style.stroke = strokeColor;

    // Animate after a small delay
    setTimeout(() => {
      gaugeFill.style.strokeDashoffset = offset;
      gaugeGlow.style.strokeDashoffset = offset;
    }, 300);

    // Count up the number
    animateCounter(gaugeScore, 0, score, 1800);
  }

  function animateCounter(element, from, to, duration) {
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function renderCategoryBars(scores) {
    categoryBars.innerHTML = '';

    scores.forEach((cat, i) => {
      let barClass;
      if (cat.score >= 80) barClass = 'bar-excellent';
      else if (cat.score >= 65) barClass = 'bar-great';
      else if (cat.score >= 45) barClass = 'bar-good';
      else if (cat.score >= 25) barClass = 'bar-challenging';
      else barClass = 'bar-poor';

      let valueColor;
      if (cat.score >= 80) valueColor = '#34d399';
      else if (cat.score >= 65) valueColor = '#67e8f9';
      else if (cat.score >= 45) valueColor = '#fbbf24';
      else if (cat.score >= 25) valueColor = '#fb923c';
      else valueColor = '#f87171';

      const bar = document.createElement('div');
      bar.className = 'category-bar';
      bar.innerHTML = `
        <div class="category-bar__header">
          <span class="category-bar__name">
            <span class="category-bar__name-icon">${cat.icon}</span>
            ${cat.name}
          </span>
          <span class="category-bar__value" style="color: ${valueColor}">${cat.score}%</span>
        </div>
        <div class="category-bar__track">
          <div class="category-bar__fill ${barClass}" style="width: 0%"></div>
        </div>
      `;

      categoryBars.appendChild(bar);

      // Animate bar fill with staggered delay
      setTimeout(() => {
        const fill = bar.querySelector('.category-bar__fill');
        fill.style.width = cat.score + '%';
      }, 800 + i * 120);
    });
  }

  function renderTips(tips) {
    tipsList.innerHTML = '';

    tips.forEach((tip, i) => {
      const li = document.createElement('li');
      li.className = 'tip-item';
      li.style.animationDelay = `${1.8 + i * 0.2}s`;
      li.innerHTML = `
        <div class="tip-item__icon">${tip.icon}</div>
        <div class="tip-item__content">
          <div class="tip-item__title">${tip.title}</div>
          <div class="tip-item__desc">${tip.desc}</div>
        </div>
      `;
      tipsList.appendChild(li);
    });
  }

  // ─── Analysis Flow ──────────────────────────

  async function runAnalysis() {
    // Show loading
    loadingOverlay.classList.add('active');

    const messages = [
      'Collecting lifestyle data...',
      'Feeding data to neural network...',
      'Running inference through 3 hidden layers...',
      'Computing category compatibility...',
      'Generating AI insights...',
      'Preparing your report...',
    ];

    // Animate through messages
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        loadingText.textContent = messages[msgIndex];
      }
    }, 500);

    // Get data
    const p1Data = getPersonData('p1');
    const p2Data = getPersonData('p2');

    // Ensure model is ready (should be by now)
    if (!model.isReady) {
      loadingText.textContent = 'Neural network is still training...';
      await waitForModel();
    }

    // Predict
    const overallScore = model.predict(p1Data, p2Data);
    const categoryScores = model.getCategoryScores(p1Data, p2Data);
    const tips = model.generateTips(categoryScores);
    const badge = model.getBadge(overallScore);

    // Wait at least 2.5s for the loading animation to feel right
    await new Promise(resolve => setTimeout(resolve, 2500));

    clearInterval(msgInterval);

    // Hide loading
    loadingOverlay.classList.remove('active');

    // Reset gauge for animation
    gaugeFill.style.strokeDashoffset = 691.15;
    gaugeGlow.style.strokeDashoffset = 691.15;
    gaugeScore.textContent = '0';

    // Navigate to results
    navigateTo('results');

    // Render with animations
    renderResults(overallScore, categoryScores, tips, badge);
  }

  function waitForModel() {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (model.isReady) {
          clearInterval(check);
          resolve();
        }
      }, 200);
    });
  }

  // ─── Share / Copy Results ───────────────────

  function copyResults() {
    const score = gaugeScore.textContent;
    const badge = badgeContainer.textContent.trim();
    const bars = categoryBars.querySelectorAll('.category-bar');

    let text = `🏠 RoomieAI Compatibility Report\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Overall Score: ${score}/100 ${badge}\n\n`;
    text += `Category Breakdown:\n`;

    bars.forEach(bar => {
      const name = bar.querySelector('.category-bar__name').textContent.trim();
      const value = bar.querySelector('.category-bar__value').textContent.trim();
      text += `  ${name}: ${value}\n`;
    });

    text += `\n🔗 Try it yourself at RoomieAI!`;

    navigator.clipboard.writeText(text).then(() => {
      btnShare.innerHTML = '<span>✓ Copied!</span>';
      setTimeout(() => {
        btnShare.innerHTML = '<span>📋 Copy Results</span>';
      }, 2000);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      btnShare.innerHTML = '<span>✓ Copied!</span>';
      setTimeout(() => {
        btnShare.innerHTML = '<span>📋 Copy Results</span>';
      }, 2000);
    });
  }

  // ─── Reset for Try Again ────────────────────

  function resetApp() {
    // Reset all sliders to defaults
    const defaults = {
      sleep: 23, cleanliness: 3, noise: 3, social: 3,
      temperature: 70, work: 3, pets: 3, sharing: 3,
    };

    const defaultsP2 = {
      sleep: 24, cleanliness: 3, noise: 3, social: 3,
      temperature: 72, work: 3, pets: 3, sharing: 3,
    };

    ['p1', 'p2'].forEach(person => {
      const defs = person === 'p1' ? defaults : defaultsP2;
      featureKeys.forEach(key => {
        const slider = document.getElementById(`${person}-${key}`);
        const display = document.getElementById(`${person}-${key}-val`);
        if (slider) {
          slider.value = defs[key];
          if (display) display.textContent = sliderFormatters[key](defs[key]);
        }
      });
    });

    navigateTo('landing');
  }

  // ─── Event Listeners ───────────────────────

  function bindEvents() {
    btnStart.addEventListener('click', () => navigateTo('person1'));
    btnBackLanding.addEventListener('click', () => navigateTo('landing'));
    btnToPerson2.addEventListener('click', () => navigateTo('person2'));
    btnBackP1.addEventListener('click', () => navigateTo('person1'));
    btnAnalyze.addEventListener('click', () => runAnalysis());
    btnTryAgain.addEventListener('click', () => resetApp());
    btnShare.addEventListener('click', () => copyResults());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (currentScreen === 'landing') navigateTo('person1');
        else if (currentScreen === 'person1') navigateTo('person2');
        else if (currentScreen === 'person2') runAnalysis();
      }
      if (e.key === 'Escape') {
        if (currentScreen === 'person1') navigateTo('landing');
        else if (currentScreen === 'person2') navigateTo('person1');
        else if (currentScreen === 'results') resetApp();
      }
    });
  }

  // ─── Initialization ─────────────────────────

  async function init() {
    console.log('[App] Initializing RoomieAI...');

    // Start particle background
    particleSystem = new ParticleSystem('particle-canvas');

    // Initialize sliders
    initSliders();

    // Bind events
    bindEvents();

    // Initialize and train TF.js model in background
    model = new CompatibilityModel();
    model.init((progress) => {
      // Model training progress (silent, in background)
      console.log(`[App] Model training: ${Math.round(progress)}%`);
    }).then(() => {
      console.log('[App] Model ready ✓');
    }).catch(err => {
      console.error('[App] Model training failed:', err);
    });

    console.log('[App] Ready ✓');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
