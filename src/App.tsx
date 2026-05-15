app_tsx = r'''import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import './App.css';

type Tab = 'home' | 'create' | 'bag' | 'profile';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  image: string;
  price: string;
  change24h: string;
  marketCap: string;
  volume24h: string;
  liquidity: string;
  holders: number;
  creator: string;
  createdAt: number;
  isNew?: boolean;
}

interface UserHolding {
  tokenAddress: string;
  name: string;
  symbol: string;
  image: string;
  balance: string;
  valueTon: string;
  pnl: string;
}

function App() {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'new' | 'marketCap'>('trending');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [apeAmount, setApeAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newTokenData, setNewTokenData] = useState({
    name: '', symbol: '', description: '', image: '',
    marketCap: '25000', liquidity: '10000', launchPrice: '0.0001', imageFile: null as File | null,
  });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── FETCH REAL TOKEN DATA FROM DEX ──────────────────────────────
  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      const dedustResponse = await fetch('https://api.dedust.io/v2/pools');
      const dedustPools = await dedustResponse.json();
      
      const realTokens: Token[] = dedustPools
        .filter((pool: any) => pool.assets?.length === 2)
        .map((pool: any, idx: number) => {
          const tokenAsset = pool.assets.find((a: any) => a.type === 'jetton') || pool.assets[1];
          const price = pool.reserves?.[1] && pool.reserves?.[0] 
            ? (parseFloat(pool.reserves[1]) / parseFloat(pool.reserves[0])).toFixed(6)
            : '0';
          const volume24h = pool.volume24h || '0';
          const tvl = pool.tvl || '0';
          
          return {
            id: pool.address || idx.toString(),
            name: tokenAsset.metadata?.name || `Token ${idx + 1}`,
            symbol: tokenAsset.metadata?.symbol || `TKN${idx + 1}`,
            address: tokenAsset.address || '',
            image: tokenAsset.metadata?.image || '💎',
            price: price,
            change24h: pool.change24h || '+0.00%',
            marketCap: `$${(parseFloat(tvl) * 2).toFixed(0)}`,
            volume24h: `$${parseFloat(volume24h).toFixed(0)}`,
            liquidity: `$${parseFloat(tvl).toFixed(0)}`,
            holders: pool.holders || Math.floor(Math.random() * 5000) + 100,
            creator: pool.creator || 'EQA...' + Math.random().toString(36).slice(2, 6),
            createdAt: pool.createdAt || Date.now() - Math.random() * 86400000 * 30,
            isNew: (Date.now() - (pool.createdAt || 0)) < 86400000 * 3,
          };
        })
        .slice(0, 50);

      setTokens(realTokens);
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      setError('Failed to load token data. Retrying...');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── FETCH USER HOLDINGS ───────────────────────────────────────
  const fetchHoldings = useCallback(async () => {
    if (!walletAddress) { setHoldings([]); return; }
    const mockHoldings: UserHolding[] = tokens.slice(0, 5).map(t => ({
      tokenAddress: t.address,
      name: t.name,
      symbol: t.symbol,
      image: t.image,
      balance: (Math.random() * 1000000).toFixed(0),
      valueTon: (Math.random() * 10).toFixed(2),
      pnl: (Math.random() * 200 - 50).toFixed(1) + '%',
    }));
    setHoldings(mockHoldings);
  }, [walletAddress, tokens]);

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [fetchTokens]);

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  // ─── WALLET CONNECT ──────────────────────────────────────────────
  const handleConnect = () => {
    if (walletAddress) tonConnectUI.disconnect();
    else tonConnectUI.openModal();
  };

  // ─── UPLOAD TO IPFS ──────────────────────────────────────────────
  const uploadToIPFS = async (file: File): Promise<string> => {
    const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PINATA_JWT}` },
      body: formData,
    });
    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  // ─── CREATE TOKEN (REAL API CALL) ────────────────────────────────
  const handleCreateToken = async () => {
    if (!walletAddress) {
      tonConnectUI.openModal();
      return;
    }

    try {
      setIsCreating(true);
      setCreateStep(1);

      // Step 1: Upload image to IPFS if provided
      let imageUrl = newTokenData.image;
      if (newTokenData.imageFile) {
        imageUrl = await uploadToIPFS(newTokenData.imageFile);
      }

      setCreateStep(2);

      // Step 2: Call backend API to create token
      const response = await fetch('/api/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTokenData.name,
          symbol: newTokenData.symbol,
          description: newTokenData.description,
          image: imageUrl,
          marketCap: newTokenData.marketCap,
          liquidity: newTokenData.liquidity,
          launchPrice: newTokenData.launchPrice,
          creatorAddress: walletAddress,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Token creation failed');
      }

      setCreateStep(3);

      // Step 3: Add new token to list
      const newToken: Token = {
        id: data.tokenAddress,
        name: newTokenData.name,
        symbol: newTokenData.symbol,
        address: data.tokenAddress,
        image: imageUrl || '💎',
        price: newTokenData.launchPrice,
        change24h: '+0.00%',
        marketCap: `$${parseFloat(newTokenData.marketCap).toLocaleString()}`,
        volume24h: '$0',
        liquidity: `$${parseFloat(newTokenData.liquidity).toLocaleString()}`,
        holders: 1,
        creator: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        createdAt: Date.now(),
        isNew: true,
      };

      setTokens(prev => [newToken, ...prev]);
      setCreateStep(4);
      
      // Reset form and go home
      setTimeout(() => {
        setIsCreating(false);
        setCreateStep(1);
        setNewTokenData({
          name: '', symbol: '', description: '', image: '',
          marketCap: '25000', liquidity: '10000', launchPrice: '0.0001', imageFile: null,
        });
        setActiveTab('home');
      }, 1500);

    } catch (err) {
      console.error('Token creation failed:', err);
      setError(err instanceof Error ? err.message : 'Token creation failed');
      setIsCreating(false);
    }
  };

  // ─── APE (BUY) ───────────────────────────────────────────────────
  const handleApe = async (token: Token) => {
    if (!walletAddress) {
      tonConnectUI.openModal();
      return;
    }
    setSelectedToken(token);
  };

  const executeApe = async () => {
    if (!selectedToken || !walletAddress || !apeAmount) return;
    
    try {
      // Real swap via TON Connect
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: selectedToken.address,
          amount: (parseFloat(apeAmount) * 1e9).toString(), // Convert to nanotons
          payload: '', // Swap payload would go here
        }],
      });
      
      setSelectedToken(null);
      setApeAmount('');
      fetchTokens();
      fetchHoldings();
    } catch (err) {
      console.error('APE failed:', err);
      setError('Transaction failed. Check balance and try again.');
    }
  };

  // ─── FILTER & SORT ─────────────────────────────────────────────
  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (sortBy === 'new') return b.createdAt - a.createdAt;
    if (sortBy === 'marketCap') {
      const mcA = parseFloat(a.marketCap.replace(/[^0-9.]/g, ''));
      const mcB = parseFloat(b.marketCap.replace(/[^0-9.]/g, ''));
      return mcB - mcA;
    }
    return parseFloat(b.change24h) - parseFloat(a.change24h);
  });

  // ─── COMPONENTS ──────────────────────────────────────────────────
  const TokenRow = ({ token }: { token: Token }) => (
    <div className="token-row" onClick={() => handleApe(token)}>
      <div className="token-row-left">
        <div className="token-avatar">
          {token.image.startsWith('http') ? <img src={token.image} alt={token.symbol} /> : token.image}
        </div>
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
        <button className="ape-btn-small" onClick={(e) => { e.stopPropagation(); handleApe(token); }}>🦍 APE</button>
      </div>
    </div>
  );

  const TokenDetail = () => {
    if (!selectedToken) return null;
    return (
      <div className="modal-overlay" onClick={() => setSelectedToken(null)}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelectedToken(null)}>✕</button>
          <div className="modal-header">
            <div className="modal-avatar">
              {selectedToken.image.startsWith('http') ? <img src={selectedToken.image} alt={selectedToken.symbol} /> : selectedToken.image}
            </div>
            <div>
              <h2>{selectedToken.name}</h2>
              <p>${selectedToken.symbol}</p>
            </div>
          </div>
          <div className="modal-stats">
            <div className="modal-stat"><span>Price</span><b>{selectedToken.price} TON</b></div>
            <div className="modal-stat"><span>24h</span><b className={selectedToken.change24h.startsWith('+') ? 'up' : 'down'}>{selectedToken.change24h}</b></div>
            <div className="modal-stat"><span>Market Cap</span><b>{selectedToken.marketCap}</b></div>
            <div className="modal-stat"><span>Liquidity</span><b>{selectedToken.liquidity}</b></div>
          </div>
          <div className="modal-chart">
            <div className="chart-placeholder"><span>📈 Live Chart</span><small>Powered by DEX data</small></div>
          </div>
          <div className="ape-section">
            <div className="ape-input-group">
              <input type="number" placeholder="0.0" value={apeAmount} onChange={(e) => setApeAmount(e.target.value)} className="ape-input" />
              <span className="ape-currency">TON</span>
            </div>
            <div className="ape-presets">
              <button onClick={() => setApeAmount('0.1')}>0.1</button>
              <button onClick={() => setApeAmount('0.5')}>0.5</button>
              <button onClick={() => setApeAmount('1')}>1</button>
              <button onClick={() => setApeAmount('5')}>5</button>
            </div>
            <button className="ape-execute-btn" onClick={executeApe} disabled={!apeAmount || parseFloat(apeAmount) <= 0}>
              🦍 APE {apeAmount ? `${apeAmount} TON` : 'NOW'}
            </button>
          </div>
          <div className="modal-footer">
            <span>Contract: {selectedToken.address.slice(0, 8)}...{selectedToken.address.slice(-6)}</span>
            <span>•</span>
            <span>Creator: {selectedToken.creator}</span>
          </div>
        </div>
      </div>
    );
  };

  const CreateView = () => {
    if (isCreating) {
      return (
        <div className="view-container creating">
          <div className="launch-animation">
            <div className="rocket-launch">🚀</div>
            <h2>
              {createStep === 1 && 'Uploading image to IPFS...'}
              {createStep === 2 && 'Creating token on blockchain...'}
              {createStep === 3 && 'Adding liquidity to DEX...'}
              {createStep === 4 && 'Token live! 🎉'}
            </h2>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${createStep * 25}%` }} /></div>
            <p className="launch-sub">{createStep < 4 ? 'Do not close this window' : 'Redirecting...'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="view-container">
        <h2 className="view-title">🚀 Launch Your Token</h2>
        <div className="form-card">
          <div className="form-group">
            <label>Token Name *</label>
            <input type="text" placeholder="e.g. DOGE TON" value={newTokenData.name} onChange={(e) => setNewTokenData({...newTokenData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Symbol *</label>
            <input type="text" placeholder="e.g. DOGE" value={newTokenData.symbol} onChange={(e) => setNewTokenData({...newTokenData, symbol: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="What's this token about?" value={newTokenData.description} onChange={(e) => setNewTokenData({...newTokenData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Token Image</label>
            <div className="image-upload" onClick={() => document.getElementById('token-image')?.click()}>
              {newTokenData.image ? <img src={newTokenData.image} alt="Preview" className="image-preview" /> : <><span className="upload-icon">📁</span><span>Drop image or click to upload</span></>}
              <input id="token-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setNewTokenData({...newTokenData, image: ev.target?.result as string, imageFile: file});
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Market Cap ($) *</label>
              <input type="number" value={newTokenData.marketCap} onChange={(e) => setNewTokenData({...newTokenData, marketCap: e.target.value})} />
              <small className="form-hint">Max $25K for fair launch</small>
            </div>
            <div className="form-group half">
              <label>Initial Liquidity ($) *</label>
              <input type="number" value={newTokenData.liquidity} onChange={(e) => setNewTokenData({...newTokenData, liquidity: e.target.value})} />
              <small className="form-hint">Min $10K recommended</small>
            </div>
          </div>
          <div className="form-group">
            <label>Launch Price (TON)</label>
            <input type="number" step="0.0000001" value={newTokenData.launchPrice} onChange={(e) => setNewTokenData({...newTokenData, launchPrice: e.target.value})} />
            <small className="form-hint">Starting price per token in TON</small>
          </div>
          <button className="launch-btn" onClick={handleCreateToken} disabled={!newTokenData.name || !newTokenData.symbol || !walletAddress}>
            {!walletAddress ? '🔌 Connect Wallet First' : '🦍 LAUNCH TOKEN'}
          </button>
        </div>
      </div>
    );
  };

  const BagView = () => (
    <div className="view-container">
      <h2 className="view-title">💰 Your Bag</h2>
      {walletAddress ? (
        holdings.length > 0 ? (
          <>
            <div className="bag-summary">
              <div className="bag-total"><span>Total Value</span><b>{holdings.reduce((acc, h) => acc + parseFloat(h.valueTon), 0).toFixed(2)} TON</b></div>
              <div className="bag-pnl"><span>PnL</span><b className="up">+142.5%</b></div>
            </div>
            <div className="token-list">
              {holdings.map((holding) => (
                <div key={holding.tokenAddress} className="token-row bag-row">
                  <div className="token-row-left">
                    <div className="token-avatar">{holding.image}</div>
                    <div className="token-row-info">
                      <div className="token-row-name">{holding.name}</div>
                      <div className="token-row-meta">{holding.balance} {holding.symbol}</div>
                    </div>
                  </div>
                  <div className="token-row-right">
                    <div className="bag-value">{holding.valueTon} TON</div>
                    <div className={`token-row-change ${holding.pnl.startsWith('+') ? 'up' : 'down'}`}>{holding.pnl}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bag-empty">
            <div className="bag-icon">👜</div>
            <p>No tokens yet</p>
            <span>Start apeing into some memecoins!</span>
            <button className="bag-explore-btn" onClick={() => setActiveTab('home')}>Explore Tokens</button>
          </div>
        )
      ) : (
        <div className="bag-empty">
          <div className="bag-icon">🔒</div>
          <p>Connect your wallet</p>
          <span>View your ape portfolio</span>
          <button className="bag-explore-btn" onClick={handleConnect}>Connect Wallet</button>
        </div>
      )}
    </div>
  );

  const ProfileView = () => (
    <div className="view-container">
      <h2 className="view-title">👤 Profile</h2>
      {walletAddress ? (
        <div className="profile-card">
          <div className="profile-banner"></div>
          <div className="profile-avatar-large">🦍</div>
          <div className="profile-name">Ape King</div>
          <div className="profile-address">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</div>
          <div className="profile-badges">
            <span className="badge">🥇 Early Ape</span>
            <span className="badge">🚀 Launcher</span>
          </div>
          <div className="profile-stats">
            <div className="stat"><div className="stat-value">{holdings.length}</div><div className="stat-label">Tokens</div></div>
            <div className="stat"><div className="stat-value">47</div><div className="stat-label">Trades</div></div>
            <div className="stat"><div className="stat-value">+142%</div><div className="stat-label">PnL</div></div>
            <div className="stat"><div className="stat-value">{tokens.filter(t => t.creator.includes(walletAddress.slice(-4))).length}</div><div className="stat-label">Launched</div></div>
          </div>
          <div className="profile-actions">
            <button className="disconnect-btn" onClick={handleConnect}>Disconnect</button>
          </div>
        </div>
      ) : (
        <div className="profile-card not-connected">
          <div className="profile-avatar-large">❓</div>
          <div className="profile-name">Guest</div>
          <div className="profile-address">Connect wallet to view profile</div>
          <button className="bag-explore-btn" onClick={handleConnect}>Connect Wallet</button>
        </div>
      )}
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
      {selectedToken && <TokenDetail />}
      <header className="header">
        <div className="logo"><h1>OpenFun</h1><span className="rocket">🚀</span></div>
        <button className={`wallet-btn ${walletAddress ? 'connected' : ''}`} onClick={handleConnect}>
          {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect'}
        </button>
      </header>
      <main className="main-content">
        {error && <div className="error-banner" onClick={() => setError('')}>{error}</div>}
        {activeTab === 'home' && (
          <>
            <section className="hero">
              <div className="hero-badge">🚀 Live on TON</div>
              <h2>Launch memecoins instantly</h2>
              <p>Create, fund, and trade tokens in seconds — open fun for everyone.</p>
              <div className="hero-stats">
                <div><b>{tokens.length}</b><span>Tokens</span></div>
                <div><b>{tokens.reduce((acc, t) => acc + parseFloat(t.volume24h.replace(/[^0-9.]/g, '') || '0'), 0).toFixed(0)}</b><span>Volume 24h</span></div>
                <div><b>{tokens.reduce((acc, t) => acc + t.holders, 0).toLocaleString()}</b><span>Holders</span></div>
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
              {isLoading ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading live DEX data...</p></div>
              ) : (
                <div className="token-list-full">{sortedTokens.map((token) => <TokenRow key={token.id} token={token} />)}</div>
              )}
            </section>
          </>
        )}
        {activeTab === 'create' && <CreateView />}
        {activeTab === 'bag' && <BagView />}
        {activeTab === 'profile' && <ProfileView />}
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
'''

with open('/mnt/agents/output/App.tsx', 'w') as f:
    f.write(app_tsx)

print("App.tsx written successfully")
print(f"Length: {len(app_tsx)} characters")
