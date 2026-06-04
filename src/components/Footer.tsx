export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <p className="text-textSecondary text-sm leading-relaxed max-w-3xl mx-auto">
            Early Web4 foundations • Web2 + Web3 in one interface • Shards secured by Litecoin Scrypt PoW • Reassembled on LitVM
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-textSecondary">
            <span>Built for LiteForge Hackathon</span>
            <span>•</span>
            <span>LitVM Testnet (4441)</span>
            <span>•</span>
            <a
              href="https://github.com/yourusername/ordnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              View Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
