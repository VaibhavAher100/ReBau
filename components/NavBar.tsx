import React from 'react';

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'inventory', label: 'Inventory', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    )},
    { id: 'scan', label: 'Scan', icon: (
      <div className="bg-gradient-to-tr from-orange-500 to-orange-600 p-3.5 rounded-full -mt-8 shadow-xl shadow-orange-500/30 border-4 border-white transition-transform duration-200 active:scale-95 hover:scale-105 hover:-translate-y-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
      </div>
    )},
    { id: 'market', label: 'Marketplace', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
    )},
    { id: 'blueprint', label: 'Blueprint', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="15" x2="12" y2="15"></line></svg>
    )},
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-auto">
      <div className="glass-panel px-4 pb-2 pt-3 rounded-3xl shadow-2xl shadow-stone-300/40 flex items-end gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-14 transition-all duration-300 group ${
              item.id === 'scan' ? '' : 'pb-2'
            }`}
          >
            <div className={`transition-all duration-300 ${
              item.id === 'scan' ? '' : activeTab === item.id ? 'text-orange-600 -translate-y-1' : 'text-stone-400 hover:text-stone-600'
            }`}>
              {item.icon}
            </div>

            {item.id !== 'scan' && (
              <>
                <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${
                  activeTab === item.id ? 'text-stone-900 opacity-100' : 'text-stone-400 opacity-0 group-hover:opacity-100'
                }`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <div className="absolute -bottom-0 w-1 h-1 bg-orange-500 rounded-full mb-1"></div>
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
