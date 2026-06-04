import { useState } from 'react';
import Header from './components/Header';
import Web2Browser from './components/Web2Browser';
import Web3OnChain from './components/Web3OnChain';
import Footer from './components/Footer';
import { Tab } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('web2');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'web2' ? <Web2Browser /> : <Web3OnChain />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
