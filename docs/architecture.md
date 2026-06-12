# 🏗️ Architecture Overview

Understanding BauBay's system design and structure.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│                   (React Components)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Scanner  │  │Inventory │  │  Market  │  │ Profile ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                          │
├─────────────────────────────────────────────────────────┤
│                   State Management                       │
│                   (React Hooks)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  AI Services         │  │  Browser APIs        │   │
│  │  - Gemini (NLP)      │  │  - Camera            │   │
│  │  - PyTorch (ML)      │  │  - Geolocation       │   │
│  │  - ONEWare Studio    │  │                      │   │
│  └──────────────────────┘  └──────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend Framework
- **React 19.2.0**
  - Component-based architecture
  - Hooks for state management
  - Functional components only
  - No class components

### Language
- **TypeScript 5.8**
  - Strict type checking
  - Interface-driven development
  - Enum for constants
  - Type-safe props

### Build Tool
- **Vite 5.4**
  - Fast HMR (Hot Module Replacement)
  - Optimized builds
  - ES modules support
  - Development server

### AI Integration
- **Google Gemini API 1.30.0**
  - Gemini 2.5 Flash (natural language processing)
  - Gemini 2.0 Flash (chat assistant)
  - Function calling
  - Structured output

- **PyTorch ML Model**
  - Custom object detection model
  - Material recognition and classification
  - Trained on ONEWare Studio AI Platform
  - Real-time inference for material scanning

### Browser APIs
- **Camera API** - Image capture
- **Geolocation API** - Location tagging
- **File API** - Image processing

---

## Project Structure

```
baubay_2/
│
├── 📁 components/              # React Components
│   ├── Scanner.tsx            # AI material scanner
│   ├── InventoryCard.tsx      # Material card display
│   ├── ItemDetails.tsx        # Detail modal
│   ├── CartDrawer.tsx         # Shopping cart
│   ├── ChatAssistant.tsx      # AI chat
│   ├── ProfileModal.tsx       # User profile
│   └── NavBar.tsx             # Navigation
│
├── 📁 services/               # External Services
│   └── geminiService.ts       # Gemini API integration
│
├── 📁 docs/                   # Documentation
│   ├── README.md              # Docs index
│   ├── architecture.md        # This file
│   └── ...                    # Other docs
│
├── 📄 App.tsx                 # Main app component
├── 📄 index.tsx               # Entry point
├── 📄 types.ts                # TypeScript types
├── 📄 vite.config.ts          # Vite configuration
├── 📄 tsconfig.json           # TypeScript config
├── 📄 package.json            # Dependencies
└── 📄 .env.local              # Environment variables
```

---

## Component Architecture

### Hierarchy

```
App.tsx (Root)
├── NavBar
├── Scanner (Modal)
│   └── Editor View
├── Inventory View
│   └── InventoryCard (multiple)
│       └── ItemDetails (Modal)
├── Marketplace View
│   ├── InventoryCard (multiple)
│   │   └── ItemDetails (Modal)
│   └── ChatAssistant (FAB + Modal)
├── CartDrawer (Slide-in)
├── ProfileModal (Modal)
└── SustainabilityBoard
```

### Component Types

**1. Page Components**
- `App.tsx` - Main container
- Full state management
- Route-like tab switching

**2. Feature Components**
- `Scanner.tsx` - Complex workflows
- `ChatAssistant.tsx` - AI interactions
- Multi-step processes

**3. Display Components**
- `InventoryCard.tsx` - Pure presentation
- `NavBar.tsx` - Stateless UI
- Props-driven rendering

**4. Modal Components**
- `ItemDetails.tsx` - Overlay views
- `ProfileModal.tsx` - Full-screen modals
- `CartDrawer.tsx` - Slide-in panels

---

## Data Flow

### State Flow (Unidirectional)

```
User Action
    ↓
Event Handler
    ↓
State Update (useState)
    ↓
Re-render Components
    ↓
Updated UI
```

### Example: Adding Material

```typescript
// 1. User uploads image in Scanner
Scanner.handleFileChange()
    ↓
// 2. Call Gemini API
geminiService.analyzeMaterialImage()
    ↓
// 3. Return analysis results
AnalysisResult[]
    ↓
// 4. User confirms and saves
Scanner.handleSave()
    ↓
// 5. Update global state
App.handleAddItem()
    ↓
// 6. State update triggers re-render
setInventory([newItem, ...prev])
    ↓
// 7. UI shows new material
InventoryCard renders
```

---

## State Management Strategy

### Local State (useState)
```typescript
// Component-specific state
const [isOpen, setIsOpen] = useState(false)
const [inputValue, setInputValue] = useState('')
```

### Lifted State (Props)
```typescript
// Shared between siblings via parent
<App>
  <Scanner onAdd={handleAdd} />
  <Inventory items={items} />
</App>
```

### Derived State (useMemo)
```typescript
// Computed from existing state
const filteredItems = useMemo(() => {
  return items.filter(i => i.category === filter)
}, [items, filter])
```

