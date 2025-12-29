// Breathing Session Management

const BreathingSession = {
  // State
  isActive: false,
  cycleCount: 0,
  phase: 'idle', // 'idle', 'inhale', 'exhale'
  timeoutId: null,
  startTime: null,
  wakeLock: null,

  // Constants
  INHALE_DURATION: 5500,  // 5.5 seconds in milliseconds
  EXHALE_DURATION: 5500,  // 5.5 seconds in milliseconds
  PAUSE_DURATION: 500,    // 0.5 second pause between phases
  TOTAL_CYCLE: 11000,     // 11 seconds total

  // DOM Elements (initialized by app.js)
  elements: {},

  // Progress ring animation
  progressIntervalId: null,

  // Initialize with DOM element references
  init(elements) {
    this.elements = elements;
  },

  // Start breathing session
  async start() {
    if (this.isActive) return;

    this.isActive = true;
    this.startTime = Date.now();

    // Acquire wake lock to prevent screen sleep
    await this.acquireWakeLock();

    // Start with inhale phase
    this.startInhale();

    // Update UI
    this.updateUI();

    // Emit event for app controller
    if (window.AppEvents) {
      window.AppEvents.emit('sessionStarted');
    }
  },

  // Stop breathing session
  stop() {
    if (!this.isActive) return;

    this.isActive = false;

    // Clear any pending phase transitions
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Clear progress animation
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }

    // Release wake lock
    this.releaseWakeLock();

    // Remove animation classes
    this.elements.circle.classList.remove('inhale', 'exhale', 'active');

    // Update UI
    this.updateUI();

    // Emit event for app controller
    if (window.AppEvents) {
      window.AppEvents.emit('sessionStopped', {
        breathCount: this.cycleCount,
        duration: Math.floor((Date.now() - this.startTime) / 1000)
      });
    }
  },

  // Reset session (clear count and return to idle)
  reset() {
    this.stop();
    this.cycleCount = 0;
    this.phase = 'idle';
    this.updateUI();

    // Emit event for app controller
    if (window.AppEvents) {
      window.AppEvents.emit('sessionReset');
    }
  },

  // Start inhale phase
  startInhale() {
    this.phase = 'inhale';

    // Remove previous animation class and force reflow
    this.elements.circle.classList.remove('exhale');
    void this.elements.circle.offsetWidth; // Force reflow

    // Add inhale animation class
    this.elements.circle.classList.add('inhale', 'active');

    // Update instruction text
    this.elements.instruction.textContent = 'Inhale';
    this.elements.instruction.classList.add('active');

    // Start progress ring animation (forward direction)
    this.animateProgressRing(this.INHALE_DURATION, false);

    // Schedule transition to exhale after 5.5s + 0.5s pause
    this.timeoutId = setTimeout(() => {
      if (this.isActive) {
        // Brief pause before exhale
        this.elements.instruction.textContent = 'Hold';
        setTimeout(() => {
          if (this.isActive) {
            this.startExhale();
          }
        }, this.PAUSE_DURATION);
      }
    }, this.INHALE_DURATION);
  },

  // Start exhale phase
  startExhale() {
    this.phase = 'exhale';

    // Remove previous animation class and force reflow
    this.elements.circle.classList.remove('inhale');
    void this.elements.circle.offsetWidth; // Force reflow

    // Add exhale animation class
    this.elements.circle.classList.add('exhale', 'active');

    // Update instruction text
    this.elements.instruction.textContent = 'Exhale';

    // Start progress ring animation (reverse direction)
    this.animateProgressRing(this.EXHALE_DURATION, true);

    // Schedule transition to next inhale after 5.5s + 0.5s pause
    this.timeoutId = setTimeout(() => {
      if (this.isActive) {
        // Brief pause before next inhale
        this.elements.instruction.textContent = 'Hold';
        setTimeout(() => {
          if (this.isActive) {
            // Increment cycle count (one full breath = inhale + exhale)
            this.cycleCount++;
            this.updateUI();

            // Emit cycle completed event
            if (window.AppEvents) {
              window.AppEvents.emit('cycleCompleted', { count: this.cycleCount });
            }

            // Start next inhale
            this.startInhale();
          }
        }, this.PAUSE_DURATION);
      }
    }, this.EXHALE_DURATION);
  },

  // Animate progress ring
  animateProgressRing(duration, reverse = false) {
    if (!this.elements.progressCircle) return;

    const circumference = 1036.73; // Exact: 2 * Math.PI * 165
    const startTime = Date.now();

    // Clear any existing animation
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
    }

    // For inhale: go from full (circumference) to empty (0)
    // For exhale: go from empty (0) to full (circumference) - reverse direction
    const startOffset = reverse ? 0 : circumference;
    const endOffset = reverse ? circumference : 0;

    // Set initial state immediately
    this.elements.progressCircle.style.strokeDashoffset = startOffset;

    // Animate progress
    this.progressIntervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolate between start and end offset
      const offset = startOffset + (endOffset - startOffset) * progress;
      this.elements.progressCircle.style.strokeDashoffset = offset;

      if (progress >= 1) {
        clearInterval(this.progressIntervalId);
        this.progressIntervalId = null;
      }
    }, 16); // ~60fps
  },

  // Reset progress ring
  resetProgressRing() {
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
    if (this.elements.progressCircle) {
      const circumference = 1036.73;
      this.elements.progressCircle.style.strokeDashoffset = circumference;
    }
  },

  // Update UI elements
  updateUI() {
    if (!this.elements.breathCount || !this.elements.instruction) return;

    // Update breath count display
    const plural = this.cycleCount === 1 ? 'breath' : 'breaths';
    this.elements.breathCount.textContent = `${this.cycleCount} ${plural}`;

    // Update instruction text based on phase
    if (!this.isActive) {
      this.elements.instruction.textContent = '';
      this.elements.instruction.classList.remove('active');
      this.resetProgressRing();
    }
  },

  // Acquire wake lock to prevent screen sleep during breathing
  async acquireWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');

        // Re-acquire wake lock when page becomes visible again
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      }
    } catch (err) {
      console.error('Wake Lock error:', err);
      // Gracefully degrade - app still works without wake lock
    }
  },

  // Release wake lock
  releaseWakeLock() {
    if (this.wakeLock !== null) {
      this.wakeLock.release()
        .then(() => {
          this.wakeLock = null;
        })
        .catch(err => {
          console.error('Wake Lock release error:', err);
        });
    }
  },

  // Get current session data
  getSessionData() {
    return {
      isActive: this.isActive,
      cycleCount: this.cycleCount,
      phase: this.phase,
      duration: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0
    };
  }
};

// Handle page visibility change (re-acquire wake lock if needed)
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && BreathingSession.isActive) {
    await BreathingSession.acquireWakeLock();
  }
});

// Export for use in other modules
window.BreathingSession = BreathingSession;
