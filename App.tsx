
import React, { useState, useMemo, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { InventoryCard } from './components/InventoryCard';
import { ItemDetails } from './components/ItemDetails';
import { CartDrawer } from './components/CartDrawer';
import { ChatAssistant } from './components/ChatAssistant';
import { ProfileModal } from './components/ProfileModal';
import { BlueprintMatch } from './components/BlueprintMatch';
import { MaterialItem, MaterialCategory, Condition, AnalysisResult, MaterialRequest, RequestStatus } from './types';
import { NavBar } from './components/NavBar';
import { totalCo2Saved, totalEurSaved, co2SavedKg } from './services/sustainability';

const BASE = import.meta.env.BASE_URL;

// Mock initial data - NUREMBERG LOCATIONS
const SEED_INVENTORY: MaterialItem[] = [
  {
    id: '1',
    name: 'Weathered Pine Beams',
    description: 'Structural pine beams recovered from demolition in Altstadt. Minor surface weathering but structurally sound.',
    category: MaterialCategory.WOOD,
    condition: Condition.GOOD,
    reusabilityScore: 85,
    imageUrl: BASE + 'materials/pine-beams.jpg',
    quantity: '12 Units (4m)',
    estimatedValue: 450,
    location: 'Altstadt, Nürnberg',
    dateAdded: '2023-10-24',
    isAvailable: true,
    isPublished: true,
    isMine: true,
    coordinates: { lat: 49.4520, lng: 11.0768 },
    accessRequirements: 'Pedestrian zone access required',
    pickupTimes: 'Mon-Fri 8am-10am'
  },
  {
    id: '2',
    name: 'Galvanized Steel Pipes',
    description: 'Leftover piping from HVAC installation near Plärrer. Unused but has been stored outside.',
    category: MaterialCategory.METAL,
    condition: Condition.FAIR,
    reusabilityScore: 70,
    imageUrl: BASE + 'materials/steel-pipes.jpg',
    quantity: '25 Meters',
    estimatedValue: 120,
    location: 'Gostenhof, Nürnberg',
    dateAdded: '2023-10-25',
    isAvailable: true,
    isPublished: false,
    isMine: true,
    internalProjectMatch: 'Project Nord - Plumbing Upgrade',
    coordinates: { lat: 49.4485, lng: 11.0645 },
  },
  {
    id: '3',
    name: 'Surplus Red Bricks',
    description: 'Full pallet of standard red clay bricks. Excess order, brand new condition.',
    category: MaterialCategory.BRICK,
    condition: Condition.NEW,
    reusabilityScore: 100,
    imageUrl: BASE + 'materials/red-bricks.jpg',
    quantity: '500 Bricks',
    estimatedValue: 380,
    location: 'Südstadt, Nürnberg',
    dateAdded: '2023-10-26',
    isAvailable: true,
    isPublished: true,
    isMine: true,
    coordinates: { lat: 49.4350, lng: 11.0820 },
    accessRequirements: 'Call for gate code',
    pickupTimes: 'Weekdays 7am-3pm'
  },
  {
    id: '4',
    name: 'Insulated Copper Wire',
    description: 'Scrap copper wire lengths. Good for recycling or small patch jobs.',
    category: MaterialCategory.ELECTRICAL,
    condition: Condition.SCRAP,
    reusabilityScore: 20,
    imageUrl: BASE + 'materials/copper-wire.jpg',
    quantity: '15 kg',
    estimatedValue: 95,
    location: 'Maxfeld, Nürnberg',
    dateAdded: '2023-10-26',
    isAvailable: true,
    isPublished: false,
    isMine: true,
    coordinates: { lat: 49.4620, lng: 11.0910 },
  },
  {
    id: '9',
    name: 'Rockwool Insulation Rolls',
    description: '3 Unopened rolls of Rockwool thermal insulation. Leftover from attic renovation.',
    category: MaterialCategory.OTHER,
    condition: Condition.NEW,
    reusabilityScore: 100,
    imageUrl: BASE + 'materials/rockwool-insulation.jpg',
    quantity: '3 Rolls',
    estimatedValue: 150,
    location: 'St. Johannis, Nürnberg',
    dateAdded: '2023-10-26',
    isAvailable: true,
    isPublished: false,
    isMine: true,
    coordinates: { lat: 49.4590, lng: 11.0680 },
  },
  // --- MARKETPLACE EXAMPLES (OTHERS) ---
  {
    id: '5',
    name: 'Portland Cement Bags',
    description: 'Unopened pallet of Portland cement. Leftover from foundation pour. Kept in dry storage.',
    category: MaterialCategory.CONCRETE,
    condition: Condition.NEW,
    reusabilityScore: 100,
    imageUrl: BASE + 'materials/portland-cement.jpg',
    quantity: '40 Bags (25kg)',
    estimatedValue: 280,
    location: 'Langwasser, Nürnberg',
    dateAdded: '2023-10-27',
    isAvailable: true,
    isPublished: true,
    isMine: false,
    coordinates: { lat: 49.4100, lng: 11.1300 },
    distance: '3.2 km',
    pickupTimes: 'Weekdays 7am-5pm'
  },
  {
    id: '6',
    name: 'Reclaimed Oak Flooring',
    description: 'High quality solid oak flooring planks carefully removed from renovation. Denailed and bundled.',
    category: MaterialCategory.WOOD,
    condition: Condition.GOOD,
    reusabilityScore: 90,
    imageUrl: BASE + 'materials/oak-flooring.jpg',
    quantity: '85 sqm',
    estimatedValue: 1200,
    location: 'Erlenstegen, Nürnberg',
    dateAdded: '2023-10-28',
    isAvailable: true,
    isPublished: true,
    isMine: false,
    coordinates: { lat: 49.4700, lng: 11.1200 },
    distance: '1.5 km',
    pickupTimes: 'Mon-Sat 9am-6pm',
    accessRequirements: 'Narrow street, van access only'
  },
  {
    id: '7',
    name: 'Tempered Glass Panels',
    description: 'Double glazed tempered glass panels. Removed from office fitout. Standard size 1.2m x 2.4m.',
    category: MaterialCategory.GLASS,
    condition: Condition.GOOD,
    reusabilityScore: 85,
    imageUrl: BASE + 'materials/glass-panels.jpg',
    quantity: '10 Panels',
    estimatedValue: 500,
    location: 'Mögeldorf, Nürnberg',
    dateAdded: '2023-10-29',
    isAvailable: true,
    isPublished: true,
    isMine: false,
    coordinates: { lat: 49.4550, lng: 11.1350 },
    distance: '4.8 km',
    pickupTimes: 'By appointment'
  },
  {
    id: '8',
    name: 'Aluminum Scaffolding Tubes',
    description: 'Standard 48.3mm aluminum scaffolding tubes. Various lengths (2m, 3m, 4m).',
    category: MaterialCategory.METAL,
    condition: Condition.FAIR,
    reusabilityScore: 80,
    imageUrl: BASE + 'materials/scaffold-tubes.jpg',
    quantity: '50 Units',
    estimatedValue: 600,
    location: 'Wöhrd, Nürnberg',
    dateAdded: '2023-10-26',
    isAvailable: true,
    isPublished: true,
    isMine: false,
    coordinates: { lat: 49.4580, lng: 11.0980 },
    distance: '5.2 km'
  },
  {
    id: '10',
    name: 'Historic Cobblestones',
    description: 'Granite cobblestones recovered from street repair. Ideal for landscaping.',
    category: MaterialCategory.CONCRETE,
    condition: Condition.GOOD,
    reusabilityScore: 95,
    imageUrl: BASE + 'materials/cobblestones.jpg',
    quantity: '2 Tons',
    estimatedValue: 300,
    location: 'Dutzendteich, Nürnberg',
    dateAdded: '2023-10-30',
    isAvailable: true,
    isPublished: true,
    isMine: false,
    coordinates: { lat: 49.4320, lng: 11.1150 },
    distance: '3.8 km'
  }
];

const MOCK_INITIAL_REQUEST: MaterialRequest = {
  id: 'mock-req-1',
  requestId: 'REQ-1092',
  items: [SEED_INVENTORY[0], SEED_INVENTORY[1]],
  date: '2023-10-20T10:30:00Z',
  status: RequestStatus.APPROVED,
  totalValue: 570
};

const LS_KEY = 'hackmate_state_v2';

interface PersistedState {
  inventory: MaterialItem[];
  requests: MaterialRequest[];
  seeded: boolean;
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// Helper to animate numbers counting up
const AnimatedCounter = ({ value, suffix = '' }: { value: number, suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTimestamp: number | null = null;
        const duration = 2000;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            setDisplayValue(Math.floor(easeOutQuart * value));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(value);
            }
        };

        window.requestAnimationFrame(step);
    }, [value]);

    return <span className="tabular-nums">{displayValue.toLocaleString()}{suffix}</span>;
};