### Side Effects (useEffect)
```typescript
// Real-time updates
useEffect(() => {
  const interval = setInterval(fetchNewItems, 15000)
  return () => clearInterval(interval)
}, [])
```

---

## API Integration Pattern

### Service Layer

```typescript
// services/geminiService.ts
export const analyzeMaterialImage = async (
  image: string
): Promise<AnalysisResult[]> => {
  // Encapsulated API logic
  const response = await ai.models.generateContent({...})
  return parseResponse(response)
}
```

### Component Usage

```typescript
// components/Scanner.tsx
const handleAnalyze = async () => {
  try {
    setIsLoading(true)
    const results = await analyzeMaterialImage(image)
    setDetectedItems(results)
  } catch (error) {
    showError("Analysis failed")
  } finally {
    setIsLoading(false)
  }
}
```

---

## Routing Strategy

### Tab-Based Navigation

```typescript
const [activeTab, setActiveTab] = useState<'inventory' | 'market'>('inventory')

// Conditional rendering
{activeTab === 'inventory' ? (
  <InventoryView items={myItems} />
) : (
  <MarketplaceView items={publicItems} />
)}
```

**Why no React Router?**
- Single-page experience
- Modal-based navigation
- Simpler state management
- Faster transitions

---

## Performance Considerations

### Optimization Techniques

**1. Memoization**
```typescript
// Expensive calculations
const total = useMemo(() => 
  items.reduce((sum, i) => sum + i.value, 0),
  [items]
)
```

**2. Lazy Loading**
```typescript
// Components loaded on demand
{isModalOpen && <ItemDetails item={item} />}
```

**3. Debouncing**
```typescript
// Delayed function execution
const debouncedSearch = useDebounce(searchTerm, 300)
```

**4. Virtual Scrolling** (Future)
```typescript
// Render only visible items
<VirtualList items={largeArray} />
```

---

## Security Considerations

### API Key Protection
```typescript
// ❌ Never expose in client code
const apiKey = "AIzaSyC..."

// ✅ Use environment variables
const apiKey = process.env.API_KEY
```

### Input Validation
```typescript
// Sanitize user input
const cleanInput = input.trim().slice(0, 100)

// Validate file types
if (!file.type.startsWith('image/')) {
  throw new Error('Invalid file type')
}
```

### HTTPS Only
- All API calls use HTTPS
- No sensitive data in URLs
- Secure cookie handling (future auth)

---

## Scalability Path

### Current Architecture
- ✅ Component-based (easy to extend)
- ✅ Type-safe (fewer bugs)
- ✅ Modular (independent features)
- ⚠️ Client-side only
- ⚠️ No database

### Future Enhancements
1. **Backend API** - Node.js/Express
2. **Database** - Firebase/Supabase
3. **Authentication** - JWT tokens
4. **Real-time** - WebSockets
5. **CDN** - Image optimization
6. **Caching** - Redis for performance

---

## Design Patterns Used

### 1. Component Composition
```typescript
<Modal>
  <Header />
  <Content />
  <Footer />
</Modal>
```

### 2. Render Props
```typescript
<DataProvider>
  {(data) => <Display data={data} />}
</DataProvider>
```

### 3. Custom Hooks (Future)
```typescript
const { items, loading, error } = useInventory()
```

### 4. HOC Pattern (Future)
```typescript
const WithAuth = (Component) => (props) => {
  // Auth logic
  return <Component {...props} />
}
```

---

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Mobile Safari | iOS 14+ | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full |

**Required APIs:**
- ES6+ JavaScript
- Camera API
- Geolocation API
- Flexbox/Grid CSS

---

## Development Workflow

```
1. Feature Branch
   ↓
2. Local Development (npm run dev)
   ↓
3. Manual Testing
   ↓
4. Type Checking (tsc --noEmit)
   ↓
5. Build Test (npm run build)
   ↓
6. Pull Request
   ↓
7. Code Review
   ↓
8. Merge to Main
   ↓
9. Deploy
```

---

## Key Design Decisions

### 1. Why React 19?
- Latest features
- Improved performance
- Better TypeScript support
- Future-proof

### 2. Why Vite over CRA?
- 10x faster dev server
- Optimized builds
- Modern tooling
- ES modules native

### 3. Why Gemini + PyTorch?
- **Gemini:** Free tier generous, multimodal support, function calling
- **PyTorch:** Custom object detection, precise material recognition
- **ONEWare Studio:** Specialized construction material training dataset
- **Hybrid approach:** NLP + Computer Vision for comprehensive analysis

### 4. Why No State Library?
- Simple state needs
- React hooks sufficient
- Fewer dependencies
- Easier maintenance

---

## Next Steps

- Read [Components Documentation](./components.md)
- Learn [State Management](./development/state-management.md)
- Explore [API Integration](./development/api-integration.md)

---

*Architecture evolves with project needs. This document reflects current state as of November 23, 2025.*
