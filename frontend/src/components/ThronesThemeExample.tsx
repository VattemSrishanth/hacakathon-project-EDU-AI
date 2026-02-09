import React from 'react';
import { useSettings } from '../context/SettingsContext';

const ThronesThemeExample: React.FC = () => {
  const { updateThemeAccessibility } = useSettings();

  const toggleTheme = () => {
    updateThemeAccessibility({
      theme: 'GAME OF THRONES'
    });
  };

  return (
    <div className="min-h-screen bg-[url('/assets/bg/stone-wall.jpg')] bg-cover bg-fixed text-gray-200 font-serif">
      {/* 1. Navbar (metal texture, silver underline) */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f1012]/95 border-b-2 border-slate-700 shadow-2xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <h1 className="text-2xl tracking-widest uppercase text-slate-200 font-cinzel text-shadow-md">
                Royal <span className="text-amber-700">Academy</span>
              </h1>
            </div>
            <div className="flex space-x-8">
              <button onClick={toggleTheme} className="text-slate-400 hover:text-amber-600 uppercase tracking-widest text-sm transition-colors duration-300">
                Switch Theme
              </button>
              <a href="#" className="text-amber-600 text-shadow-amber border-b border-amber-600/50 pb-1">Throne Room</a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">Library</a>
              <a href="#" className="text-slate-400 hover:text-slate-100 transition-colors">Armory</a>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Sidebar (stone texture, ember glow line) */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-[#111316] border-r border-slate-700 overflow-y-auto z-40">
        <div className="p-6 space-y-8">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold border-l-2 border-amber-800 pl-3">Kingdom</h3>
            <ul className="space-y-1 mt-2">
              <li className="block px-4 py-2 bg-gradient-to-r from-slate-800/50 to-transparent border-l-2 border-amber-600 text-amber-500 font-medium">Overlook</li>
              <li className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all cursor-pointer">Regions</li>
              <li className="block px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all cursor-pointer">Houses</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* 3. HeroSection (throne room background, snow + smoke logic handled by global CSS/components) */}
      <main className="ml-64 pt-20 relative">
        <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1012]/50 to-[#0f1012]" />
          
          <div className="relative z-10 text-center space-y-6 max-w-4xl px-4">
            <h2 className="text-6xl md:text-7xl font-cinzel text-slate-200 tracking-widest drop-shadow-2xl">
              Winter is <span className="text-slate-400 italic">Here</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Prepare yourself for the long night. Knowledge is the only weapon that stays sharp without a whetstone.
            </p>
            
            {/* 5. Buttons (iron style, fire glow hover) */}
            <div className="flex justify-center gap-6 mt-8">
              <button className="px-8 py-3 bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 text-slate-200 uppercase tracking-widest hover:border-amber-600 hover:text-amber-500 hover:shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all duration-300 transform hover:-translate-y-1 clip-path-polygon">
                Enter the Hall
              </button>
              <button className="px-8 py-3 bg-transparent border border-slate-700 text-slate-400 uppercase tracking-widest hover:border-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-300">
                View Map
              </button>
            </div>
          </div>
        </div>

        {/* 4. Cards (stone/metal panels, ember border on hover) */}
        <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {['The North', 'Riverlands', 'The Vale'].map((region) => (
            <div key={region} className="group relative bg-[#20232a] border border-slate-700 p-1 transition-all duration-500 hover:border-amber-700/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
              <div className="relative p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-cinzel text-slate-200 mb-2 group-hover:text-amber-500 transition-colors">{region}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Explore the ancient history and secrets of this realm. Dark times require bold decisions.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-600 uppercase tracking-wider">Status: Active</span>
                  <span className="text-amber-800 group-hover:text-amber-600 transition-colors">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 6. Footer (fade into smoke) */}
      <footer className="ml-64 border-t border-slate-800 bg-gradient-to-t from-[#0f1012] to-transparent py-12">
        <div className="max-w-7xl mx-auto px-8 text-center">
            <p className="text-slate-600 font-cinzel text-sm spacing-widest">
                The night is dark and full of terrors.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default ThronesThemeExample;
