# 💡 Code Examples

Practical code examples and common patterns used in BauBay.

## Table of Contents
- [State Management](#state-management)
- [API Calls](#api-calls)
- [Component Patterns](#component-patterns)
- [Event Handlers](#event-handlers)
- [Data Transformations](#data-transformations)
- [UI Patterns](#ui-patterns)

---

## State Management

### Basic State

```typescript
// Simple state
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
const [text, setText] = useState('')

// Object state
const [user, setUser] = useState({
  name: 'Site Manager',
  email: 'manager@site.com'
})

// Array state
const [items, setItems] = useState<MaterialItem[]>([])
```

### Updating State

```typescript
// Add item to array
setItems(prev => [newItem, ...prev])

// Remove item from array
setItems(prev => prev.filter(item => item.id !== idToRemove))

// Update item in array
setItems(prev => prev.map(item =>
  item.id === idToUpdate ? { ...item, ...updates } : item
))

// Toggle boolean
setIsOpen(prev => !prev)

// Increment number
setCount(prev => prev + 1)
```

### Derived State with useMemo

```typescript
// Filter and sort - expensive operation
const filteredItems = useMemo(() => {
  return inventory
    .filter(item => item.category === activeFilter)
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
}, [inventory, activeFilter])

// Calculate totals
const totalValue = useMemo(() => {
  return items.reduce((sum, item) => sum + item.estimatedValue, 0)
}, [items])

// Complex transformation
const groupedByCategory = useMemo(() => {
  return items.reduce((acc, item) => {
    const cat = item.category
    return { ...acc, [cat]: [...(acc[cat] || []), item] }
  }, {} as Record<MaterialCategory, MaterialItem[]>)
}, [items])
```

---

## API Calls

### Gemini Image Analysis

```typescript
import { analyzeMaterialImage } from '../services/geminiService'

const handleAnalyze = async (image: string) => {
  setIsLoading(true)
  setError(null)
  
  try {
    const results = await analyzeMaterialImage(image)
    setDetectedItems(results)
    setViewState('results')
  } catch (error) {
    console.error('Analysis failed:', error)
    setError('Failed to analyze image. Please try again.')
  } finally {
    setIsLoading(false)
  }
}
```

### Gemini Chat

```typescript
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY })

const initChat = async () => {
  const chat = ai.models.startChat({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "You are a construction materials assistant...",
    history: previousMessages,
    tools: {
      functionDeclarations: [
        {
          name: "search_materials",
          description: "Search for materials",
          parameters: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              max_price: { type: Type.NUMBER }
            }
          }
        }
      ]
    }
  })
  
  chatSessionRef.current = chat
}

const sendMessage = async (text: string) => {
  const chat = chatSessionRef.current
  const response = await chat.sendMessage(text)
  return response.text
}
```

---

## Component Patterns

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Usage
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <h2>Modal Title</h2>
  <p>Modal content</p>
</Modal>
```

### List with Empty State

```typescript
const ItemList: React.FC<{ items: MaterialItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-semibold">No items found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <InventoryCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### Loading State

```typescript
const DataComponent: React.FC = () => {
  const [data, setData] = useState<MaterialItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="font-semibold">Error: {error}</p>
        <button onClick={fetchData} className="mt-4 btn-primary">
          Retry
        </button>
      </div>
    )
  }
  
  return <ItemList items={data} />
}
```

---

## Event Handlers

### File Upload

```typescript
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('File too large. Max 10MB')
    return
  }
  
  // Convert to base64
  const reader = new FileReader()
  reader.onloadend = () => {
    const base64 = reader.result as string
    setImage(base64)
    handleAnalyze(base64)
  }
  reader.onerror = () => {
    alert('Failed to read file')
  }
  reader.readAsDataURL(file)
}

// JSX
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  capture="environment"
  onChange={handleFileChange}
  className="hidden"
/>
<button onClick={() => fileInputRef.current?.click()}>
  Upload Image
</button>
```

### Form Submission

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validation
  if (!name.trim()) {
    showNotification('Name is required')
    return
  }
  
  if (estimatedValue < 0) {
    showNotification('Value must be positive')
    return
  }
  
  // Create item
  const newItem: MaterialItem = {
    id: Date.now().toString(),
    name: name.trim(),
    description: description.trim(),
    category,
    condition,
    reusabilityScore,
    estimatedValue,
    quantity,
    location,
    imageUrl: image,
    dateAdded: new Date().toISOString(),
    isAvailable: true,
    isMine: true,
    isPublished: false
  }
  
  // Save
  onAddItem(newItem)
  
  // Reset form
  setName('')
  setDescription('')
  setEstimatedValue(0)
}
```

### Debounced Search

```typescript
const [searchTerm, setSearchTerm] = useState('')
const [debouncedTerm, setDebouncedTerm] = useState('')

// Debounce effect
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedTerm(searchTerm)
  }, 300)
  
  return () => clearTimeout(timer)
}, [searchTerm])

// Search when debounced term changes
useEffect(() => {
  if (debouncedTerm) {
    performSearch(debouncedTerm)
  }
}, [debouncedTerm])

// JSX
<input
  type="text"
  value={searchTerm}
  onChange={e => setSearchTerm(e.target.value)}
  placeholder="Search materials..."
/>
```

---

## Data Transformations

### Filter Materials

```typescript
// By category
const woodItems = inventory.filter(
  item => item.category === MaterialCategory.WOOD
)

// By multiple conditions
const availableHighValue = inventory.filter(item =>
  item.isAvailable &&
  item.estimatedValue >= 300 &&
  item.reusabilityScore >= 70
)

// By search term
const searchResults = inventory.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.description.toLowerCase().includes(searchTerm.toLowerCase())
)
```

### Sort Materials

```typescript
// By value (descending)
const sortedByValue = [...inventory].sort((a, b) =>
  b.estimatedValue - a.estimatedValue
)

// By date (newest first)
const sortedByDate = [...inventory].sort((a, b) =>
  new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
)

// By multiple criteria
const sorted = [...inventory].sort((a, b) => {
  // First by category
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category)
  }
  // Then by value
  return b.estimatedValue - a.estimatedValue
})
```

### Group Materials

```typescript
// Group by category
const groupedByCategory = inventory.reduce((acc, item) => {
  const cat = item.category
  if (!acc[cat]) acc[cat] = []
  acc[cat].push(item)
  return acc
}, {} as Record<MaterialCategory, MaterialItem[]>)

