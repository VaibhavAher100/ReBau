# 🚨 Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### API Key Not Working

**Symptom:** Console error: "API key not configured" or "401 Unauthorized"

**Solutions:**

1. Check `.env.local` file exists in root directory:
```bash
ls -la .env.local
```

2. Verify the file contains the correct key:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

3. Ensure `VITE_` prefix is used (required for Vite)

4. Restart dev server after adding key:
```bash
# Stop server (Ctrl+C)
npm run dev
```

5. Verify API key is valid in [Google AI Studio](https://ai.google.dev/)

6. Check for extra spaces or quotes around the key

---

### Port Already in Use

**Symptom:** Error: "Port 5173 is already in use"

**Solutions:**

1. Use a different port:
```bash
npm run dev -- --port 3000
```

2. Kill the process using the port:
```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### npm install Fails

**Symptom:** Errors during dependency installation

**Solutions:**

1. Clear npm cache:
```bash
npm cache clean --force
```

2. Delete node_modules and package-lock.json:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Use legacy peer deps:
```bash
npm install --legacy-peer-deps
```

4. Update Node.js:
```bash
node --version  # Should be 18+
nvm install 18
nvm use 18
```

---

## Camera Issues

### Camera Not Accessible

**Symptom:** "Permission denied" or camera doesn't activate

**Solutions:**

**Chrome:**
1. Go to `chrome://settings/content/camera`
2. Check "Sites can ask to use your camera"
3. Remove any blocked sites

**Safari:**
1. Safari → Preferences → Websites → Camera
2. Select "Allow" for localhost

**Firefox:**
1. about:preferences#privacy
2. Permissions → Camera → Settings
3. Allow localhost

**Mobile:**
- Check app permissions in phone settings
- Enable camera for browser app

---

### File Upload Not Working

**Symptom:** Nothing happens when selecting file

**Solutions:**

1. Check file input is visible:
```typescript
// Make sure input element exists
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  onChange={handleFileChange}
/>
```

2. Verify file type is accepted:
```typescript
if (!file.type.startsWith('image/')) {
  console.error('Invalid file type:', file.type)
  return
}
```

3. Check console for errors

---

## AI Analysis Issues

### Image Analysis Fails

**Symptom:** "Failed to analyze material" error

**Solutions:**

1. Check image size (max 10MB):
```typescript
if (file.size > 10 * 1024 * 1024) {
  alert('File too large')
  return
}
```

2. Verify image format (JPEG, PNG, WebP):
```typescript
const validTypes = ['image/jpeg', 'image/png', 'image/webp']
if (!validTypes.includes(file.type)) {
  alert('Unsupported format')
  return
}
```

3. Check API quota:
- Visit [Google AI Studio](https://ai.google.dev/)
- Check usage limits
- Free tier has rate limits

4. Test with a simple image first

---

### Chat Not Responding

**Symptom:** Messages sent but no AI response

**Solutions:**

1. Check chat initialization:
```typescript
useEffect(() => {
  initChat()
}, [])
```

2. Verify model name is correct:
```typescript
model: "gemini-2.0-flash-exp"  // Must match available models
```

3. Check for function calling errors:
```typescript
try {
  const functionCall = response.functionCalls()?.[0]
  if (functionCall) {
    await handleFunctionCall(functionCall)
  }
} catch (error) {
  console.error('Function call error:', error)
}
```

4. Check console for detailed errors

---

## Build Issues

### Build Fails

**Symptom:** `npm run build` errors

**Solutions:**

1. Check TypeScript errors:
```bash
npx tsc --noEmit
```

2. Fix type errors before building

3. Clear build cache:
```bash
rm -rf dist .vite
npm run build
```

4. Check for missing dependencies:
```bash
npm install
```

---

### TypeScript Errors

**Symptom:** Type checking errors

**Solutions:**

1. Update TypeScript:
```bash
npm install typescript@latest --save-dev
```

2. Check tsconfig.json:
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

3. Add type definitions:
```typescript
// For missing types
declare module 'some-module'
```

---

## Runtime Issues

### Components Not Rendering

**Symptom:** Blank screen or components missing

**Solutions:**

1. Check browser console for errors

2. Verify imports are correct:
```typescript
import { Component } from './components/Component'
```

3. Check for key prop in lists:
```typescript
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

4. Verify conditional rendering:
```typescript
{isOpen && <Modal />}  // Modal won't show if isOpen is false
```

---

### State Not Updating

**Symptom:** UI doesn't reflect state changes

**Solutions:**

1. Don't mutate state directly:
```typescript
// ❌ Wrong
items.push(newItem)
setItems(items)

// ✅ Correct
setItems([...items, newItem])
```

2. Use functional updates:
```typescript
setCount(prev => prev + 1)  // Always use previous value
```

3. Check useEffect dependencies:
```typescript
useEffect(() => {
  fetchData()
}, [dependency])  // Add all used variables
```

---

### Infinite Re-renders

**Symptom:** "Maximum update depth exceeded" error

**Solutions:**

1. Don't set state in render:
```typescript
// ❌ Wrong
const Component = () => {
  setCount(count + 1)  // Causes infinite loop
  return <div>{count}</div>
}

// ✅ Correct
const Component = () => {
  useEffect(() => {
    setCount(count + 1)
  }, [])
  return <div>{count}</div>
}
```

2. Check useEffect dependencies:
```typescript
useEffect(() => {
  setItems([...items, newItem])
}, [items])  // items changes → useEffect runs → items changes → loop!

// Fix: remove items from dependencies or use functional update
useEffect(() => {
  setItems(prev => [...prev, newItem])
}, [newItem])
```

---

## Performance Issues

### Slow Rendering

**Symptom:** App feels laggy

**Solutions:**

1. Use React DevTools Profiler to identify slow components

2. Memoize expensive calculations:
```typescript
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0)
}, [items])
```

3. Use React.memo for pure components:
```typescript
const Card = React.memo(({ item }) => <div>{item.name}</div>)
```

4. Implement virtual scrolling for large lists

---

### Memory Leaks

**Symptom:** Browser tab uses more memory over time

**Solutions:**

1. Clean up effects:
```typescript
useEffect(() => {
  const interval = setInterval(fn, 1000)
  return () => clearInterval(interval)  // Cleanup
}, [])
```

2. Cancel pending requests:
```typescript
useEffect(() => {
  const controller = new AbortController()
  
  fetch(url, { signal: controller.signal })
  
  return () => controller.abort()
}, [])
```

3. Remove event listeners:
```typescript
useEffect(() => {
  const handler = () => {}
  window.addEventListener('scroll', handler)
  return () => window.removeEventListener('scroll', handler)
}, [])
```

---

## Mobile Issues

### App Not Responsive

**Symptom:** Layout broken on mobile

**Solutions:**

1. Add viewport meta tag in `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

