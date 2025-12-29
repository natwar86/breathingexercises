// PWA Registration and Installation

const PWA = {
  deferredPrompt: null,
  isInstalled: false,

  // Initialize PWA features
  init() {
    // Register service worker
    this.registerServiceWorker();

    // Handle install prompt
    this.handleInstallPrompt();

    // Check if already installed
    this.checkIfInstalled();
  },

  // Register service worker for offline support
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    } else {
      console.warn('[PWA] Service Workers not supported');
    }
  },

  // Handle install prompt
  handleInstallPrompt() {
    // Capture the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');

      // Prevent default prompt
      e.preventDefault();

      // Save event for later use
      this.deferredPrompt = e;

      // Show custom install UI after user completes a few sessions
      this.checkShowInstallPrompt();
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });
  },

  // Check if app should show install prompt
  checkShowInstallPrompt() {
    // Only show after 2-3 sessions to avoid being intrusive
    const dailyLogs = window.Storage.getDailyLogs();
    const totalDays = Object.keys(dailyLogs).length;

    if (totalDays >= 2 && this.deferredPrompt && !this.isInstalled) {
      // Could show a custom install button or banner here
      console.log('[PWA] User has completed multiple sessions - install prompt ready');
      // For now, just log - implement custom UI in future
    }
  },

  // Trigger install prompt (call this from custom install button)
  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log('[PWA] User choice:', outcome);

    // Clear the deferred prompt
    this.deferredPrompt = null;

    return outcome === 'accepted';
  },

  // Check if app is already installed
  checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('[PWA] App is installed and running standalone');
    }

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.isInstalled = e.matches;
      console.log('[PWA] Display mode changed:', e.matches ? 'standalone' : 'browser');
    });
  },

  // Get install status
  getInstallStatus() {
    return {
      isInstalled: this.isInstalled,
      canInstall: this.deferredPrompt !== null,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
    };
  }
};

// Initialize PWA features when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PWA.init();
  });
} else {
  PWA.init();
}

// Export for use in other modules
window.PWA = PWA;
