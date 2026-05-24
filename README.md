# Heal From It

A comprehensive Progressive Web App (PWA) designed to help you monitor and manage your healing journey. Track your daily routines, herbs, foods, supplements, outbreaks, and identify patterns in your health data with cloud sync capabilities.

## 🌟 Features

### 📊 Dashboard
- Overview of your wellness metrics and key statistics
- Track average sleep, stress levels, and workout streaks
- View recent journal entries at a glance
- Monitor your tracking consistency rate
- Quick access to all features

### 🌿 Herbs Catalog
- Manage your herbs inventory with comprehensive details
- Track purchase history with supplier, price, and purchase date
- Filter and search through your herb collection
- Add notes and usage instructions
- Bulk edit operations for managing multiple items
- Monitor stock levels and reorder points

### 🍎 Foods Catalog
- Track lysine vs arginine levels per serving (mg)
- Calculate lysine:arginine ratios automatically
- Filter foods by lysine score
- Manage comprehensive food database
- Import/export food data
- Search and categorize foods

### 🏪 Suppliers Management
- Manage supplier information (name, website, notes)
- Track which herbs/supplements are purchased from each supplier
- Quick access to supplier websites
- Bulk edit supplier information
- Filter items by supplier

### 📅 Daily Routine
- Track daily intake of pills, herbs/teas, and foods
- Log consumption times throughout the day
- View history of daily entries
- Automatically calculate daily lysine scores
- Link to your herbs, foods, and supplements catalog

### 📖 Daily Journal
- Log sleep hours and quality
- Track workouts with type and duration
- Monitor stress levels (1-5 scale)
- Record daily notes and observations
- Track which herbs and foods you consumed
- **Lysine Score Calculator**: Automatically calculates if you have a positive lysine score for the day

### 🔴 Outbreak Tracker
Track and analyze outbreak occurrences with detailed information:
- **When Occurred**: Record the exact date and optional time of outbreak start
- **Severity Tracking**: Rate outbreaks on a 1-5 scale (Mild to Extreme) with color-coded badges
- **Duration Tracking**: Track how long the outbreak lasted or mark as ongoing
- **Food Correlation**: Automatically tracks foods consumed before the outbreak
  - Set custom lookback period (e.g., 48 hours before outbreak)
  - See exactly what foods were eaten and when
  - Helps identify potential trigger foods
- **Symptoms & Triggers**: Document symptoms experienced and potential triggers
- **Statistics Dashboard**: View total outbreaks, ongoing count, average severity, and recent trends
- **Edit & Delete**: Full management of outbreak entries

### 📊 Consistency Tracker
- Visual calendar showing tracked days
- Current and longest streak tracking
- Weekly and monthly consistency percentages
- View detailed entry information for any date
- Identify patterns in your tracking habits

### 🩺 Testing Tracker
- Set up recurring health test reminders (customizable intervals)
- Get alerts for upcoming tests (within 2 weeks)
- Mark tests as complete to auto-schedule next test
- Track last test date and detailed notes
- Manage multiple test types

### ⚙️ Settings & Backup
- Export all data to JSON format
- Import data from backup files
- Manage data storage (IndexedDB)
- Clear all data option
- Cloud sync configuration (Supabase)

## 🔐 Authentication & Cloud Sync

**Supabase Integration** (Optional):
- Secure user authentication with email/password
- Real-time cloud synchronization across devices
- Data backup and recovery
- Offline-first architecture with automatic sync
- Conflict resolution for multi-device usage

**Local-First Design**:
- Works completely offline
- Data stored in browser's IndexedDB
- Progressive enhancement - sync features optional
- No account required for basic usage

## 📱 Mobile Experience

**Responsive Mobile Design**:
- Custom mobile header with branding
- Bottom navigation bar (5 primary tabs)
- Hamburger menu with drawer for secondary features
- Touch-optimized interface (44px minimum touch targets)
- Sticky header that stays visible on scroll
- Auth-aware UI elements

**Mobile Navigation**:
- **Bottom Bar**: Home (Dashboard), Herbs, Daily (Routine), Journal, Foods
- **Drawer Menu**: Suppliers, Outbreaks, Testing, Consistency, Settings
- **Sync Indicator**: Green/gray dot showing authentication status

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager (comes with Node.js)
- **Modern browser** with IndexedDB support

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd healing-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables (optional - for Supabase sync)**

Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

The built files will be in the `/dist` directory, ready to deploy.

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Modern utility-first CSS
- **Shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library
- **Vite 6** - Lightning-fast build tool and dev server
- **IndexedDB** - Client-side database for offline storage
- **Supabase** - Backend-as-a-Service (optional, for cloud sync)
- **Vercel Analytics** - Privacy-friendly analytics
- **Vite PWA Plugin** - Progressive Web App capabilities

## 📂 Project Structure

