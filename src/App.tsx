import { useState } from 'react';
import './App.css';

type Tab = 'home' | 'create' | 'bag' | 'profile';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [walletConnected, setWalletConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'new' | 'marketCap'>('trending');

  const tokens = [
    { id: '1', name: 'DOGE TON', symbol: 'DOGE', price: '0.00042', change24h: '+142.5%', marketCap: '$420K', volume24h: '$89K', holders: 1247, image: '🐕', creator: 'EQA...7x9B', isNew: true },
    { id: '2', name: 'PEPE TON', symbol: 'PEPE', price: '0.00038', change24h: '+89.2%', marketCap: '$1.2M', volume24h: '$234K', holders: 3456, image: '🐸', creator: 'EQB...3k2M', isNew: true },
    { id: '3', name: 'SHIB TON', symbol: 'SHIB', price: '0.00031', change24h: '+67.1%', marketCap: '$890K', volume24h: '$156K', holders: 2890, image: '🐕‍🦺', creator: 'EQC...9p4R' },
    { id: '4', name: 'FLOKI TON', symbol: 'FLOKI', price: '0.00029', change24h: '-12.4%', marketCap: '$234K', volume24h: '$45K', holders: 678, image: '🛡️', creator: 'EQD...2n8T' },
    { id: '5', name: 'BONK TON', symbol: 'BONK', price: '0.00045', change24h: '+234.7%', marketCap: '$2.1M', volume24h: '$567K', holders: 5678, image: '🔨', creator: 'EQE...5m1W', isNew: true },
    { id: '6', name: 'WIF TON', symbol: 'WIF', price: '0.00052', change24h: '+156.3%', marketCap: '$3.4M', volume24h: '$890K', holders: 8901, image: '🎩', creator: 'EQF...8j5Y' },
    { id: '7', name: 'BOME TON', symbol: 'BOME', price: '0.00019', change24h: '+445.8%', marketCap: '$567K', volume24h: '$123K', holders: 1567, image: '📚', creator: 'EQG...1h4U', isNew: true },
    { id: '8', name: 'POPCAT TON', symbol: 'POPCAT', price: '0.00067', change24h: '+78.9%', marketCap: '$1.8M', volume24h: '$345K', holders: 4321, image: '😺', creator: 'EQH...6k9I' },
  ];

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortBy === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    if (sortBy === 'marketCap') return parseFloat(b.marketCap.replace(/[^0-9.]/g, '')) - parseFloat(a.marketCap.replace(/[^0-9.]/g, ''));
    return parseFloat(b.change24h) - parseFloat(a.change24h);
  });

  const handleConnect = () => {
    setWalletConnected(!walletConnected);
  };

  const handleApe = (tokenName: string) => {
    if (!walletConnected) {
      alert('Connect wallet first!');
      return;
    }
    alert(`🦍 APE'D into ${tokenName}!`);
  };

  const TokenRow = ({ token }: { token: typeof tokens[0] }) => (
    <div className="token-row">
      <div className="token-row-left">
        <div className="token-avatar">{token.image}</div>
        <div className="token-row-info">
          <div className="token-row-name">
            {token.name}
            {token.isNew && <span className="new-pill">NEW</span>}
          </div>
          <div className="token-row-meta">MC {token.marketCap} • {token.holders.toLocaleString()} holders</div>
        </div>
      </div>
      <div className="token-row-right">
        <div className={`token-row-change ${token.change24h.startsWith('+') ? 'up' : 'down'}`}>{token.change24h}</div>
        <button className="ape-btn-small" onClick={() => handleApe(token.name)}>🦍 APE</button>
      </div>
    </div>
  );

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'create', icon: '➕', label: 'Create' },
    { id: 'bag', icon: '💰', label: 'Bag' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo"><h1>OpenFun</h1><span className="rocket">🚀</span></div>
        <button className={`wallet-btn ${walletConnected ? 'connected' : ''}`} onClick={handleConnect}>
          {walletConnected ? 'EQA1...9xB' : 'Connect'}
        </button>
      </header>

      <main className="main-content">
        {activeTab === 'home' && (
          <>
            <section className="hero">
              <div className="hero-badge">🚀 Live on TON</div>
              <h2>Launch memecoins instantly</h2>
              <p>Create, fund, and trade tokens in seconds — open fun for everyone.</p>
              <div className="hero-stats">
                <div><b>{tokens.length}</b><span>Tokens</span></div>
                <div><b>$2.4M</b><span>Volume 24h</span></div>
                <div><b>28K</b><span>Holders</span></div>
              </div>
              <button className="create-btn" onClick={() => setActiveTab('create')}>🚀 Create Token</button>
            </section>

            <section className="token-section">
              <div className="section-header">
                <div className="search-bar">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search tokens..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="sort-tabs">
                  <button className={sortBy === 'trending' ? 'active' : ''} onClick={() => setSortBy('trending')}>🔥 Trending</button>
                  <button className={sortBy === 'new' ? 'active' : ''} onClick={() => setSortBy('new')}>🆕 New</button>
                  <button className={sortBy === 'marketCap' ? 'active' : ''} onClick={() => setSortBy('marketCap')}>📊 Market Cap</button>
                </div>
              </div>
              <div className="token-list-full">
                {sortedTokens.map((token) => <TokenRow key={token.id} token={token} />)}
              </div>
            </section>
          </>
        )}

        {activeTab === 'create' && (
          <div className="view-container">
            <h2 className="view-title">🚀 Launch Your Token</h2>
            <div className="form-card">
              <div className="form-group">
                <label>Token Name *</label>
                <input type="text" placeholder="e.g. DOGE TON" />
              </div>
              <div className="form-group">
                <label>Symbol *</label>
                <input type="text" placeholder="e.g. DOGE" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="What's this token about?" />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Market Cap ($) *</label>
                  <input type="number" defaultValue="25000" />
                  <small className="form-hint">Max $25K for fair launch</small>
                </div>
                <div className="form-group half">
                  <label>Initial Liquidity ($) *</label>
                  <input type="number" defaultValue="10000" />
                  <small className="form-hint">Min $10K recommended</small>
                </div>
              </div>
              <div className="form-group">
                <label>Launch Price (TON)</label>
                <input type="number" step="0.0000001" defaultValue="0.0001" />
              </div>
              <button className="launch-btn" onClick={() => alert('Token launched! 🚀')}>
                🦍 LAUNCH TOKEN
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bag' && (
          <div className="view-container">
            <h2 className="view-title">💰 Your Bag</h2>
            {walletConnected ? (
              <div className="bag-empty">
                <div className="bag-icon">👜</div>
                <p>No tokens yet</p>
                <span>Start apeing into some memecoins!</span>
                <button className="bag-explore-btn" onClick={() => setActiveTab('home')}>Explore Tokens</button>
              </div>
            ) : (
              <div className="bag-empty">
                <div className="bag-icon">🔒</div>
                <p>Connect your wallet</p>
                <button className="bag-explore-btn" onClick={handleConnect}>Connect Wallet</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="view-container">
            <h2 className="view-title">👤 Profile</h2>
            {walletConnected ? (
              <div className="profile-card">
                <div className="profile-banner"></div>
                <div className="profile-avatar-large">🦍</div>
                <div className="profile-name">Ape King</div>
                <div className="profile-address">EQA1...9xB</div>
                <div className="profile-stats">
                  <div className="stat"><div className="stat-value">0</div><div className="stat-label">Tokens</div></div>
                  <div className="stat"><div className="stat-value">0</div><div className="stat-label">Trades</div></div>
                  <div className="stat"><div className="stat-value">0%</div><div className="stat-label">PnL</div></div>
                  <div className="stat"><div className="stat-value">0</div><div className="stat-label">Launched</div></div>
                </div>
                <div className="profile-actions">
                  <button className="disconnect-btn" onClick={handleConnect}>Disconnect</button>
                </div>
              </div>
            ) : (
              <div className="profile-card not-connected">
                <div className="profile-avatar-large">❓</div>
                <div className="profile-name">Guest</div>
                <button className="bag-explore-btn" onClick={handleConnect}>Connect Wallet</button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
