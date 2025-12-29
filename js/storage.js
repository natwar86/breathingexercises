// LocalStorage Data Persistence Layer

const Storage = {
  // Storage keys
  KEYS: {
    SETTINGS: 'breathingApp_settings',
    DAILY_LOGS: 'breathingApp_dailyLogs',
    STREAK_DATA: 'breathingApp_streakData'
  },

  // Default data structures
  DEFAULTS: {
    settings: {
      dailyGoal: 10,
      notificationsEnabled: false,
      notificationTime: '09:00',
      theme: 'dark'
    },
    dailyLogs: {},
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakStartDate: null
    }
  },

  // Initialize storage (called on app load)
  init() {
    // Ensure all storage keys exist with defaults
    if (!this.getData(this.KEYS.SETTINGS)) {
      this.saveData(this.KEYS.SETTINGS, this.DEFAULTS.settings);
    }
    if (!this.getData(this.KEYS.DAILY_LOGS)) {
      this.saveData(this.KEYS.DAILY_LOGS, this.DEFAULTS.dailyLogs);
    }
    if (!this.getData(this.KEYS.STREAK_DATA)) {
      this.saveData(this.KEYS.STREAK_DATA, this.DEFAULTS.streakData);
    }
  },

  // Get data from localStorage
  getData(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },

  // Save data to localStorage
  saveData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, pruning old data...');
        this.pruneOldLogs();
        // Retry after pruning
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to save even after pruning:', retryError);
          return false;
        }
      } else {
        console.error('Error writing to localStorage:', e);
        return false;
      }
    }
  },

  // Get current settings
  getSettings() {
    return this.getData(this.KEYS.SETTINGS) || this.DEFAULTS.settings;
  },

  // Update settings
  updateSettings(newSettings) {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    return this.saveData(this.KEYS.SETTINGS, updatedSettings);
  },

  // Get daily logs
  getDailyLogs() {
    return this.getData(this.KEYS.DAILY_LOGS) || this.DEFAULTS.dailyLogs;
  },

  // Get today's date string in local timezone (YYYY-MM-DD)
  getTodayDateString() {
    return new Date().toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
  },

  // Get log for a specific date
  getLogForDate(dateString) {
    const logs = this.getDailyLogs();
    return logs[dateString] || null;
  },

  // Get today's log
  getTodayLog() {
    return this.getLogForDate(this.getTodayDateString());
  },

  // Save a completed breathing session
  saveSession(breathCount, durationSeconds) {
    const today = this.getTodayDateString();
    const logs = this.getDailyLogs();

    // Get or create today's log
    const todayLog = logs[today] || {
      breathCount: 0,
      sessionCount: 0,
      totalMinutes: 0,
      lastSessionTime: null
    };

    // Update today's log
    todayLog.breathCount += breathCount;
    todayLog.sessionCount += 1;
    todayLog.totalMinutes += Math.floor(durationSeconds / 60);
    todayLog.lastSessionTime = new Date().toISOString();

    // Save updated logs
    logs[today] = todayLog;
    this.saveData(this.KEYS.DAILY_LOGS, logs);

    // Emit event for streak recalculation
    if (window.AppEvents) {
      window.AppEvents.emit('sessionSaved', { date: today, log: todayLog });
    }

    return todayLog;
  },

  // Get streak data
  getStreakData() {
    return this.getData(this.KEYS.STREAK_DATA) || this.DEFAULTS.streakData;
  },

  // Update streak data
  updateStreakData(streakData) {
    return this.saveData(this.KEYS.STREAK_DATA, streakData);
  },

  // Prune old logs (keep only last 90 days to manage storage)
  pruneOldLogs() {
    const logs = this.getDailyLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const prunedLogs = {};
    Object.keys(logs).forEach(dateString => {
      const logDate = new Date(dateString);
      if (logDate >= cutoffDate) {
        prunedLogs[dateString] = logs[dateString];
      }
    });

    this.saveData(this.KEYS.DAILY_LOGS, prunedLogs);
    console.log(`Pruned logs, kept ${Object.keys(prunedLogs).length} days`);
  },

  // Export all data as JSON (for backup)
  exportData() {
    return {
      settings: this.getSettings(),
      dailyLogs: this.getDailyLogs(),
      streakData: this.getStreakData(),
      exportDate: new Date().toISOString()
    };
  },

  // Import data from JSON (for restore)
  importData(data) {
    if (data.settings) this.saveData(this.KEYS.SETTINGS, data.settings);
    if (data.dailyLogs) this.saveData(this.KEYS.DAILY_LOGS, data.dailyLogs);
    if (data.streakData) this.saveData(this.KEYS.STREAK_DATA, data.streakData);
    return true;
  },

  // Clear all data (reset app)
  clearAllData() {
    localStorage.removeItem(this.KEYS.SETTINGS);
    localStorage.removeItem(this.KEYS.DAILY_LOGS);
    localStorage.removeItem(this.KEYS.STREAK_DATA);
    this.init(); // Reinitialize with defaults
  }
};

// Export for use in other modules
window.Storage = Storage;
