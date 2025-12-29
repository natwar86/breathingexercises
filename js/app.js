// Main Application Controller

// Simple event system for module communication
window.AppEvents = {
  listeners: {},

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
};

// Main App
const App = {
  // DOM elements
  elements: {
    // Stats
    streakCount: null,
    todayCount: null,
    dailyGoal: null,

    // Breathing circle
    circle: null,
    instruction: null,
    breathCount: null,

    // Controls
    startStopBtn: null,
    resetBtn: null
  },

  // Initialize app
  init() {
    console.log('Initializing Breathing App...');

    // Cache DOM elements
    this.cacheElements();

    // Initialize modules
    window.Storage.init();
    window.BreathingSession.init(this.elements);

    // Setup event listeners
    this.setupEventListeners();

    // Update UI with initial data
    this.updateStatsDisplay();

    console.log('Breathing App initialized successfully');
  },

  // Cache DOM element references
  cacheElements() {
    // Stats
    this.elements.streakCount = document.getElementById('streakCount');
    this.elements.todayCount = document.getElementById('todayCount');
    this.elements.dailyGoal = document.getElementById('dailyGoal');

    // Breathing circle
    this.elements.circle = document.getElementById('breathCircle');
    this.elements.instruction = document.getElementById('instruction');
    this.elements.breathCount = document.getElementById('breathCount');
    this.elements.progressCircle = document.getElementById('progressCircle');

    // Controls
    this.elements.startStopBtn = document.getElementById('startStopBtn');
    this.elements.resetBtn = document.getElementById('resetBtn');
  },

  // Setup all event listeners
  setupEventListeners() {
    // Button click handlers
    this.elements.startStopBtn.addEventListener('click', () => {
      this.handleStartStopClick();
    });

    this.elements.resetBtn.addEventListener('click', () => {
      this.handleResetClick();
    });

    // App event listeners
    window.AppEvents.on('sessionStarted', () => {
      this.onSessionStarted();
    });

    window.AppEvents.on('sessionStopped', (data) => {
      this.onSessionStopped(data);
    });

    window.AppEvents.on('sessionReset', () => {
      this.onSessionReset();
    });

    window.AppEvents.on('cycleCompleted', (data) => {
      this.onCycleCompleted(data);
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Space bar = start/stop
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        this.handleStartStopClick();
      }
      // Escape = stop (if active)
      if (e.code === 'Escape' && window.BreathingSession.isActive) {
        window.BreathingSession.stop();
      }
    });
  },

  // Handle Start/Stop button click
  handleStartStopClick() {
    if (window.BreathingSession.isActive) {
      window.BreathingSession.stop();
    } else {
      window.BreathingSession.start();
    }
  },

  // Handle Reset button click
  handleResetClick() {
    window.BreathingSession.reset();
  },

  // Session started event handler
  onSessionStarted() {
    // Update button text
    this.elements.startStopBtn.textContent = 'Pause';
    this.elements.startStopBtn.classList.add('active');

    // Hide reset button
    this.elements.resetBtn.style.display = 'none';
  },

  // Session stopped event handler
  onSessionStopped(data) {
    // Update button text
    this.elements.startStopBtn.textContent = 'Continue';
    this.elements.startStopBtn.classList.remove('active');

    // Show reset button if there are breaths counted
    if (data.breathCount > 0) {
      this.elements.resetBtn.style.display = 'block';

      // Save session to storage
      window.Storage.saveSession(data.breathCount, data.duration);

      // Update streak and stats
      window.Streak.updateStreakData();
      this.updateStatsDisplay();

      // DISABLED: Notifications disabled for web version (will enable for mobile app)
      // this.checkFirstSessionComplete();
    }
  },

  // Session reset event handler
  onSessionReset() {
    // Hide reset button
    this.elements.resetBtn.style.display = 'none';

    // Update button text
    this.elements.startStopBtn.textContent = 'Start Here';
    this.elements.startStopBtn.classList.remove('active');
  },

  // Cycle completed event handler
  onCycleCompleted(data) {
    // Check if daily goal just reached
    const summary = window.Streak.getStreakSummary();
    if (summary.goalReached && data.count === summary.dailyGoal) {
      this.celebrateDailyGoal();
    }
  },

  // Update stats display (streak and daily goal)
  updateStatsDisplay() {
    const summary = window.Streak.getStreakSummary();

    // Update streak count
    this.elements.streakCount.textContent = summary.currentStreak;

    // Update today's count
    this.elements.todayCount.textContent = summary.todayCount;

    // Update daily goal
    this.elements.dailyGoal.textContent = summary.dailyGoal;

    // Add visual feedback if goal reached
    if (summary.goalReached) {
      this.elements.todayCount.style.color = 'var(--color-success)';
    } else {
      this.elements.todayCount.style.color = 'var(--color-text-primary)';
    }
  },

  // Celebrate when daily goal is reached
  celebrateDailyGoal() {
    // Add celebrate class for animation
    this.elements.todayCount.classList.add('celebrate');

    // Remove after animation completes
    setTimeout(() => {
      this.elements.todayCount.classList.remove('celebrate');
    }, 500);

    console.log('Daily goal reached! Great work!');
  },

  // DISABLED: Notification permission request
  // Will re-enable for mobile app version
  checkFirstSessionComplete() {
    // const dailyLogs = window.Storage.getDailyLogs();
    // const totalDays = Object.keys(dailyLogs).length;

    // if (totalDays <= 2 && window.Notifications) {
    //   setTimeout(() => {
    //     window.Notifications.requestPermissionIfNeeded();
    //   }, 2000);
    // }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}

// Export for debugging
window.App = App;