// Group by condition
const groupedByCondition = inventory.reduce((acc, item) => {
  const cond = item.condition
  return {
    ...acc,
    [cond]: [...(acc[cond] || []), item]
  }
}, {} as Record<Condition, MaterialItem[]>)
```

### Calculate Statistics

```typescript
// Total value
const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0)

// Average reusability
const avgReusability = items.length > 0
  ? items.reduce((sum, item) => sum + item.reusabilityScore, 0) / items.length
  : 0

// Count by category
const categoryCount = items.reduce((acc, item) => ({
  ...acc,
  [item.category]: (acc[item.category] || 0) + 1
}), {} as Record<MaterialCategory, number>)

// Find highest value item
const highestValue = items.reduce((max, item) =>
  item.estimatedValue > max.estimatedValue ? item : max,
  items[0]
)
```

---

## UI Patterns

### Conditional Rendering

```typescript
// Simple condition
{isLoggedIn && <UserMenu />}

// Ternary operator
{isLoading ? <Spinner /> : <Content />}

// Multiple conditions
{status === 'loading' && <Spinner />}
{status === 'error' && <ErrorMessage />}
{status === 'success' && <SuccessView />}

// Switch-like pattern
{(() => {
  switch (viewState) {
    case 'camera': return <CameraView />
    case 'analyzing': return <AnalyzingView />
    case 'results': return <ResultsView />
    default: return null
  }
})()}
```

### Dynamic Classes

```typescript
// Template literal
<div className={`card ${isActive ? 'active' : ''}`} />

// With multiple conditions
<div className={`
  card
  ${isActive ? 'bg-blue-500' : 'bg-gray-200'}
  ${isLarge ? 'text-xl' : 'text-base'}
  ${isDisabled && 'opacity-50 cursor-not-allowed'}
`} />

// Using clsx library (if installed)
import clsx from 'clsx'

<div className={clsx(
  'card',
  isActive && 'active',
  isLarge && 'large',
  { disabled: isDisabled }
)} />
```

### List Rendering

```typescript
// Basic list
<ul>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>

// With index
{items.map((item, index) => (
  <div key={item.id} className="item">
    <span className="index">{index + 1}</span>
    <span className="name">{item.name}</span>
  </div>
))}

// With animation delay
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <ItemCard item={item} />
  </div>
))}
```

### Notifications

```typescript
const [notification, setNotification] = useState<string | null>(null)

const showNotification = (message: string, duration = 5000) => {
  setNotification(message)
  setTimeout(() => setNotification(null), duration)
}

// In render
{notification && (
  <div className="fixed top-4 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
    {notification}
  </div>
)}

// Usage
showNotification('Material added successfully!')
```

---

## Performance Patterns

### Prevent Re-renders

```typescript
// Use React.memo for pure components
const ItemCard = React.memo<ItemCardProps>(({ item }) => {
  return <div>{item.name}</div>
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.item.id === nextProps.item.id
})

// Use useCallback for functions
const handleClick = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id))
}, [])

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return items.reduce((acc, item) => {
    // Complex calculation
    return acc + calculateComplexValue(item)
  }, 0)
}, [items])
```

### Lazy Loading

```typescript
// Load component on demand
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Spinner />}>
  <HeavyComponent />
</Suspense>

// Load data on scroll
const loadMore = useCallback(() => {
  if (isLoading || !hasMore) return
  setPage(prev => prev + 1)
}, [isLoading, hasMore])

useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      loadMore()
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [loadMore])
```

---

*See [Components](./components.md) for component-specific examples*
