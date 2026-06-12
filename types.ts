
export enum MaterialCategory {
  WOOD = 'Wood',
  METAL = 'Metal',
  CONCRETE = 'Concrete',
  BRICK = 'Brick',
  GLASS = 'Glass',
  PLASTIC = 'Plastic',
  ELECTRICAL = 'Electrical',
  OTHER = 'Other'
}

export enum Condition {
  NEW = 'New',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  SCRAP = 'Scrap'
}

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  category: MaterialCategory;
  condition: Condition;
  reusabilityScore: number; // 0 to 100
  imageUrl: string;
  quantity: string;
  estimatedValue: number; // Value in EUR
  location: string;
  coordinates?: { lat: number; lng: number };
  accessRequirements?: string;
  pickupTimes?: string;
  dateAdded: string;
  isAvailable: boolean;
  contactPhone?: string;
  internalProjectMatch?: string; // Name of internal project requesting this
  isPublished?: boolean; // If true, visible on public marketplace
  isMine?: boolean; // If true, belongs to the current user's site
  distance?: string; // UI helper for distance display
}

export interface AnalysisResult {
  name: string;
  category: MaterialCategory;
  condition: Condition;
  reusabilityScore: number;
  estimatedValue: number;
  description: string;
  quantity: string; // Estimated quantity string (e.g. "10 Units", "5m")
  suggestedAction: string; // e.g., "Resell", "Recycle", "Dispose"
  box_2d?: number[]; // [ymin, xmin, ymax, xmax]
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected'
}

export interface MaterialRequest {
  id: string;
  requestId: string;
  items: MaterialItem[];
  date: string;
  status: RequestStatus;
  totalValue: number;
}
