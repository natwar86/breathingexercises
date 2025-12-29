// Notification Management for Daily Reminders

const Notifications = {
  permission: 'default',
  reminderTimeoutId: null,

  // Initialize notifications
  init() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
      console.log('[Notifications] Permission status:', this.permission);

      // If already granted, setup reminder
      if (this.permission === 'granted') {
        this.scheduleNextReminder();
      }
    } else {
      console.warn('[Notifications] Not supported in this browser');
    }
  },

  // Request notification permission (called after first completed session)
  async requestPermissionIfNeeded() {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Not supported');
      return false;
    }

    // Don't ask if already decided
    if (this.permission !== 'default') {
      return this.permission === 'granted';
    }

    // Ask for permission
    console.log('[Notifications] Requesting permission...');

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (permission === 'granted') {
        console.log('[Notifications] Permission granted');

        // Update settings
        window.Storage.updateSettings({ notificationsEnabled: true });

        // Schedule first reminder
        this.scheduleNextReminder();

        // Show confirmation notification
        this.showNotification(
          'Reminders Enabled',
          'You\'ll receive a gentle reminder each day to practice breathing'
        );

        return true;
      } else {
        console.log('[Notifications] Permission denied');
        window.Storage.updateSettings({ notificationsEnabled: false });
        return false;
      }
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return false;
    }
  },

  // Show a notification
  showNotification(title, body, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return;
    }

    const defaultOptions = {
      body: body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      tag: 'breathing-reminder',
      requireInteraction: false,
      silent: false
    };

    const notificationOptions = { ...defaultOptions, ...options };

    // Use service worker notification if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, notificationOptions);
      });
    } else {
      // Fallback to regular notification
      new Notification(title, notificationOptions);
    }
  },

  // Schedule next daily reminder
  scheduleNextReminder() {
    const settings = window.Storage.getSettings();

    if (!settings.notificationsEnabled || this.permission !== 'granted') {
      return;
    }

    // Clear existing timeout
    if (this.reminderTimeoutId) {
      clearTimeout(this.reminderTimeoutId);
    }

    // Get reminder time from settings (default 09:00)
    const reminderTime = settings.notificationTime || '09:00';
    const [hours, minutes] = reminderTime.split(':').map(Number);

    // Calculate next reminder time
    const now = new Date();
    const nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextReminder <= now) {
      nextReminder.setDate(nextReminder.getDate() + 1);
    }

    const delay = nextReminder - now;

    console.log('[Notifications] Next reminder scheduled for:', nextReminder.toLocaleString());

    // Schedule the reminder
    this.reminderTimeoutId = setTimeout(() => {
      this.sendDailyReminder();
    }, delay);
  },

  // Send daily reminder notification
  sendDailyReminder() {
    // Check if user has already practiced today
    const todayLog = window.Storage.getTodayLog();

    if (!todayLog || todayLog.breathCount === 0) {
      // User hasn't practiced yet - send reminder
      this.showNotification(
        'Time to Breathe',
        'Take a moment for mindful breathing practice',
        {
          tag: 'daily-reminder',
          requireInteraction: false
        }
      );

      console.log('[Notifications] Daily reminder sent');
    } else {
      console.log('[Notifications] User already practiced today - skipping reminder');
    }

    // Schedule next reminder for tomorrow
    this.scheduleNextReminder();
  },

  // Update reminder time
  updateReminderTime(timeString) {
    // timeString format: "HH:MM"
    const settings = window.Storage.getSettings();
    settings.notificationTime = timeString;
    window.Storage.updateSettings(settings);

    // Reschedule reminder
    this.scheduleNextReminder();

    console.log('[Notifications] Reminder time updated to:', timeString);
  },

  // Enable/disable notifications
  setEnabled(enabled) {
    window.Storage.updateSettings({ notificationsEnabled: enabled });

    if (enabled && this.permission === 'granted') {
      this.scheduleNextReminder();
    } else if (!enabled && this.reminderTimeoutId) {
      clearTimeout(this.reminderTimeoutId);
      this.reminderTimeoutId = null;
    }

    console.log('[Notifications] Notifications', enabled ? 'enabled' : 'disabled');
  },

  // Get notification status
  getStatus() {
    const settings = window.Storage.getSettings();
    return {
      permission: this.permission,
      enabled: settings.notificationsEnabled,
      reminderTime: settings.notificationTime,
      isScheduled: this.reminderTimeoutId !== null
    };
  }
};

// DISABLED: Notifications disabled for web version
// Will re-enable for mobile app version
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', () => {
//     Notifications.init();
//   });
// } else {
//   Notifications.init();
// }

// Export for use in other modules (keep for future use)
window.Notifications = Notifications;
