# Environment Configuration Guide

This application automatically detects whether you're running in **development** or **production** mode and configures the Azure AD redirect URI accordingly.

## How It Works

### Automatic Detection

The app uses Vite's built-in environment detection:

- **Development Mode** (`npm run dev`): Uses `http://localhost:3000`
- **Production Mode** (`npm run build`): Uses `https://testportal.thegetgroup.co.nz`

### Environment Files

#### `.env.development` (Committed to Git)
Used when running `npm run dev`
```env
VITE_APP_REDIRECT_URI=http://localhost:3000
VITE_API_URL=http://localhost:5000
```

#### `.env.production` (Committed to Git)
Used when running `npm run build`
```env
VITE_APP_REDIRECT_URI=https://testportal.thegetgroup.co.nz
VITE_API_URL=
```

#### `.env.local` (NOT Committed - Personal Overrides)
Create this file to override settings for your local machine
```env
# Example: Use a different production URL
VITE_APP_REDIRECT_URI=https://portal.thegetgroup.co.nz
```

## Usage

### Local Development
```bash
npm run dev
# Automatically uses http://localhost:3000
```

### Production Build
```bash
npm run build
# Automatically uses https://testportal.thegetgroup.co.nz
```

### Custom Override
Create `.env.local`:
```bash
echo "VITE_APP_REDIRECT_URI=https://my-custom-url.com" > .env.local
npm run dev
```

## Azure AD Configuration

Make sure your Azure AD app registration has **both** redirect URIs configured:

1. `http://localhost:3000` - For development
2. `https://testportal.thegetgroup.co.nz` - For production

## Benefits

✅ **No Manual Changes**: Switch between dev and production without editing code
✅ **Team Friendly**: Each developer can use their own settings via `.env.local`
✅ **Safe**: `.env.local` is gitignored, keeping personal settings private
✅ **Flexible**: Override any environment variable when needed

## Troubleshooting

### Issue: Redirects to wrong URL after login

**Solution**: Check which environment file is being used:
```bash
# Development
npm run dev
# Should use .env.development

# Production
npm run build
# Should use .env.production
```

### Issue: Want to test production URL locally

**Solution**: Create `.env.local`:
```env
VITE_APP_REDIRECT_URI=https://testportal.thegetgroup.co.nz
```

### Issue: Clear cached authentication

1. Open browser DevTools (F12)
2. Application tab → Storage → Clear site data
3. Refresh the page

## File Priority

Vite loads environment files in this order (later overrides earlier):

1. `.env` - Loaded in all cases
2. `.env.local` - Loaded in all cases, ignored by git
3. `.env.[mode]` - Only loaded in specified mode (development/production)
4. `.env.[mode].local` - Only loaded in specified mode, ignored by git

**Example**: If both `.env.development` and `.env.local` exist, values in `.env.local` take precedence.
