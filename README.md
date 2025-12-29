# Breathe - Daily Mindfulness PWA

A simple, elegant Progressive Web App for guided breathing meditation with daily habit tracking.

**Live Demo**: [Coming soon - Deploy to GitHub Pages]

## Features

- **5.5 second breathing cycles** - Guided inhale and exhale with visual animation
- **Expanding circle animation** - Smooth, calming visual feedback
- **Streak tracking** - Track consecutive days of practice
- **Daily goals** - Set and achieve breath count targets
- **PWA support** - Install on your phone, works offline
- **Daily reminders** - Optional notifications to build the habit
- **Minimalist design** - Clean, distraction-free interface

## Getting Started

### 1. Start a Local Server

The app requires a local server to run properly (for service workers and PWA features).

**Using Python:**
```bash
cd /Users/natwar/dev/BreathingApp
python3 -m http.server 8000
```

**Using Node.js:**
```bash
npx serve .
```

### 2. Open in Browser

Navigate to `http://localhost:8000` in your browser.

### 3. Test the Breathing Experience

1. Click "Start" to begin your first breathing session
2. Follow the expanding circle with your breath
3. Watch your breath count increase
4. Click "Stop" when finished
5. Click "Reset" to start over

## PWA Installation

### On Desktop (Chrome/Edge):
1. Look for the install icon in the address bar
2. Click "Install" to add to your desktop

### On Mobile (iOS):
1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### On Mobile (Android):
1. Open in Chrome
2. Tap the three dots menu
3. Select "Install app" or "Add to Home Screen"

## Icons (TODO)

The app currently references icon files that need to be created. You can:

1. **Generate icons online:** Use a tool like [favicon.io](https://favicon.io) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. **Create manually:** Design a simple circle gradient in Figma/Photoshop and export at different sizes
3. **Use ImageMagick:** Create a base 512x512 icon and resize:

```bash
# Install ImageMagick first (brew install imagemagick)
cd assets/icons
# Create a base icon first (icon-512x512.png)
for size in 72 96 128 144 152 192 384; do
  convert icon-512x512.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

For now, the app will work fine even without icons - they're only needed for installation.

## Browser Compatibility

- **Chrome/Edge 90+**: Full support ✅
- **Safari 15+**: Works, but limited Wake Lock support ⚠️
- **Firefox 88+**: Works, but no Wake Lock ⚠️

## Data Storage

All data is stored locally in your browser using localStorage:
- **Streak data**: Current and longest streaks
- **Daily logs**: Breath counts for each day
- **Settings**: Daily goal and notification preferences

No data is sent to any server. Your privacy is protected.

## Keyboard Shortcuts

- **Space**: Start/Stop breathing session
- **Escape**: Stop current session

## Future Enhancements

- Custom breathing patterns (4-7-8, box breathing, etc.)
- Customizable breath timing
- Calendar heatmap view of practice history
- Sound cues for phase transitions
- Data export/import
- Flutter mobile app version

## Technical Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **PWA**: Service Workers, Web App Manifest
- **Storage**: localStorage API
- **APIs**: Wake Lock, Notifications, Service Workers

## File Structure

```
BreathingApp/
├── index.html              # Main app entry
├── manifest.json           # PWA configuration
├── sw.js                   # Service worker
├── css/
│   ├── variables.css      # Design tokens
│   ├── main.css           # Layout & styles
│   └── animations.css     # Circle animations
├── js/
│   ├── app.js             # Main controller
│   ├── breathing.js       # Session logic
│   ├── storage.js         # Data persistence
│   ├── streak.js          # Streak calculations
│   ├── notifications.js   # Reminder system
│   └── pwa.js             # PWA registration
└── assets/
    └── icons/             # App icons (to be created)
```

## Development

The app is intentionally built with vanilla JavaScript for simplicity and learning. No build tools or dependencies required - just open and edit!

## Deployment

### Deploy to GitHub Pages (FREE)

**1. Create GitHub Repository:**
```bash
# Go to https://github.com/new
# Create a new repository named "breathing-app" (or any name you prefer)
# Do NOT initialize with README (we already have one)
```

**2. Push to GitHub:**
```bash
cd /Users/natwar/dev/BreathingApp

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/breathing-app.git

# Push to GitHub
git push -u origin main
```

**3. Enable GitHub Pages:**
- Go to your repository on GitHub
- Click **Settings** → **Pages** (left sidebar)
- Under "Source", select **Deploy from branch**
- Select branch: **main**
- Select folder: **/ (root)**
- Click **Save**

**Your app will be live at:**
```
https://YOUR_USERNAME.github.io/breathing-app/
```

**4. (Optional) Add Custom Domain:**
- In DNS settings, add CNAME record:
  ```
  Type: CNAME
  Name: breathe (or subdomain of your choice)
  Value: YOUR_USERNAME.github.io
  ```
- In GitHub Pages settings, add custom domain: `breathe.yourdomain.com`
- Wait for DNS propagation (5-30 minutes)

**5. Updates:**
```bash
# Make changes to your code
git add .
git commit -m "Update breathing app"
git push

# GitHub Pages auto-deploys in ~1 minute
```

### Alternative Deployment Options

**Netlify** (Drag & Drop):
1. Go to [netlify.com](https://netlify.com)
2. Drag the `/Users/natwar/dev/BreathingApp` folder
3. Done! Instant deployment

**Vercel**:
```bash
npx vercel
```

**Cloudflare Pages**:
1. Connect GitHub repo at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Auto-deploys on push

---

## License

MIT - Feel free to use and modify as you wish.

---

**Breathe deeply. Be present. Build the habit.**
