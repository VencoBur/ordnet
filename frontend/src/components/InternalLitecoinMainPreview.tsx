
export default function InternalLitecoinMainPreview({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden border border-border rounded-lg ${className}`}>
      {/* Top Nav mimicking litecoin.com */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#111113] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#345D9D] to-[#00A3E0] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">Ł</span>
          </div>
          <div className="text-2xl font-semibold tracking-tight">Litecoin</div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#what" className="hover:text-[#00A3E0] transition">What is Litecoin?</a>
          <a href="#standout" className="hover:text-[#00A3E0] transition">What Makes It Stand Out</a>
          <a href="#how" className="hover:text-[#00A3E0] transition">How to Use</a>
          <a href="#help" className="hover:text-[#00A3E0] transition">Get Involved</a>
          <a href="https://litecoin.com/litecoin-foundation" target="_blank" rel="noopener" className="hover:text-[#00A3E0] transition">Foundation</a>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 text-xs bg-[#00A3E0]/10 text-[#00A3E0] rounded-full border border-[#00A3E0]/30">LTC</div>
          <div className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Preview</div>
        </div>
      </div>

      {/* Hero Section - very close to real site */}
      <div className="px-6 pt-10 pb-8 bg-[#0a0a0f] flex-shrink-0">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-1 text-xs tracking-[2px] uppercase bg-white/5 border border-white/10 rounded-full">Decentralized Money</div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-[-1.5px] leading-[1.05] mb-4">
            Litecoin is decentralized money<br />for the modern world
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Purpose-built for everyday use. Fast, cheap, and reliable — the most used crypto for payments.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => alert('Preview: In a real integration this would open a buy flow (Coinbase etc.)')}
              className="px-8 py-3 rounded-2xl bg-white text-[#0a0a0f] font-semibold text-sm hover:bg-white/90 active:scale-[0.985] transition"
            >
              Buy Litecoin
            </button>
            <a 
              href="https://litecoin.com" 
              target="_blank" 
              rel="noopener" 
              className="px-8 py-3 rounded-2xl border border-white/30 text-sm hover:bg-white/5 flex items-center justify-center gap-2"
            >
              Learn More <span>→</span>
            </a>
          </div>

          <div className="mt-4 text-[10px] text-gray-500">Works with MetaMask, Rabby, Coinbase Wallet, Rainbow &amp; more</div>
        </div>
      </div>

      {/* What is Litecoin? */}
      <div id="what" className="px-6 py-8 border-t border-gray-800 bg-[#111113] flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-sm uppercase tracking-[1.5px] text-[#00A3E0] mb-2">The Currency</div>
          <h2 className="text-3xl font-semibold mb-4">What is Litecoin?</h2>
          <p className="text-gray-400 leading-relaxed max-w-3xl">
            Litecoin is a digital currency purpose-built for everyday use. Launched in October 2011, Litecoin remains decentralized, 
            inflation-resistant and censorship-proof. Processing over 350 million transactions without a single network interruption, 
            Litecoin (LTC) is faster and cheaper to use than Bitcoin (BTC) and is the most used crypto for payments, remittance and peer-to-peer transfers.
          </p>
        </div>
      </div>

      {/* Stand Out Section */}
      <div id="standout" className="px-6 py-8 flex-1 min-h-0 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6">What makes Litecoin Stand out</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-2xl p-5">
              <div className="text-[#00A3E0] text-sm font-medium mb-1">RELIABILITY &amp; SECURITY</div>
              <div className="font-semibold mb-2">14+ years of uptime</div>
              <p className="text-sm text-gray-400">In 14+ years, Litecoin has had zero network downtime. Never been hacked or compromised. Open 24/7, every day of the year.</p>
            </div>
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-2xl p-5">
              <div className="text-[#00A3E0] text-sm font-medium mb-1">BEST CRYPTO FOR PAYMENTS</div>
              <div className="font-semibold mb-2">Fees &lt; $0.01 • Near-instant</div>
              <p className="text-sm text-gray-400">With fees less than $0.01 and almost instantaneous settlement, Litecoin is the go-to currency for digital payments and cross-border transactions.</p>
            </div>
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-2xl p-5">
              <div className="text-[#00A3E0] text-sm font-medium mb-1">FINANCIAL PRIVACY &amp; FREEDOM</div>
              <div className="font-semibold mb-2">Opt-in confidential transactions</div>
              <p className="text-sm text-gray-400">A feature distinct to Litecoin. Allowing users to obfuscate certain transaction details giving LTC cash-like properties.</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-semibold text-white">0.01</div>
              <div className="text-xs text-gray-500">AVG. TRANSACTION FEE (USD)</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">$500M+</div>
              <div className="text-xs text-gray-500">24 HOUR VOLUME</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white">~300K</div>
              <div className="text-xs text-gray-500">AVG. TRANSACTIONS PER DAY</div>
            </div>
          </div>

          {/* How to use */}
          <div id="how" className="mt-10">
            <h3 className="text-xl font-semibold mb-4">How to use Litecoin</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {[
                { title: "Buying Litecoin", desc: "Fast and easy, wherever you are. Learn how and where you can buy LTC safely." },
                { title: "Spending Litecoin", desc: "The most popular crypto for payments. Find out how you can spend and use your Litecoin." },
                { title: "Storing Litecoin", desc: "You're in control. Find a storage solution or wallet that keeps your money secure." },
                { title: "For Business", desc: "Use by your business to make or receive payments, pay employees and trade internationally." }
              ].map((item, i) => (
                <div key={i} className="bg-[#1a1a1f] border border-gray-800 p-4 rounded-xl">
                  <div className="font-medium mb-1">{item.title}</div>
                  <div className="text-gray-400 text-xs leading-snug">{item.desc}</div>
                  <div className="mt-3 text-[#00A3E0] text-xs cursor-pointer">Find out more →</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Get involved footer area */}
      <div id="help" className="px-6 py-5 border-t border-gray-800 bg-[#111113] text-xs flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-x-10 gap-y-3 text-gray-400">
          <div>
            <span className="font-medium text-white">Donate</span> — Support the nonprofit Litecoin Foundation. <span className="text-[#00A3E0] cursor-pointer">Donate →</span>
          </div>
          <div>
            <span className="font-medium text-white">Newsletter</span> — Monthly updates on announcements, opportunities &amp; news.
          </div>
          <div>
            <span className="font-medium text-white">Volunteer</span> — Use your skills to promote or develop Litecoin. <span className="text-[#00A3E0] cursor-pointer">I'd like to volunteer →</span>
          </div>
          <div className="text-gray-500 ml-auto">© Litecoin Foundation • Internal OrdNET Preview</div>
        </div>
      </div>
    </div>
  );
}
