// Streak Calculation and Daily Goal Tracking

const Streak = {
  // Calculate current streak from daily logs
  calculateCurrentStreak(dailyLogs) {
    if (!dailyLogs || Object.keys(dailyLogs).length === 0) {
      return 0;
    }

    const today = this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();
    const sortedDates = Object.keys(dailyLogs).sort().reverse();

    let streak = 0;
    let currentDate = new Date();

    // Check if we have activity today or yesterday
    const hasToday = sortedDates.includes(today);
    const hasYesterday = sortedDates.includes(yesterday);

    // If no activity today or yesterday, streak is broken
    if (!hasToday && !hasYesterday) {
      return 0;
    }

    // Start counting from today or yesterday (whichever has activity)
    let checkDate = hasToday ? today : yesterday;

    for (const logDate of sortedDates) {
      if (logDate === checkDate) {
        streak++;
        // Move to previous day
        currentDate = new Date(checkDate);
        currentDate.setDate(currentDate.getDate() - 1);
        checkDate = this.formatDateString(currentDate);
      } else if (streak > 0) {
        // Gap found, streak ends
        break;
      }
    }

    return streak;
  },

  // Get today's date string (YYYY-MM-DD in local timezone)
  getTodayDateString() {
    return new Date().toLocaleDateString('en-CA');
  },

  // Get yesterday's date string (YYYY-MM-DD in local timezone)
  getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('en-CA');
  },

  // Format a Date object as YYYY-MM-DD string
  formatDateString(date) {
    return date.toLocaleDateString('en-CA');
  },

  // Update streak data in storage
  updateStreakData() {
    const dailyLogs = window.Storage.getDailyLogs();
    const currentStreak = this.calculateCurrentStreak(dailyLogs);

    const streakData = window.Storage.getStreakData();

    // Update longest streak if current is greater
    const longestStreak = Math.max(currentStreak, streakData.longestStreak || 0);

    // Determine streak start date
    let streakStartDate = streakData.streakStartDate;
    if (currentStreak > 0) {
      if (currentStreak !== streakData.currentStreak) {
        // Streak changed, recalculate start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (currentStreak - 1));
        streakStartDate = this.formatDateString(startDate);
      }
    } else {
      streakStartDate = null;
    }

    const updatedStreakData = {
      currentStreak,
      longestStreak,
      lastActiveDate: this.getTodayDateString(),
      streakStartDate
    };

    window.Storage.updateStreakData(updatedStreakData);

    return updatedStreakData;
  },

  // Get today's breath count
  getTodayBreathCount() {
    const todayLog = window.Storage.getTodayLog();
    return todayLog ? todayLog.breathCount : 0;
  },

  // Get daily goal
  getDailyGoal() {
    const settings = window.Storage.getSettings();
    return settings.dailyGoal || 10;
  },

  // Check if daily goal is reached
  isDailyGoalReached() {
    return this.getTodayBreathCount() >= this.getDailyGoal();
  },

  // Get daily progress percentage
  getDailyProgress() {
    const count = this.getTodayBreathCount();
    const goal = this.getDailyGoal();
    return Math.min(100, Math.floor((count / goal) * 100));
  },

  // Get streak summary for display
  getStreakSummary() {
    const streakData = window.Storage.getStreakData();
    const todayCount = this.getTodayBreathCount();
    const dailyGoal = this.getDailyGoal();
    const progress = this.getDailyProgress();

    return {
      currentStreak: streakData.currentStreak || 0,
      longestStreak: streakData.longestStreak || 0,
      todayCount,
      dailyGoal,
      progress,
      goalReached: this.isDailyGoalReached()
    };
  },

  // Get motivational message based on streak
  getMotivationalMessage(streak) {
    if (streak === 0) {
      return 'Start your journey today';
    } else if (streak === 1) {
      return 'Great start! Keep going';
    } else if (streak < 7) {
      return `${streak} days strong!`;
    } else if (streak === 7) {
      return 'Amazing! One week streak!';
    } else if (streak < 30) {
      return `${streak} days of mindfulness`;
    } else if (streak === 30) {
      return 'Incredible! 30 day streak!';
    } else if (streak < 100) {
      return `${streak} days! You're a master`;
    } else if (streak === 100) {
      return 'Legendary! 100 day streak!';
    } else {
      return `${streak} days of dedication`;
    }
  }
};

// Export for use in other modules
window.Streak = Streak;