```
healing-tracker/
├── public/
│   ├── logo.png              # App logo icon
│   └── Transparent Logo.svg  # Full logo for desktop
├── src/
│   ├── components/
│   │   ├── ui/               # Shadcn UI components
│   │   ├── Auth.tsx          # Authentication component
│   │   ├── Dashboard.tsx     # Dashboard overview
│   │   ├── Herbs.tsx         # Herbs catalog
│   │   ├── Foods.tsx         # Foods catalog
│   │   ├── Suppliers.tsx     # Suppliers management
│   │   ├── DailyRoutine.tsx  # Daily routine tracker
│   │   ├── DailyJournal.tsx  # Daily journal
│   │   ├── OutbreakTracker.tsx      # Outbreak tracking
│   │   ├── ConsistencyTracker.tsx   # Consistency calendar
│   │   ├── TestingTracker.tsx       # Health test reminders
│   │   ├── Settings.tsx             # Settings & backup
│   │   └── SyncStatus.tsx           # Sync status indicator
│   ├── lib/
│   │   ├── indexedDB.ts      # IndexedDB utilities
│   │   ├── storage.ts        # Data storage layer
│   │   ├── migration.ts      # Data migration helpers
│   │   ├── auth.ts           # Authentication helpers
│   │   ├── supabase.ts       # Supabase client
│   │   ├── sync.ts           # Cloud sync logic
│   │   └── csvParser.ts      # CSV import/export
│   ├── stores/
│   │   ├── authStore.ts      # Auth state management
│   │   └── AuthProvider.tsx  # Auth context provider
│   ├── hooks/
│   │   └── useSync.ts        # Custom sync hook
│   ├── types/
│   │   └── supabase.ts       # TypeScript types for Supabase
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 💾 Data Storage

**IndexedDB (Primary)**:
- ✅ Fast, structured client-side storage
- ✅ Works offline
- ✅ Handles large datasets
- ✅ Automatically migrates from localStorage
- ⚠️ Local to your device/browser

**Supabase Cloud Sync (Optional)**:
- ✅ Cross-device synchronization
- ✅ Secure cloud backup
- ✅ Real-time updates
- ✅ Multi-user support (future)
- ℹ️ Requires account and internet connection

## 🎨 Customization

### Adding Custom Fonts

The app uses **Montserrat** for branding. Add more fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;600&display=swap" rel="stylesheet">
```

### Modifying Mobile Navigation

Edit `App.tsx` to customize:
- Bottom bar tabs (lines ~157-271)
- Drawer sections (lines ~377-608)
- Header branding (lines ~46-109)

### Theme Colors

Edit color variables in `src/index.css`:
```css
:root {
  --primary: #16a34a;     /* Green */
  --background: #f0fdf4;  /* Light green */
  /* Add more custom colors */
}
```

## 📊 Usage Tips

### Tracking Lysine:Arginine Ratio

**High Lysine Foods** (to increase):
- Chicken, turkey, fish
- Dairy products (cheese, yogurt, milk)
- Eggs
- Legumes (beans, lentils)

**High Arginine Foods** (to limit):
- Nuts (especially peanuts, walnuts)
- Seeds (pumpkin, sesame)
- Chocolate
- Whole grains

Aim for a **positive lysine score** daily by consuming more lysine than arginine.

### Identifying Outbreak Triggers

1. Track all food consumption in Daily Routine
2. Log outbreaks immediately when they occur
3. Use 48-hour lookback to see correlating foods
4. Review outbreak history for patterns
5. Adjust diet based on identified triggers

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- --port 3000
```

### Clear All Data (Reset App)
1. Open Settings tab
2. Scroll to Data Management
3. Click "Clear All Data"
4. Or: Open browser DevTools (F12) → Application → IndexedDB → Delete database

### Sync Issues
- Check internet connection
- Verify Supabase credentials in `.env.local`
- Check browser console for errors (F12)
- Try signing out and back in

### TypeScript Errors
```bash
# Check for errors
npm run type-check

# Restart TypeScript server in VS Code
# Ctrl/Cmd + Shift + P → "TypeScript: Restart TS Server"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables (Supabase credentials)
4. Deploy!

### Other Platforms
- **Netlify**: Drop `/dist` folder after `npm run build`
- **GitHub Pages**: Use `vite-plugin-pages` for routing
- **Your own server**: Serve files from `/dist` with any web server

## 🔮 Future Enhancements

- [ ] Multi-user support with role-based access
- [ ] Data visualization and trend charts
- [ ] Email/SMS reminders for testing
- [ ] Native mobile apps (iOS/Android)
- [ ] Photo uploads for meals and symptoms
- [ ] AI-powered trigger pattern detection
- [ ] Integration with wearable devices
- [ ] Community features and recipe sharing
- [ ] Nutritionist consultation features
- [ ] Custom reports and PDF export

## 🤝 Contributing

This is a personal health tracking project. Feel free to:
- Fork and customize for your needs
- Add new features
- Modify tracking metrics
- Improve the UI/UX
- Integrate with other health tools

## 📄 License

This project is for personal use.

## 💬 Support

For issues or questions:
1. Check the browser console for errors (F12)
2. Review TypeScript errors in your editor
3. Verify all dependencies are installed
4. Ensure you're using Node.js v16+
5. Check that IndexedDB is enabled in your browser

## 🙏 Credits

Built with modern web technologies and designed with accessibility in mind.

Special thanks to:
- **Shadcn/ui** for beautiful components
- **Supabase** for backend infrastructure
- **Lucide** for the icon library
- **Tailwind CSS** for styling utilities

---

**Start your healing journey today! 🌱**
