# 🎯 TypeScript Types Reference

Complete reference for all TypeScript types, interfaces, and enums used in BauBay.

## Enums

### MaterialCategory

Categorizes construction materials into standard types.

```typescript
enum MaterialCategory {
  WOOD = 'Wood',
  METAL = 'Metal',
  CONCRETE = 'Concrete',
  BRICK = 'Brick',
  GLASS = 'Glass',
  PLASTIC = 'Plastic',
  ELECTRICAL = 'Electrical',
  OTHER = 'Other'
}
```

**Usage:**
```typescript
const item: MaterialItem = {
  category: MaterialCategory.WOOD,
  // ...
}
```

---

### Condition

Represents the physical state of materials.

```typescript
enum Condition {
  NEW = 'New',        // Unused, original packaging
  GOOD = 'Good',      // Lightly used, fully functional
  FAIR = 'Fair',      // Some wear, still usable
  POOR = 'Poor',      // Heavy wear, limited use
  SCRAP = 'Scrap'     // For recycling only
}
```

**Mapping to Reusability:**
- NEW → 90-100% reusability
- GOOD → 70-89% reusability
- FAIR → 40-69% reusability
- POOR → 20-39% reusability
- SCRAP → 0-19% reusability

---

### RequestStatus

Tracks the lifecycle of material requests.

```typescript
enum RequestStatus {
  PENDING = 'Pending',        // Awaiting approval
  APPROVED = 'Approved',      // Ready for pickup
  COMPLETED = 'Completed',    // Transaction finished
  REJECTED = 'Rejected'       // Request denied
}
```

**Status Flow:**
```
PENDING → APPROVED → COMPLETED
    ↓
REJECTED (terminal state)
```

---

## Interfaces

### MaterialItem

Core data structure representing a construction material.

```typescript
interface MaterialItem {
  // === Identification ===
  id: string                    // Unique identifier
  name: string                  // Display name (e.g., "Oak Flooring")
  description: string           // Detailed description
  
  // === Classification ===
  category: MaterialCategory    // Material type
  condition: Condition          // Physical state
  reusabilityScore: number     // 0-100 scale
  
  // === Media ===
  imageUrl: string             // Image URL or data URL
  
  // === Quantity & Value ===
  quantity: string             // Human-readable (e.g., "10 Units", "5m²")
  estimatedValue: number       // Price in EUR
  
  // === Location ===
  location: string             // Address or site name
  coordinates?: {              // GPS coordinates
    lat: number
    lng: number
  }
  accessRequirements?: string  // Access notes
  pickupTimes?: string        // Available times
  distance?: string           // UI helper (e.g., "2.5 km")
  
  // === Metadata ===
  dateAdded: string           // ISO timestamp
  isAvailable: boolean        // Still available
  contactPhone?: string       // Contact number
  
  // === Ownership & Visibility ===
  isMine?: boolean            // Belongs to current user
  isPublished?: boolean       // Visible on marketplace
  internalProjectMatch?: string  // Internal reuse opportunity
}
```

**Example:**
```typescript
const material: MaterialItem = {
  id: '12345',
  name: 'Reclaimed Oak Flooring',
  description: 'High quality solid oak flooring planks',
  category: MaterialCategory.WOOD,
  condition: Condition.GOOD,
  reusabilityScore: 90,
  imageUrl: 'https://...',
  quantity: '85 sqm',
  estimatedValue: 1200,
  location: 'Nuremberg, Altstadt',
  coordinates: { lat: 49.4520, lng: 11.0768 },
  dateAdded: '2025-11-23T10:30:00Z',
  isAvailable: true,
  isMine: true,
  isPublished: true,
  pickupTimes: 'Mon-Sat 9am-6pm'
}
```

---

### AnalysisResult

Output from AI material recognition.

```typescript
interface AnalysisResult {
  name: string                  // Material name
  category: MaterialCategory    // Detected category
  condition: Condition          // Assessed condition
  reusabilityScore: number     // 0-100
  estimatedValue: number       // EUR
  description: string          // AI-generated description
  quantity: string             // Estimated quantity
  suggestedAction: string      // "Resell", "Recycle", "Dispose"
  box_2d?: number[]           // [ymin, xmin, ymax, xmax] (0-1 scale)
}
```

**Bounding Box Format:**
```typescript
// Normalized coordinates (0-1 range)
box_2d: [
  ymin,  // Top edge
  xmin,  // Left edge
  ymax,  // Bottom edge
  xmax   // Right edge
]

// Convert to pixels:
const pixelBox = {
  top: box_2d[0] * imageHeight,
  left: box_2d[1] * imageWidth,
  bottom: box_2d[2] * imageHeight,
  right: box_2d[3] * imageWidth
}
```

---

### MaterialRequest

Represents a user's request for marketplace materials.

```typescript
interface MaterialRequest {
  id: string                    // Unique request ID
  requestId: string            // Display ID (e.g., "REQ-1092")
  items: MaterialItem[]        // Requested materials
  date: string                 // ISO timestamp
  status: RequestStatus        // Current status
  totalValue: number          // Sum of item values (EUR)
}
```

**Example:**
```typescript
const request: MaterialRequest = {
  id: '1637683200000',
  requestId: 'REQ-1092',
  items: [material1, material2],
  date: '2025-11-23T14:20:00Z',
  status: RequestStatus.PENDING,
  totalValue: 2450
}
```

