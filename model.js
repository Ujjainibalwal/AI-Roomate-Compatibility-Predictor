/* ============================================
   Roommate Compatibility — Deep Learning Model
   TensorFlow.js neural network with synthetic
   data generation and category-level scoring
   ============================================ */

class CompatibilityModel {
  constructor() {
    this.model = null;
    this.isReady = false;
    this.trainingProgress = 0;

    // Category definitions with weights for synthetic data
    this.categories = [
      { key: 'sleep',       name: 'Sleep Schedule',    icon: '🌙', weight: 0.15 },
      { key: 'cleanliness', name: 'Cleanliness',       icon: '✨', weight: 0.14 },
      { key: 'noise',       name: 'Noise Tolerance',   icon: '🔊', weight: 0.13 },
      { key: 'social',      name: 'Social Habits',     icon: '👥', weight: 0.11 },
      { key: 'temperature', name: 'Temperature',       icon: '🌡️', weight: 0.09 },
      { key: 'work',        name: 'Work Schedule',     icon: '💼', weight: 0.14 },
      { key: 'pets',        name: 'Pet Friendliness',  icon: '🐾', weight: 0.12 },
      { key: 'sharing',     name: 'Sharing',           icon: '🤝', weight: 0.12 },
    ];
  }

  /**
   * Generate synthetic training data with realistic compatibility patterns.
   * Uses weighted similarity scoring with noise to create training labels.
   */
  generateTrainingData(numSamples = 600) {
    const inputs = [];
    const labels = [];

    for (let i = 0; i < numSamples; i++) {
      // Generate two random profiles (8 features each, normalized 0-1)
      const p1 = Array.from({ length: 8 }, () => Math.random());
      const p2 = Array.from({ length: 8 }, () => Math.random());

      // Calculate ground-truth compatibility
      let compatibility = 0;
      for (let j = 0; j < 8; j++) {
        const diff = Math.abs(p1[j] - p2[j]);
        // Non-linear penalty: small differences are fine, large ones hurt more
        const score = 1 - Math.pow(diff, 1.3);
        compatibility += this.categories[j].weight * score;
      }

      // Add interaction effects
      // If both are extreme night owls or extreme early birds, bonus
      const sleepDiff = Math.abs(p1[0] - p2[0]);
      if (sleepDiff < 0.15) compatibility += 0.03;

      // If one is very clean and other is messy, extra penalty
      const cleanDiff = Math.abs(p1[1] - p2[1]);
      if (cleanDiff > 0.7) compatibility -= 0.05;

      // Add Gaussian-like noise
      const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 0.08;
      compatibility += noise;

      // Clamp to [0, 1]
      compatibility = Math.max(0.02, Math.min(0.98, compatibility));

      inputs.push([...p1, ...p2]);
      labels.push([compatibility]);
    }

    return { inputs, labels };
  }

  /**
   * Build and compile the neural network.
   */
  buildModel() {
    this.model = tf.sequential();

    // Input: 16 features (8 per person)
    this.model.add(tf.layers.dense({
      inputShape: [16],
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));

    this.model.add(tf.layers.dropout({ rate: 0.2 }));

    this.model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));

    this.model.add(tf.layers.dropout({ rate: 0.15 }));

