# 🚀 Installation Guide

Complete guide to setting up BauBay on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`
  
- **npm** (v9.0.0 or higher) or **yarn**
  - Comes with Node.js
  - Verify: `npm --version`

- **Google Gemini API Key**
  - Get yours at [Google AI Studio](https://ai.google.dev/)
  - Free tier available

### Recommended
- **Git** - For version control
- **VS Code** - Recommended editor
- **Chrome/Edge** - For testing (camera API support)

---

## Step-by-Step Installation

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/HaarisIqubal/BauBay.git

# Or using SSH
git clone git@github.com:HaarisIqubal/BauBay.git

# Navigate to project directory
cd BauBay
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This will install:
- React 19.2.0
- TypeScript 5.8
- Vite 5.4
- @google/genai 1.30.0
- All dev dependencies

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add your Gemini API key:

```env
# .env.local
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Important:** 
- Never commit `.env.local` to version control
- The `.gitignore` file already excludes it
- Use `VITE_` prefix for environment variables in Vite

### 4. Verify Installation

Run the development server:

```bash
npm run dev
```

You should see:

```
VITE v5.4.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### 5. Open in Browser

Navigate to `http://localhost:5173`

You should see the BauBay interface with:
- ✅ Sustainability Dashboard
- ✅ Material inventory
- ✅ Bottom navigation
- ✅ Scan button

---

## Getting Your Gemini API Key

1. **Visit Google AI Studio**
   - Go to [ai.google.dev](https://ai.google.dev/)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Get API Key"
   - Select or create a project
   - Copy the generated key

3. **Add to Environment**
   - Paste into `.env.local`
   - Restart dev server

4. **Test Integration**
   - Click "Scan New Items" in app
   - Upload an image
   - Verify AI analysis works

---

## Troubleshooting Installation

### Node Version Issues

```bash
# Check Node version
node --version

# If outdated, use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Port Already in Use

```bash
# Error: Port 5173 is already in use
# Solution: Use a different port
npm run dev -- --port 3000
```

### Permission Errors

```bash
# On macOS/Linux
sudo npm install

# Or fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Dependency Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### API Key Not Working

1. Check `.env.local` exists in root directory
2. Verify `VITE_` prefix is used
3. Restart dev server after adding key
4. Check API key is valid in Google AI Studio
5. Ensure no extra spaces in the key

### Camera Not Accessible

- **Chrome:** Settings → Privacy → Camera → Allow
- **Safari:** Preferences → Websites → Camera → Allow
- **Firefox:** Preferences → Privacy & Security → Permissions → Camera

---

## Build for Production

```bash
# Create optimized build
npm run build

# Output will be in /dist folder
# Preview production build
npm run preview
```

---

## Docker Installation (Optional)

Coming soon - containerized deployment option.

---

## Next Steps

✅ Installation complete! Now:

1. Read the [Quick Start Guide](./quick-start.md)
2. Explore [Architecture Overview](./architecture.md)
3. Try [Code Examples](./reference/code-examples.md)

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | v18.0.0 | v20.0.0+ |
| RAM | 4 GB | 8 GB+ |
| Disk Space | 500 MB | 1 GB |
| Browser | Chrome 90+ | Chrome/Edge Latest |

---

## Additional Tools

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Browser Extensions

- **React DevTools** - Component inspection
- **Redux DevTools** - State debugging (future)

---

*Need help? Check [Troubleshooting](./reference/troubleshooting.md) or open an issue.*