// --- Sustainability Board Component (uses real carbon factors) ---
const SustainabilityBoard = ({ inventory, cartItems }: { inventory: MaterialItem[], cartItems: MaterialItem[] }) => {
    const [showDetails, setShowDetails] = useState(false);

    const myItems = inventory.filter(i => i.isMine);

    // Real CO2 calculations via sustainability service
    const co2Saved = Math.round(totalCo2Saved(myItems));
    const eurSavedTotal = totalEurSaved(myItems);
    const wasteDiverted = Math.round(myItems.reduce((acc, item) => {
      const match = item.quantity.match(/^(\d+(\.\d+)?)/);
      return acc + (match ? parseFloat(match[1]) : 1) * 5;
    }, 0));
    const treesEquivalent = Math.max(1, Math.round(co2Saved / 20));

    // Cart impact
    const cartCo2 = Math.round(totalCo2Saved(cartItems));
    const cartEur = totalEurSaved(cartItems);

    // Monthly data based on real calculation
    const monthlyStats = [
        { month: 'May', value: Math.round(co2Saved * 0.1) },
        { month: 'Jun', value: Math.round(co2Saved * 0.15) },
        { month: 'Jul', value: Math.round(co2Saved * 0.12) },
        { month: 'Aug', value: Math.round(co2Saved * 0.2) },
        { month: 'Sep', value: Math.round(co2Saved * 0.18) },
        { month: 'Oct', value: Math.round(co2Saved * 0.25) },
    ];
    const maxMonthVal = Math.max(...monthlyStats.map(m => m.value)) || 1;

    return (
        <>
        <div
            onClick={() => setShowDetails(true)}
            className="h-full bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-5 md:p-8 text-white shadow-2xl shadow-stone-900/20 relative overflow-hidden group cursor-pointer transform hover:scale-[1.01] transition-all duration-300 border border-stone-700/50"
        >
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                 style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}}>
            </div>

            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500 rounded-full mix-blend-overlay filter blur-[64px] opacity-30 animate-pulse"></div>
            <div className="absolute -left-20 bottom-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[64px] opacity-20"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-emerald-500/20 backdrop-blur text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30 shadow-lg">
                                Live Impact
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">Sustainability<br/>Dashboard</h2>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg group-hover:bg-white/20 transition-colors group-hover:rotate-12 transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300 md:w-8 md:h-8"><path d="M2 22h20"></path><path d="M12 2v20"></path><path d="M15.5 10c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"></path><path d="M8.5 14c.83 0 1.5-.67 1.5-1.5S9.33 11 8.5 11 7 11.67 7 12.5 7.67 14 8.5 14z"></path><path d="M12 22s5.5-2.5 7.5-10.5c1.5-6-3.5-9.5-7.5-9.5-4 0-9 3.5-7.5 9.5C6.5 19.5 12 22 12 22z"></path></svg>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/5 text-center hover:bg-black/40 transition-colors">
                        <div className="text-xl md:text-3xl font-black mb-1 text-white"><AnimatedCounter value={co2Saved} suffix="kg" /></div>
                        <div className="text-[9px] md:text-[10px] text-stone-400 uppercase font-bold tracking-widest break-words leading-tight">CO2 Avoided</div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/5 text-center hover:bg-black/40 transition-colors">
                        <div className="text-xl md:text-3xl font-black mb-1 text-white"><AnimatedCounter value={wasteDiverted} suffix="kg" /></div>
                        <div className="text-[9px] md:text-[10px] text-stone-400 uppercase font-bold tracking-widest break-words leading-tight">Waste Diverted</div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/5 text-center hover:bg-black/40 transition-colors">
                        <div className="text-xl md:text-3xl font-black mb-1 text-emerald-300"><AnimatedCounter value={treesEquivalent} /></div>
                        <div className="text-[9px] md:text-[10px] text-stone-400 uppercase font-bold tracking-widest break-words leading-tight">Trees Saved</div>
                    </div>
                </div>

                {/* Savings Widget */}
                {(cartCo2 > 0 || cartEur > 0) && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">Cart savings</span>
                    <div className="flex gap-3">
                      <span className="text-xs font-black text-emerald-300">€{cartEur}</span>
                      <span className="text-xs font-black text-emerald-300">{cartCo2}kg CO2</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-center">
                    <span className="text-xs text-stone-400 font-medium flex items-center justify-center gap-1.5 group-hover:text-white transition-colors">
                        Tap for detailed analytics <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                </div>
            </div>
        </div>

        {showDetails && (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-lg animate-fade-in"
                onClick={() => setShowDetails(false)}
            >
                <div
                    className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-bounce-in border border-stone-200 flex flex-col max-h-[85vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-stone-900 p-8 text-white relative shrink-0">
                         <div className="absolute inset-0 opacity-20"
                              style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'}}>
                         </div>
                        <button onClick={() => setShowDetails(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white z-10">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className="relative z-10">
                           <h2 className="text-3xl font-black mb-2">Impact Report</h2>
                           <p className="text-stone-400 font-medium">Your material recovery analytics</p>
                        </div>
                    </div>

                    <div className="p-8 bg-stone-50 overflow-y-auto">
                         <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                             <div className="text-2xl font-black text-emerald-700">{co2Saved}kg</div>
                             <div className="text-xs text-emerald-600 font-bold uppercase mt-1">CO2 Avoided</div>
                           </div>
                           <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                             <div className="text-2xl font-black text-blue-700">€{eurSavedTotal.toLocaleString()}</div>
                             <div className="text-xs text-blue-600 font-bold uppercase mt-1">EUR Saved</div>
                           </div>
                         </div>

                         <div className="flex items-center justify-between mb-8">
                             <h3 className="font-bold text-stone-800 text-lg">CO2 Avoided <span className="text-stone-400 text-sm font-normal ml-1">(Last 6 Months)</span></h3>
                             <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">Total: {co2Saved}kg</span>
                         </div>

                         <div className="flex items-end gap-3 h-56 border-b border-stone-200 pb-4 mb-4">
                             {monthlyStats.map((stat, idx) => {
                                 const heightPct = (stat.value / maxMonthVal) * 100;
                                 return (
                                     <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                                         <div
                                            className="w-full bg-emerald-300 rounded-t-lg relative group-hover:bg-emerald-500 transition-all duration-300 shadow-sm"
                                            style={{ height: `${heightPct}%` }}
                                         >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap transform -translate-y-1 group-hover:translate-y-0 z-10">
                                                {stat.value}kg
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-stone-900 rotate-45"></div>
                                            </div>
                                         </div>
                                         <span className="text-xs font-bold text-stone-400 uppercase">{stat.month}</span>
                                     </div>
                                 );
                             })}
                         </div>
                         <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mt-6 flex gap-4 items-start">
                            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed">
                                Consistent recovery of materials has saved an estimated <strong className="text-emerald-700">{treesEquivalent} trees</strong> this year. Keep up the great work!
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};


const App: React.FC = () => {
  // localStorage hydration
  const persisted = loadState();
  const [activeTab, setActiveTab] = useState<'inventory' | 'market' | 'blueprint'>('inventory');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isScanning, setIsScanning] = useState(false);
  const [inventory, setInventory] = useState<MaterialItem[]>(
    persisted ? persisted.inventory : SEED_INVENTORY
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [notifPreferences, setNotifPreferences] = useState<string[]>([MaterialCategory.WOOD, 'High Value']);

  const [cartItems, setCartItems] = useState<MaterialItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [requests, setRequests] = useState<MaterialRequest[]>(
    persisted ? persisted.requests : [MOCK_INITIAL_REQUEST]
  );

  const [isChatOpen, setIsChatOpen] = useState(false);

  // Persist state to localStorage whenever inventory or requests change
  useEffect(() => {
    saveState({ inventory, requests, seeded: true });
  }, [inventory, requests]);

  // Merge seed data only on first run (no existing persisted state)
  useEffect(() => {
    if (!persisted) {
      setInventory(SEED_INVENTORY);
      setRequests([MOCK_INITIAL_REQUEST]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateMockItem = (): MaterialItem => {
      const locations = ['Langwasser', 'Nordstadt', 'Mitte', 'Gostenhof', 'Ziegelstein', 'Fürth'];
      const itemTemplates = [
          { name: 'Used Scaffold Planks', cat: MaterialCategory.WOOD, img: BASE + 'materials/scaffold-planks.jpg', val: 120 },
          { name: 'Surplus Floor Tiles', cat: MaterialCategory.CONCRETE, img: BASE + 'materials/floor-tiles.jpg', val: 200 },
          { name: 'Copper Wiring Scraps', cat: MaterialCategory.ELECTRICAL, img: BASE + 'materials/copper-wire.jpg', val: 350 },
          { name: 'Steel Reinforcement Mesh', cat: MaterialCategory.METAL, img: BASE + 'materials/steel-pipes.jpg', val: 400 },
          { name: 'Plywood Sheets', cat: MaterialCategory.WOOD, img: BASE + 'materials/scaffold-planks.jpg', val: 80 }
      ];

      const template = itemTemplates[Math.floor(Math.random() * itemTemplates.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      return {
          id: 'market-' + Date.now(),
          name: template.name,
          category: template.cat,
          description: `Just added to marketplace from a site in ${location}.`,
          condition: Condition.GOOD,
          reusabilityScore: 80 + Math.floor(Math.random() * 20),
          imageUrl: template.img,
          quantity: '1 Lot',
          estimatedValue: template.val,
          location: `${location}, Nürnberg`,
          dateAdded: new Date().toISOString(),
          isAvailable: true,
          isPublished: true,
          isMine: false,
          coordinates: { lat: 49.45 + (Math.random() * 0.05), lng: 11.07 + (Math.random() * 0.05) },
          distance: (1 + Math.random() * 5).toFixed(1) + ' km'
      };
  };

  useEffect(() => {
    const interval = setInterval(() => {
        const newItem = generateMockItem();
        setInventory(prev => [newItem, ...prev]);
        const isHighValue = newItem.estimatedValue > 300;
        const matchesCategory = notifPreferences.includes(newItem.category);
        const matchesValue = isHighValue && notifPreferences.includes('High Value');

        if (matchesCategory || matchesValue) {
            showNotification(`New ${newItem.name} available in ${newItem.location.split(',')[0]}!`);
        }
    }, 15000);

    return () => clearInterval(interval);
  }, [notifPreferences]);

  const totalRecoveredValue = useMemo(() => {
    return inventory
      .filter(item => item.isMine)
      .reduce((total, item) => total + item.estimatedValue, 0);
  }, [inventory]);

  const handleAddItem = (
    analysis: AnalysisResult,
    image: string,
    quantity: string,
    location: string,
    value: number,
    coords?: { lat: number; lng: number }
  ) => {
    const hasInternalMatch = value > 200 && Math.random() > 0.5;
    const newItem: MaterialItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      name: analysis.name,
      description: analysis.description,
      category: analysis.category,
      condition: analysis.condition,
      reusabilityScore: analysis.reusabilityScore,
      imageUrl: image,
      quantity: quantity,
      estimatedValue: value,
      location: location || 'Nürnberg Site',
      dateAdded: new Date().toISOString(),
      isAvailable: true,
      coordinates: coords,
      isPublished: false,
      isMine: true,
      internalProjectMatch: hasInternalMatch ? 'Project West - Fürth' : undefined,
      accessRequirements: 'Safety vest required for pickup',
      pickupTimes: 'Mon-Fri 9:00 - 17:00'
    };

    setInventory(prev => [newItem, ...prev]);
    showNotification(`Added ${newItem.name} to inventory`);
  };

  const handlePublishItem = (id: string, updates: Partial<MaterialItem>) => {
    setInventory(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, isPublished: true }
        : item
    ));
    setSelectedItem(null);
    showNotification("Item published to marketplace!");
  };

  const handleAddToCart = (item: MaterialItem) => {
    if (cartItems.some(i => i.id === item.id)) return;
    setCartItems(prev => [...prev, item]);
    showNotification(`${item.name} added to cart!`);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    const newRequest: MaterialRequest = {
        id: Date.now().toString(),
        requestId: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cartItems],
        date: new Date().toISOString(),
        status: RequestStatus.PENDING,
        totalValue: cartItems.reduce((sum, i) => sum + i.estimatedValue, 0)
    };

    setRequests(prev => [newRequest, ...prev]);
    showNotification(`Request sent for ${cartItems.length} items!`);
    setCartItems([]);
    setIsCartOpen(false);
    setSelectedItem(null);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const togglePreference = (pref: string) => {
      setNotifPreferences(prev =>
        prev.includes(pref)
            ? prev.filter(p => p !== pref)
            : [...prev, pref]
      );
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'scan') {
      setIsScanning(true);
    } else {
      setActiveTab(tab as 'inventory' | 'market' | 'blueprint');
    }
  };

  const displayItems = useMemo(() => {
    if (isScanning || activeTab === 'blueprint') return [];
    let items: MaterialItem[] = [];
    if (activeTab === 'market') {
       items = inventory.filter(i => i.isPublished);
    } else {
       items = inventory.filter(i => i.isMine);
    }
    if (activeFilter !== 'All') {
      if (activeFilter === 'High Value') {
        items = items.filter(item => item.estimatedValue >= 300);
      } else {
        items = items.filter(item => item.category === activeFilter);
      }
    }
    return items;
  }, [inventory, activeFilter, activeTab, isScanning]);

  if (isScanning) {
    return (
      <Scanner
        onAddInventory={handleAddItem}
        onCancel={() => setIsScanning(false)}
      />
    );
  }

  const isMarketplace = activeTab === 'market';
  const isBlueprint = activeTab === 'blueprint';

  // Cumulative savings widget values (all completed requests + cart)
  const allRequestItems = requests.flatMap(r => r.items);
  const cumulativeCo2 = Math.round(totalCo2Saved([...allRequestItems, ...cartItems]));
  const cumulativeEur = totalEurSaved([...allRequestItems, ...cartItems]);

  return (
    <div className="min-h-[100dvh] font-sans relative selection:bg-orange-100 selection:text-orange-900 pb-20">

      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
        <div className="bg-stone-900 text-stone-300 text-[10px] font-medium py-1.5 px-4 text-center tracking-wide">
          ReBau Demo • <span className="text-orange-400">Nürnberg Region</span>
        </div>

        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <img src={BASE + 'logo.jpeg'} alt="ReBau" className="h-12 w-auto object-contain drop-shadow-sm" />

              <div className="hidden md:flex flex-col border-l-2 border-stone-200 pl-4 h-10 justify-center">
                  <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest leading-none mb-1">Powered by</span>
                  <div className="flex items-center gap-1.5">
                      <img src={BASE + 'fau-logo.svg'} alt="FAU Erlangen-Nürnberg" className="h-4 w-auto object-contain" />
                      <span className="text-[10px] font-semibold text-stone-600 leading-tight">AI Innovation at FAU Erlangen-Nürnberg</span>
                  </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Persistent Savings Widget */}
                {(cumulativeCo2 > 0 || cumulativeEur > 0) && (
                  <div className="hidden md:flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
                    <div className="text-center">
                      <div className="text-xs font-black text-emerald-700">€{cumulativeEur.toLocaleString()}</div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase">Saved</div>
                    </div>
                    <div className="w-px h-6 bg-emerald-200"></div>
                    <div className="text-center">
                      <div className="text-xs font-black text-emerald-700">{cumulativeCo2}kg</div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase">CO2</div>
                    </div>
                  </div>
                )}

                <div className="relative">
                    <button
                        onClick={() => setPrefsOpen(!prefsOpen)}
                        className={`p-3 rounded-full transition-all duration-300 ${prefsOpen ? 'bg-orange-50 text-orange-600 shadow-inner' : 'text-stone-500 hover:bg-white hover:shadow-md hover:text-stone-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        {notifPreferences.length > 0 && <span className="absolute top-2.5 right-3 w-2 h-2 bg-orange-500 rounded-full border border-white animate-pulse"></span>}
                    </button>
                    {prefsOpen && (
                        <>
                        <div className="fixed inset-0 z-40" onClick={() => setPrefsOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-stone-100 z-50 overflow-hidden animate-bounce-in ring-1 ring-black/5">
                            <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                                <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider">Alert Preferences</h3>
                                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Live</span>
                            </div>
                            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                                {['Wood', 'Metal', 'Concrete', 'High Value', 'Electrical', 'Brick'].map(pref => (
                                    <button
                                        key={pref}
                                        onClick={() => togglePreference(pref)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-2xl hover:bg-stone-50 transition-colors group"
                                    >
                                        <span className={`font-bold transition-colors ${notifPreferences.includes(pref) ? 'text-orange-700' : 'text-stone-600 group-hover:text-stone-900'}`}>{pref}</span>
                                        {notifPreferences.includes(pref) && (
                                            <svg className="text-orange-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        </>
                    )}
                </div>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-3 text-stone-500 hover:bg-white hover:shadow-md hover:text-stone-800 rounded-full transition-all duration-300"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                   {cartItems.length > 0 && (
                     <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-orange-500/40 animate-bounce-in border-2 border-white">
                       {cartItems.length}
                     </span>
                   )}
                </button>
                <div
                    onClick={() => setIsProfileOpen(true)}
                    className="w-10 h-10 bg-gradient-to-br from-stone-100 to-stone-200 rounded-full flex items-center justify-center text-xs font-black text-stone-600 border-2 border-white shadow-lg shadow-stone-200 hover:scale-105 transition-transform cursor-pointer"
                >
                  SM
                </div>
            </div>
        </div>
      </div>

      {/* Blueprint Match Tab */}
      {isBlueprint ? (
        <BlueprintMatch
          marketplaceItems={inventory.filter(i => i.isPublished && i.isAvailable)}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <main className="max-w-7xl mx-auto p-6 md:p-8 pb-32 animate-fade-in">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
               <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${isMarketplace ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{isMarketplace ? 'Public Exchange' : 'My Inventory'}</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter">
                 {isMarketplace ? 'Marketplace' : 'Site Overview'}
               </h2>
             </div>
             {!isMarketplace && (
                <button
                  onClick={() => setIsScanning(true)}
                  className="hidden md:flex bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-stone-900/30 hover:bg-stone-800 hover:-translate-y-1 transition-all items-center gap-3 active:scale-95"
                >
                  <div className="bg-white/20 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                  Scan New Items
                </button>
             )}
          </header>

          {!isMarketplace && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                  <div className="lg:col-span-2 h-full">
                      <SustainabilityBoard inventory={inventory} cartItems={cartItems} />
                  </div>

                  <div className="flex flex-col gap-6 h-full">
                       <div className="bg-stone-900 rounded-3xl p-8 shadow-2xl shadow-stone-900/20 flex flex-col justify-between group hover:shadow-stone-900/40 transition-shadow h-full relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                           <div>
                              <div className="flex justify-between items-start mb-4">
                                  <div className="p-2 bg-stone-800 rounded-xl inline-block">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></svg>
                                  </div>
                                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-800 px-2 py-1 rounded">YTD</span>
                              </div>
                              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Total Value Recovered</p>
                              <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">€{totalRecoveredValue.toLocaleString()}</h3>
                           </div>
                           <div className="text-xs font-bold text-emerald-400 mt-6 flex items-center gap-1.5 bg-emerald-500/10 self-start px-3 py-1.5 rounded-full border border-emerald-500/20">
                               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                               +12% from last month
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4 flex-1 min-h-[140px]">
                           <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/50 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform border border-stone-100">
                              <p className="text-stone-400 text-[9px] font-black uppercase tracking-widest mb-2">Items Logged</p>
                              <h3 className="text-4xl font-black text-stone-800">{inventory.filter(i => i.isMine).length}</h3>
                           </div>
                           <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform border border-indigo-50">
                              <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-2">Internal Matches</p>
                              <h3 className="text-4xl font-black text-indigo-600">{inventory.filter(i => i.isMine && i.internalProjectMatch).length}</h3>
                           </div>
                       </div>
                  </div>
              </div>
          )}

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-4 pl-1">
            {['All', 'Wood', 'Metal', 'Concrete', 'Brick', 'Electrical', 'Glass', 'High Value'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/30 transform scale-105'
                    : 'bg-white border border-stone-100 text-stone-500 hover:bg-stone-50 hover:text-stone-900 shadow-sm'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {!isMarketplace && (
              <button
                onClick={() => setIsScanning(true)}
                className="bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/50 flex flex-col items-center justify-center text-center p-6 h-full min-h-[380px] transition-all group cursor-pointer relative overflow-hidden animate-slide-up-fade"
                style={{ animationDelay: '0ms' }}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-stone-200 z-10">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </div>
                <h3 className="text-xl font-black text-stone-900 z-10">Add Material</h3>
                <p className="text-sm text-stone-500 mt-2 max-w-[200px] leading-relaxed z-10 font-medium">
                  Batch scan items to identify, value, and add to inventory
                </p>
              </button>
            )}

            {displayItems.length === 0 && (
               <div className="col-span-full py-20 text-center text-stone-400 animate-fade-in">
                  <div className="mb-6 opacity-30">
                      <svg className="w-24 h-24 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                  <p className="font-bold text-lg">No items found for this category.</p>
               </div>
            )}

            {displayItems.map((item, index) => (
              <div key={item.id} className="animate-slide-up-fade" style={{ animationDelay: `${(index + 1) * 75}ms` }}>
                  <InventoryCard
                  item={item}
                  isMarketplace={isMarketplace}
                  onClick={(item) => setSelectedItem(item)}
                  />
              </div>
            ))}
          </div>
        </main>
      )}

      {cartItems.length > 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-stone-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl z-40 shadow-2xl animate-bounce-in flex items-center justify-between pr-4 group hover:bg-stone-900 transition-colors">
             <div className="flex items-center gap-4 pl-2">
                <div className="bg-orange-500 text-white text-base font-black w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                    {cartItems.length}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Value</span>
                    <span className="text-white font-black text-xl">€{cartItems.reduce((sum, i) => sum + i.estimatedValue, 0).toLocaleString()}</span>
                </div>
             </div>
             <button
                onClick={() => setIsCartOpen(true)}
                className="bg-white text-stone-900 font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 hover:bg-stone-100 transition-colors text-sm"
            >
                View Cart
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
        </div>
      )}

      {isMarketplace && (
         <button
           onClick={() => setIsChatOpen(true)}
           className={`fixed right-6 w-16 h-16 bg-stone-900 text-white rounded-full shadow-2xl shadow-stone-900/30 flex items-center justify-center z-40 hover:scale-110 transition-all active:scale-95 group ${cartItems.length > 0 ? 'bottom-48' : 'bottom-28'}`}
           aria-label="Chat Assistant"
         >
            <div className="absolute inset-0 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
            <div className="relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
         </button>
      )}

      <NavBar activeTab={activeTab} setActiveTab={handleTabChange} />

      {selectedItem && (
        <ItemDetails
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isMarketplace={activeTab === 'market'}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
          isInCart={cartItems.some(i => i.id === selectedItem.id)}
          onPublish={handlePublishItem}
        />
      )}

      {isCartOpen && (
        <CartDrawer
           items={cartItems}
           onRemove={handleRemoveFromCart}
           onCheckout={handleCheckout}
           onClose={() => setIsCartOpen(false)}
        />
      )}

      {isChatOpen && (
        <ChatAssistant
           inventory={inventory}
           onAddToCart={handleAddToCart}
           onClose={() => setIsChatOpen(false)}
        />
      )}

      {isProfileOpen && (
        <ProfileModal
            requests={requests}
            onClose={() => setIsProfileOpen(false)}
        />
      )}

      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 w-auto max-w-[90vw] bg-stone-900/90 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl z-[90] flex items-center gap-4 animate-bounce-in border border-white/10">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
          <span className="text-sm font-bold tracking-wide">{notification}</span>
        </div>
      )}
    </div>
  );
};

export default App;