2. Use responsive classes:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

3. Test on actual device or use browser dev tools mobile view

---

### Touch Events Not Working

**Symptom:** Buttons don't respond to touch

**Solutions:**

1. Ensure elements are large enough (min 44x44px)

2. Add touch feedback:
```typescript
<button className="active:scale-95 transition">
```

3. Check for pointer-events CSS:
```css
.element {
  pointer-events: auto; /* Not 'none' */
}
```

---

## Data Issues

### Items Not Showing

**Symptom:** Inventory or marketplace empty

**Solutions:**

1. Check filter settings:
```typescript
console.log('Active filter:', activeFilter)
console.log('Filtered items:', displayItems)
```

2. Verify data structure:
```typescript
console.log('Inventory:', inventory)
```

3. Check tab state:
```typescript
console.log('Active tab:', activeTab)
```

---

### Geolocation Not Working

**Symptom:** No location coordinates

**Solutions:**

1. Check browser permissions

2. Add error handling:
```typescript
navigator.geolocation.getCurrentPosition(
  position => {
    console.log('Coords:', position.coords)
  },
  error => {
    console.error('Geolocation error:', error)
    // Fallback to default location
  }
)
```

3. Test on HTTPS (required for geolocation)

---

## Getting Help

If issues persist:

1. **Check Console:** Open browser dev tools (F12)
2. **Enable Verbose Logging:** Add console.log statements
3. **Clear Cache:** Hard refresh (Ctrl+Shift+R)
4. **Test in Incognito:** Rule out extension conflicts
5. **Update Dependencies:** `npm update`
6. **Open Issue:** [GitHub Issues](https://github.com/HaarisIqubal/BauBay/issues)

---

## Debug Mode

Enable debug mode for detailed logging:

```typescript
// Add to App.tsx
const DEBUG = true

if (DEBUG) {
  console.log('State:', { inventory, cartItems, activeTab })
}
```

---

*For feature-specific issues, see respective documentation in [Features](../features/)*