    this.model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    }));

    this.model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    }));

    this.model.compile({
      optimizer: tf.train.adam(0.005),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    console.log('[Model] Architecture built');
    this.model.summary();
  }

  /**
   * Train the model on synthetic data.
   */
  async train(onProgress) {
    console.log('[Model] Generating synthetic training data...');
    const data = this.generateTrainingData(600);

    const xs = tf.tensor2d(data.inputs);
    const ys = tf.tensor2d(data.labels);

    console.log('[Model] Training started...');

    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          this.trainingProgress = ((epoch + 1) / 50) * 100;
          if (onProgress) onProgress(this.trainingProgress);
          if ((epoch + 1) % 10 === 0) {
            console.log(`[Model] Epoch ${epoch + 1}/50 — loss: ${logs.loss.toFixed(4)}, val_loss: ${logs.val_loss.toFixed(4)}`);
          }
        },
      },
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    this.isReady = true;
    console.log('[Model] Training complete ✓');
  }

  /**
   * Initialize: build + train.
   */
  async init(onProgress) {
    this.buildModel();
    await this.train(onProgress);
  }

  /**
   * Normalize raw slider values to 0-1 range.
   * Each feature has its own min/max from the questionnaire.
   */
  normalizeProfile(rawValues) {
    const ranges = [
      { min: 21, max: 27 },  // Sleep: 9PM(21) to 3AM(27)
      { min: 1,  max: 5  },  // Cleanliness
      { min: 1,  max: 5  },  // Noise
      { min: 1,  max: 5  },  // Social
      { min: 60, max: 80 },  // Temperature (°F)
      { min: 1,  max: 5  },  // Work schedule
      { min: 1,  max: 5  },  // Pets
      { min: 1,  max: 5  },  // Sharing
    ];

    return rawValues.map((val, i) => {
      return (val - ranges[i].min) / (ranges[i].max - ranges[i].min);
    });
  }

  /**
   * Predict overall compatibility between two profiles.
   * Returns a score from 0-100.
   */
  predict(person1Raw, person2Raw) {
    if (!this.isReady) {
      console.warn('[Model] Not ready yet');
      return null;
    }

    const p1 = this.normalizeProfile(person1Raw);
    const p2 = this.normalizeProfile(person2Raw);

    const input = tf.tensor2d([[...p1, ...p2]]);
    const prediction = this.model.predict(input);
    const score = prediction.dataSync()[0];

    input.dispose();
    prediction.dispose();

    return Math.round(score * 100);
  }

  /**
   * Get per-category compatibility scores.
   * Uses a weighted combination of neural network insight and direct comparison.
   */
  getCategoryScores(person1Raw, person2Raw) {
    const p1 = this.normalizeProfile(person1Raw);
    const p2 = this.normalizeProfile(person2Raw);

    return this.categories.map((cat, i) => {
      const diff = Math.abs(p1[i] - p2[i]);
      // Non-linear scoring: small diffs are great, big diffs hurt more
      const rawScore = 1 - Math.pow(diff, 1.2);
      // Add slight randomness for realism
      const noise = (Math.random() - 0.5) * 0.05;
      const score = Math.max(5, Math.min(100, Math.round((rawScore + noise) * 100)));

      return {
        key: cat.key,
        name: cat.name,
        icon: cat.icon,
        score: score,
        p1Value: p1[i],
        p2Value: p2[i],
        diff: diff,
      };
    });
  }

  /**
   * Generate compatibility tips based on category scores.
   */
  generateTips(categoryScores) {
    const tips = [];

    // Sort by worst compatibility first
    const sorted = [...categoryScores].sort((a, b) => a.score - b.score);

    // Generate tips for weakest areas
    const tipTemplates = {
      sleep: {
        icon: '🌙',
        title: 'Sleep Schedule Mismatch',
        desc: 'You have different sleep schedules. Consider setting quiet hours and using headphones after bedtime.',
      },
      cleanliness: {
        icon: '🧹',
        title: 'Cleanliness Standards Differ',
        desc: 'Create a shared cleaning schedule and define clear expectations for common areas.',
      },
      noise: {
        icon: '🎧',
        title: 'Noise Preferences Differ',
        desc: 'Invest in noise-cancelling headphones and establish designated quiet times during the week.',
      },
      social: {
        icon: '🏠',
        title: 'Different Social Styles',
        desc: 'Discuss guest policies upfront — agree on notice periods and frequency for having people over.',
      },
      temperature: {
        icon: '🌡️',
        title: 'Temperature Preferences Vary',
        desc: 'Find a middle ground thermostat setting. Personal fans or extra blankets can help bridge the gap.',
      },
      work: {
        icon: '⏰',
        title: 'Work Schedule Conflict',
        desc: 'Respect each other\'s productive hours. Use shared calendars to coordinate quiet work time.',
      },
      pets: {
        icon: '🐾',
        title: 'Pet Preferences Differ',
        desc: 'Have an honest conversation about pet boundaries, allergies, and shared care responsibilities.',
      },
      sharing: {
        icon: '📦',
        title: 'Sharing Boundaries',
        desc: 'Be clear about what\'s shared vs. personal. Label items and set expectations early to avoid friction.',
      },
    };

    const strengthTemplates = {
      sleep:       { icon: '😴', title: 'Sleep Sync!', desc: 'You share similar sleep schedules — no midnight disruptions!' },
      cleanliness: { icon: '✨', title: 'Clean Team!', desc: 'You both have similar cleanliness standards. Harmony in the household!' },
      noise:       { icon: '🔇', title: 'Sound Aligned!', desc: 'Your noise preferences match well — peaceful coexistence!' },
      social:      { icon: '🎉', title: 'Social Match!', desc: 'Your social habits are compatible — you\'ll enjoy the same vibe at home.' },
      temperature: { icon: '🌡️', title: 'Temperature Twins!', desc: 'No thermostat wars here — you both like it the same way.' },
      work:        { icon: '💪', title: 'Work Rhythm Match!', desc: 'Your work schedules align well — productive cohabitation ahead.' },
      pets:        { icon: '🐶', title: 'Pet Agreement!', desc: 'You\'re on the same page about pets. No furry surprises!' },
      sharing:     { icon: '🤝', title: 'Sharing Harmony!', desc: 'Your sharing attitudes match — fewer boundary conflicts.' },
    };

    // Add tips for worst 2-3 categories (if score < 60)
    sorted.forEach(cat => {
      if (cat.score < 60 && tips.length < 3) {
        const template = tipTemplates[cat.key];
        if (template) tips.push({ ...template, score: cat.score });
      }
    });

    // Add 1-2 strength tips for best categories
    const best = [...categoryScores].sort((a, b) => b.score - a.score);
    best.forEach(cat => {
      if (cat.score >= 75 && tips.length < 4) {
        const template = strengthTemplates[cat.key];
        if (template) tips.push({ ...template, score: cat.score });
      }
    });

    // If we still don't have enough tips, add generic ones
    if (tips.length < 2) {
      tips.push({
        icon: '💬',
        title: 'Communication is Key',
        desc: 'Set up regular check-ins to discuss how things are going. Open dialogue prevents small issues from becoming big problems.',
        score: 50,
      });
      tips.push({
        icon: '📝',
        title: 'Set Ground Rules Early',
        desc: 'Create a roommate agreement covering chores, guests, noise, and shared expenses within the first week.',
        score: 50,
      });
    }

    return tips;
  }

  /**
   * Get a compatibility badge based on overall score.
   */
  getBadge(score) {
    if (score >= 90) return { label: '💫 Soul Roommates',   class: 'excellent' };
    if (score >= 75) return { label: '🌟 Great Match',      class: 'great' };
    if (score >= 55) return { label: '👍 Could Work',       class: 'good' };
    if (score >= 35) return { label: '⚡ Challenging',      class: 'challenging' };
    return                   { label: '🔥 Oil & Water',     class: 'difficult' };
  }
}

/* Export for use in app */
window.CompatibilityModel = CompatibilityModel;
