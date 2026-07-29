# Salla Theme Development - Auto Rebuild & Live Demo Setup

This guide helps you set up automatic rebuilding and live preview on your Salla demo store.

## 🚀 Quick Setup

### 1. GitHub Repository Setup

Your theme is already in a Git repository. Push it to GitHub:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_THEME_REPO.git

# Push to GitHub
git push -u origin main
```

**GitHub Repo Link**: [https://github.com/SallaApp/theme-raed](https://github.com/SallaApp/theme-raed) (base template)

### 2. Enable Auto-Rebuild with GitHub Actions

A GitHub Actions workflow has been created at `.github/workflows/deploy.yml` that will:
- Automatically build your theme when you push to `main` or `master` branch
- Deploy to your Salla demo store

### 3. Configure Salla Credentials

You need to add these secrets to your GitHub repository:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

   - `SALLA_THEME_ID`: Your theme ID from Salla Partners Portal
   - `SALLA_AUTH_TOKEN`: Your authentication token from Salla

### 4. Get Your Salla Credentials

#### From Salla Partners Portal:

1. Visit [Salla Partners Portal](https://salla.partners/)
2. Create/login to your account
3. Create a demo store for testing
4. Go to Themes section
5. Create a new theme or select existing one
6. Get your **Theme ID** and generate an **Auth Token**

### 5. Local Development Workflow

For local development with auto-watch:

```bash
# Install dependencies
npm install

# Start development mode with auto-rebuild
npm run watch

# Or build for production
npm run production
```

### 6. Using Salla CLI (Recommended for Live Preview)

Install Salla CLI for the best development experience:

```bash
# Install Salla CLI globally
npm install -g @salla.sa/cli

# Login to Salla
salla login

# Link your theme
salla link

# Start local development server with live reload
salla serve
```

This will:
- Watch for file changes
- Auto-rebuild your assets
- Push changes to your demo store automatically
- Show you a live preview URL

## 📁 Project Structure

```
theme-raed/
├── src/
│   ├── assets/          # CSS, JS, Images
│   ├── locales/         # Translation files
│   └── views/           # Twig templates
├── .github/
│   └── workflows/       # GitHub Actions
├── package.json
└── webpack.config.js
```

## 🔧 Available Scripts

- `npm run watch` - Development mode with auto-rebuild
- `npm run production` - Build for production
- `npm run development` - Build for development

## 📝 Making Changes

1. Edit your theme files in the `src/` directory
2. Save changes (if using `npm run watch` or `salla serve`, it auto-rebuilds)
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update theme styles"
   git push
   ```
4. GitHub Actions will automatically deploy to your demo store

## 🔗 Useful Links

- [Salla Documentation](https://docs.salla.dev/)
- [Salla CLI](https://www.npmjs.com/package/@salla.sa/cli)
- [Twilight Themes](https://docs.salla.dev/?nav=01HNFTD5Y5ESFQS3P9MJ0721VM)
- [Salla Partners Portal](https://salla.partners/)
- [Salla Developers Telegram](https://t.me/salladev)

## ⚙️ GitHub Secrets Required

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `SALLA_THEME_ID` | Your theme's unique ID | Salla Partners Portal |
| `SALLA_AUTH_TOKEN` | Authentication token | Salla Partners Portal |

## 🎯 Testing Flow

```
Make Changes → Git Push → GitHub Actions → Auto Build → Deploy to Demo Store → See Live!
```

Or for faster local testing:

```
Make Changes → salla serve → Auto Rebuild → Live Preview URL
```

---

**Need Help?** 
- Check [Salla Documentation](https://docs.salla.dev/)
- Join [Salla Developers Community](https://t.me/salladev)