---

## Type Guards

### Type Checking Functions

```typescript
// Check if item is marketplace item
const isMarketplaceItem = (item: MaterialItem): boolean => {
  return item.isPublished === true && item.isMine === false
}

// Check if item is my item
const isMyItem = (item: MaterialItem): boolean => {
  return item.isMine === true
}

// Check if item has internal match
const hasInternalMatch = (item: MaterialItem): boolean => {
  return !!item.internalProjectMatch
}

// Check if item is high value
const isHighValue = (item: MaterialItem): boolean => {
  return item.estimatedValue >= 300
}
```

---

## Type Utilities

### Partial Updates

```typescript
// Update subset of properties
type MaterialUpdate = Partial<MaterialItem>

const updateMaterial = (
  id: string,
  updates: MaterialUpdate
): void => {
  setInventory(prev => prev.map(item =>
    item.id === id ? { ...item, ...updates } : item
  ))
}

// Usage
updateMaterial('123', {
  isPublished: true,
  pickupTimes: 'Mon-Fri 9-5'
})
```

### Omit Types

```typescript
// Material without internal fields
type PublicMaterial = Omit<
  MaterialItem,
  'isMine' | 'internalProjectMatch'
>

// Create new material without ID
type NewMaterial = Omit<MaterialItem, 'id' | 'dateAdded'>
```

---

## Component Props Types

### Common Patterns

```typescript
// Basic component props
interface ComponentProps {
  item: MaterialItem
  onAction: (item: MaterialItem) => void
}

// Optional props with defaults
interface ComponentWithDefaults {
  title?: string
  isOpen?: boolean
  onClose?: () => void
}

// Children props
interface ContainerProps {
  children: React.ReactNode
  className?: string
}

// Generic props
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}
```

---

## Validation

### Type Validation Functions

```typescript
// Validate MaterialItem
const isValidMaterial = (item: any): item is MaterialItem => {
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    Object.values(MaterialCategory).includes(item.category) &&
    Object.values(Condition).includes(item.condition) &&
    typeof item.reusabilityScore === 'number' &&
    item.reusabilityScore >= 0 &&
    item.reusabilityScore <= 100
  )
}

// Validate category
const isValidCategory = (cat: string): cat is MaterialCategory => {
  return Object.values(MaterialCategory).includes(cat as MaterialCategory)
}
```

---

## Constants

### Default Values

```typescript
// Default material
export const DEFAULT_MATERIAL: Partial<MaterialItem> = {
  category: MaterialCategory.OTHER,
  condition: Condition.GOOD,
  reusabilityScore: 50,
  quantity: '1 Unit',
  estimatedValue: 0,
  isAvailable: true,
  isMine: true,
  isPublished: false
}

// Category colors (for UI)
export const CATEGORY_COLORS: Record<MaterialCategory, string> = {
  [MaterialCategory.WOOD]: 'bg-amber-100 text-amber-700',
  [MaterialCategory.METAL]: 'bg-slate-100 text-slate-700',
  [MaterialCategory.CONCRETE]: 'bg-stone-100 text-stone-700',
  [MaterialCategory.BRICK]: 'bg-red-100 text-red-700',
  [MaterialCategory.GLASS]: 'bg-cyan-100 text-cyan-700',
  [MaterialCategory.PLASTIC]: 'bg-purple-100 text-purple-700',
  [MaterialCategory.ELECTRICAL]: 'bg-yellow-100 text-yellow-700',
  [MaterialCategory.OTHER]: 'bg-gray-100 text-gray-700'
}

// Condition badges
export const CONDITION_COLORS: Record<Condition, string> = {
  [Condition.NEW]: 'bg-emerald-500',
  [Condition.GOOD]: 'bg-green-500',
  [Condition.FAIR]: 'bg-yellow-500',
  [Condition.POOR]: 'bg-orange-500',
  [Condition.SCRAP]: 'bg-red-500'
}
```

---

## Type Export Pattern

### Organized Exports

```typescript
// types.ts
export {
  // Enums
  MaterialCategory,
  Condition,
  RequestStatus,
  
  // Interfaces
  type MaterialItem,
  type AnalysisResult,
  type MaterialRequest
}
```

### Import Pattern

```typescript
// Component file
import {
  MaterialItem,
  MaterialCategory,
  Condition,
  type AnalysisResult
} from '../types'
```

---

## Best Practices

### 1. Always Use Strict Types
```typescript
// ❌ Bad
const item: any = { ... }

// ✅ Good
const item: MaterialItem = { ... }
```

### 2. Use Enums for Constants
```typescript
// ❌ Bad
const category = 'wood'  // Typo-prone

// ✅ Good
const category = MaterialCategory.WOOD  // Type-safe
```

### 3. Optional vs Required
```typescript
// Required fields first
interface Item {
  id: string
  name: string
  // Optional fields last
  description?: string
  metadata?: Record<string, any>
}
```

### 4. Reuse Common Types
```typescript
// Define once
type Coordinates = { lat: number; lng: number }

// Use everywhere
interface Location {
  address: string
  coords: Coordinates
}
```

---

*See [Components](./components.md) for usage in components*
