import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Globe, Blocks } from 'lucide-react';
import { Tab } from '../types';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-text">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-text tracking-tight">OrdNET</h1>
                <p className="text-xs text-textSecondary">Universal Browser</p>
              </div>
            </div>

            <nav className="hidden md:flex gap-2">
              <button
                onClick={() => setActiveTab('web2')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'web2'
                    ? 'bg-primary text-text shadow-lg shadow-primary/20'
                    : 'text-textSecondary hover:text-text hover:bg-surface'
                }`}
              >
                <Globe size={18} />
                <span>Web2 Browser</span>
              </button>
              <button
                onClick={() => setActiveTab('web3')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'web3'
                    ? 'bg-primary text-text shadow-lg shadow-primary/20'
                    : 'text-textSecondary hover:text-text hover:bg-surface'
                }`}
              >
                <Blocks size={18} />
                <span>Web3 On-Chain</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-textSecondary">LiteForge Hackathon</span>
            </div>
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex md:hidden gap-2 mt-4">
          <button
            onClick={() => setActiveTab('web2')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'web2'
                ? 'bg-primary text-text'
                : 'text-textSecondary hover:text-text bg-background'
            }`}
          >
            <Globe size={18} />
            <span>Web2</span>
          </button>
          <button
            onClick={() => setActiveTab('web3')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'web3'
                ? 'bg-primary text-text'
                : 'text-textSecondary hover:text-text bg-background'
            }`}
          >
            <Blocks size={18} />
            <span>Web3</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
