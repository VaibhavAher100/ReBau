# 🧩 Components Documentation

Detailed documentation for all BauBay React components.

## Component Index

1. [App.tsx](#apptsx---main-application)
2. [Scanner.tsx](#scannertsx---ai-material-scanner)
3. [InventoryCard.tsx](#inventorycardtsx---material-card)
4. [ItemDetails.tsx](#itemdetailstsx---detail-modal)
5. [CartDrawer.tsx](#cartdrawertsx---shopping-cart)
6. [ChatAssistant.tsx](#chatassistanttsx---ai-chat)
7. [ProfileModal.tsx](#profilemodaltsx---user-profile)
8. [NavBar.tsx](#navbartsx---bottom-navigation)

---

## App.tsx - Main Application

**Purpose:** Root component managing global state and app structure.

### Props
None (root component)

### State Variables

```typescript
// View State
activeTab: 'inventory' | 'market'     // Current tab
activeFilter: string                   // Category filter
isScanning: boolean                    // Scanner modal open
notification: string | null            // Toast message

// Data State
inventory: MaterialItem[]              // All materials
cartItems: MaterialItem[]              // Cart items
requests: MaterialRequest[]            // User requests
selectedItem: MaterialItem | null      // Detail view

// UI State
isCartOpen: boolean
isChatOpen: boolean
isProfileOpen: boolean
prefsOpen: boolean
notifPreferences: string[]
```

### Key Functions

**handleAddItem**
```typescript
const handleAddItem = (
  analysis: AnalysisResult,
  image: string,
  quantity: string,
  location: string,
  value: number,
  coords?: { lat: number; lng: number }
) => {
  const newItem: MaterialItem = {
    id: generateId(),
    ...analysis,
    imageUrl: image,
    quantity,
    estimatedValue: value,
    location,
    coordinates: coords,
    isMine: true,
    isPublished: false
  }
  setInventory(prev => [newItem, ...prev])
  showNotification(`Added ${newItem.name}`)
}
```

**handlePublishItem**
```typescript
const handlePublishItem = (id: string, updates: Partial<MaterialItem>) => {
  setInventory(prev => prev.map(item =>
    item.id === id ? { ...item, ...updates, isPublished: true } : item
  ))
  showNotification("Item published to marketplace!")
}
```

**handleCheckout**
```typescript
const handleCheckout = () => {
  const newRequest: MaterialRequest = {
    id: Date.now().toString(),
    requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    items: [...cartItems],
    date: new Date().toISOString(),
    status: RequestStatus.PENDING,
    totalValue: cartItems.reduce((sum, i) => sum + i.estimatedValue, 0)
  }
  setRequests(prev => [newRequest, ...prev])
  setCartItems([])
}
```

### Effects

**Real-time Marketplace Updates**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const newItem = generateMockItem()
    setInventory(prev => [newItem, ...prev])
    
    // Check notification preferences
    if (matchesPreferences(newItem)) {
      showNotification(`🔔 New ${newItem.name} available!`)
    }
  }, 15000)
  
  return () => clearInterval(interval)
}, [notifPreferences])
```

### Sub-Components

**SustainabilityBoard**
- Displays environmental impact metrics
- Animated counters
- Monthly CO₂ chart
- Detail modal

**AnimatedCounter**
- Smooth number animations
- Easing functions
- Customizable suffix

---

## Scanner.tsx - AI Material Scanner

**Purpose:** Capture and analyze construction materials using AI.

### Props

```typescript
interface ScannerProps {
  onAddInventory: (
    analysis: AnalysisResult,
    image: string,
    quantity: string,
    location: string,
    value: number,
    coords?: { lat: number; lng: number }
  ) => void
  onCancel: () => void
}
```

### View States

```typescript
type ViewState = 'camera' | 'analyzing' | 'results' | 'editing'
```

### State Variables

```typescript
const [image, setImage] = useState<string | null>(null)
const [viewState, setViewState] = useState<ViewState>('camera')
const [detectedItems, setDetectedItems] = useState<AnalysisResult[]>([])
const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set())
const [editingIndex, setEditingIndex] = useState<number | null>(null)
const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number}>()

// Editor state
const [name, setName] = useState('')
const [category, setCategory] = useState<MaterialCategory>()
const [condition, setCondition] = useState<Condition>()
const [description, setDescription] = useState('')
const [quantity, setQuantity] = useState('1')
const [location, setLocation] = useState('Site Location')
const [estimatedValue, setEstimatedValue] = useState('0')
```

### Key Functions

**handleFileChange**
```typescript
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Convert to base64
  const reader = new FileReader()
  reader.onloadend = () => {
    setImage(reader.result as string)
    setViewState('camera')
  }
  reader.readAsDataURL(file)
}
```

**handleAnalyze**
```typescript
const handleAnalyze = async () => {
  if (!image) return
  
  setViewState('analyzing')
  try {
    const results = await analyzeMaterialImage(image)
    setDetectedItems(results)
    setViewState('results')
  } catch (error) {
    console.error('Analysis error:', error)
    // Show error and return to camera
    setViewState('camera')
  }
}
```

**handleSave**
```typescript
const handleSave = (index: number) => {
  const item = detectedItems[index]
  onAddInventory(
    item,
    image!,
    item.quantity,
    location,
    item.estimatedValue,
    locationCoords
  )
  setAddedIndices(prev => new Set(prev).add(index))
}
```

### UI Views

**1. Camera View**
- File upload input
- Camera capture button
- Preview of selected image
- Analyze button

**2. Analyzing View**
- Loading spinner
- "AI analyzing materials..." message
- Cancel option

**3. Results View**
- Grid of detected materials
- Bounding boxes on image
- Save/Edit buttons per item
- "Added" indicators

**4. Editing View**
- Form fields for manual entry
- Category dropdown
- Condition selector
- Price and quantity inputs
- Save/Cancel buttons

---

## InventoryCard.tsx - Material Card

**Purpose:** Display material information in card format.

### Props

```typescript
interface InventoryCardProps {
  item: MaterialItem
  isMarketplace: boolean
  onClick: (item: MaterialItem) => void
}
```

### Features

- Category badge with color
- Condition pill
- Reusability score indicator
- Distance (marketplace only)
- Internal match tag
- Hover effects
- Click to view details

### Visual Indicators

```typescript
// Category colors
const categoryColors = {
  Wood: 'bg-amber-100 text-amber-700',
  Metal: 'bg-slate-100 text-slate-700',
  Concrete: 'bg-stone-100 text-stone-700',
  Brick: 'bg-red-100 text-red-700',
  // ...
}

// Reusability badge
const getReusabilityColor = (score: number) => {
  if (score >= 85) return 'bg-emerald-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}
```

### Layout

```tsx
<div className="card-container">
  <div className="image-wrapper">
    <img src={item.imageUrl} />
    <span className="category-badge">{item.category}</span>
    {item.distance && <span className="distance">{item.distance}</span>}
  </div>
  
  <div className="content">
    <h3>{item.name}</h3>
    <p className="description">{item.description}</p>
    
    <div className="metadata">
      <span className="condition">{item.condition}</span>
      <span className="quantity">{item.quantity}</span>
    </div>
    
    <div className="footer">
      <span className="value">€{item.estimatedValue}</span>
      <span className="reusability">{item.reusabilityScore}%</span>
    </div>
  </div>
</div>
```

---

## ItemDetails.tsx - Detail Modal

**Purpose:** Full-screen material detail view with actions.

### Props

```typescript
interface ItemDetailsProps {
  item: MaterialItem
  onClose: () => void
  isMarketplace: boolean
  onAddToCart: (item: MaterialItem) => void
  onOpenCart: () => void
  isInCart: boolean
  onPublish: (id: string, updates: Partial<MaterialItem>) => void
}
```

### Sections

**1. Header**
- Close button
- Category badge
- Material name

**2. Image Gallery**
- Large image display
- Zoom capability (future)
- Multiple images (future)

**3. Details Grid**
```tsx
<div className="details-grid">
  <InfoRow label="Condition" value={item.condition} />
  <InfoRow label="Quantity" value={item.quantity} />
  <InfoRow label="Reusability" value={`${item.reusabilityScore}%`} />
  <InfoRow label="Value" value={`€${item.estimatedValue}`} />
  <InfoRow label="Location" value={item.location} />
  <InfoRow label="Added" value={formatDate(item.dateAdded)} />
</div>
```

**4. Description**
- Full material description
- Suggested actions

**5. Location Info**
- Pickup times
- Access requirements
- Map link (coordinates)

**6. Action Buttons**

For marketplace items:
```tsx
<button onClick={() => onAddToCart(item)}>
  {isInCart ? 'In Cart ✓' : 'Add to Cart'}
</button>
{isInCart && (
  <button onClick={onOpenCart}>Go to Cart</button>
)}
```

For my items:
```tsx
{!item.isPublished ? (
  <button onClick={handlePublish}>Publish to Marketplace</button>
) : (
  <span>Published ✓</span>
)}
```

### Publishing Workflow

```typescript
const [showPublishModal, setShowPublishModal] = useState(false)
const [publishData, setPublishData] = useState({
  pickupTimes: '',
  accessRequirements: '',
  estimatedValue: item.estimatedValue
})

const handlePublish = () => {
  onPublish(item.id, publishData)
  onClose()
}
```

---

## CartDrawer.tsx - Shopping Cart

**Purpose:** Review and checkout marketplace materials.

### Props

```typescript
interface CartDrawerProps {
  items: MaterialItem[]
  onRemove: (id: string) => void
  onCheckout: () => void
  onClose: () => void
}
```

### Features

- Slide-in animation from right
- Item list with images
- Remove item buttons
- Total value calculation
- Request materials button
- Empty state message

### Layout

```tsx
<div className="drawer-overlay" onClick={onClose}>
  <div className="drawer-panel" onClick={e => e.stopPropagation()}>
    <header>
      <h2>Cart ({items.length})</h2>
      <button onClick={onClose}>×</button>
    </header>
    
    <div className="items-list">
      {items.map(item => (
        <CartItem key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
    
    <footer>
      <div className="total">
        Total: €{items.reduce((sum, i) => sum + i.estimatedValue, 0)}
      </div>
      <button onClick={onCheckout}>Request Materials</button>
    </footer>
  </div>
</div>
```

---

## ChatAssistant.tsx - AI Chat

**Purpose:** Natural language material search using Gemini AI.

### Props

```typescript
interface ChatAssistantProps {
  inventory: MaterialItem[]
  onAddToCart: (item: MaterialItem) => void
  onClose: () => void
}
```

### State

```typescript
interface Message {
  id: string
  role: 'user' | 'model' | 'system'
  text: string
  item?: MaterialItem
}

const [messages, setMessages] = useState<Message[]>([...])
const [inputText, setInputText] = useState('')
const [isLoading, setIsLoading] = useState(false)
const chatSessionRef = useRef<any>(null)
```

### AI Functions

**search_materials**
```typescript
{
  name: "search_materials",
  description: "Search for materials in the marketplace",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING },
      condition: { type: Type.STRING },
      max_price: { type: Type.NUMBER },
      min_reusability: { type: Type.NUMBER },
      location: { type: Type.STRING }
    }
  }
}
```

**add_to_cart**
```typescript
{
  name: "add_to_cart",
  description: "Add a material to the cart",
  parameters: {
    type: Type.OBJECT,
    properties: {
      material_id: { 
        type: Type.STRING,
        description: "The ID of the material to add"
      }
    },
    required: ["material_id"]
  }
}
```

### Message Flow

```typescript
const handleSend = async () => {
  // Add user message
  const userMsg = { id: generateId(), role: 'user', text: inputText }
  setMessages(prev => [...prev, userMsg])
  
  setIsLoading(true)
  try {
    // Send to Gemini
    const response = await chatSession.sendMessage(inputText)
    
    // Handle function calls
    const functionCall = response.functionCalls()?.[0]
    if (functionCall) {
      await handleFunctionCall(functionCall)
    }
    
    // Add AI response
    const aiMsg = { id: generateId(), role: 'model', text: response.text }
    setMessages(prev => [...prev, aiMsg])
  } catch (error) {
    // Error handling
  } finally {
    setIsLoading(false)
  }
}
```

---

## ProfileModal.tsx - User Profile

**Purpose:** Display user info and request history.

### Props

```typescript
interface ProfileModalProps {
  requests: MaterialRequest[]
  onClose: () => void
}
```

### Tabs

**1. Profile Tab**
```tsx
<div className="profile-info">
  <div className="avatar">SM</div>
  <h2>Site Manager</h2>
  <p>Construction Pro</p>
  
  <div className="stats">
    <Stat label="Materials Added" value={totalMaterials} />
    <Stat label="Total Value" value={`€${totalValue}`} />
    <Stat label="Requests" value={requests.length} />
  </div>
</div>
```

**2. Requests Tab**
```tsx
<div className="requests-list">
  {requests.map(request => (
    <RequestCard key={request.id} request={request} />
  ))}
</div>
```

### Request Card

```tsx
<div className="request-card">
  <div className="header">
    <span className="request-id">{request.requestId}</span>
    <StatusBadge status={request.status} />
  </div>
  
  <div className="items">
    {request.items.map(item => (
      <span className="item-chip">{item.name}</span>
    ))}
  </div>
  
  <div className="footer">
    <span className="date">{formatDate(request.date)}</span>
    <span className="total">€{request.totalValue}</span>
  </div>
</div>
```

---

## NavBar.tsx - Bottom Navigation

**Purpose:** Primary app navigation.

### Props

```typescript
interface NavBarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}
```

### Tabs

```tsx
const tabs = [
  { id: 'inventory', icon: '📦', label: 'Inventory' },
  { id: 'scan', icon: '➕', label: 'Scan' },
  { id: 'market', icon: '🏪', label: 'Market' }
]

<nav className="bottom-nav">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={activeTab === tab.id ? 'active' : ''}
    >
      <span className="icon">{tab.icon}</span>
      <span className="label">{tab.label}</span>
    </button>
  ))}
</nav>
```

---

## Common Patterns

### Modal Pattern
```typescript
{isOpen && (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      {/* Content */}
    </div>
  </div>
)}
```

### Loading State
```typescript
{isLoading ? (
  <Spinner />
) : (
  <Content />
)}
```

### Empty State
```typescript
{items.length === 0 ? (
  <EmptyState message="No items found" />
) : (
  <ItemList items={items} />
)}
```

---

*For implementation examples, see [Code Examples](./reference/code-examples.md)*
