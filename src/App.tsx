import { useState } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import './App.css';

type Tab = 'home' | 'create' | 'bag' | 'profile';

function App() {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const newTokens = [
    { name: 'DOGE TON', price: '0.00042 TON', change: '+12.5%' },
    { name: 'PEPE TON', price: '0.00038 TON', change: '+8.2%' },
    { name: 'SHIB TON', price: '0.00031 TON', change: '+24.1%' },
    { name: 'FLOKI TON', price: '0.00029 TON', change: '-3.4%' },
    { name: 'BONK TON', price: '0.00045 TON', change: '+15.7%' },
    { name: 'WIF TON', price: '0.00052 TON', change: '+31.2%' },
    { name: 'BOME TON', price: '0.00019 TON', change: '+5.8%' },
    { name: 'POPCAT TON', price: '0.00067 TON', change: '+18.9%' },
    { name: 'MOG TON', price: '0.00024 TON', change: '-1.2%' },
    { name: 'SPX TON', price: '0.00089 TON', change: '+42.3%' },
    { name: 'GIGA TON', price: '0.00055 TON', change: '+9.6%' },
    { name: 'TURBO TON', price: '0.00033 TON', change: '+7.4%' },
  ];

  const trendTokens = [
    { name: 'WOJAK TON', price: '0.00071 TON', change: '+56.8%' },
    { name: 'NPC TON', price: '0.00028 TON', change: '+22.4%' },
    { name: 'CHAD TON', price: '0.00095 TON', change: '+38.1%' },
    { name: 'LADY TON', price: '0.00041 TON', change: '+11.3%' },
    { name: 'BOBER TON', price: '0.00022 TON', change: '+67.5%' },
    { name: 'HARRY TON', price: '0.00036 TON', change: '+14.2%' },
    { name: 'ZOOMER TON', price: '0.00048 TON', change: '+19.7%' },
    { name: 'BRAINLET TON', price: '0.00015 TON', change: '+88.4%' },
    { name: 'GRUG TON', price: '0.00062 TON', change: '+5.1%' },
    { name: 'HOSKY TON', price: '0.00027 TON', change: '+33.6%' },
    { name: 'SNEK TON', price: '0.00053 TON', change: '+12.9%' },
    { name: 'CUMROCKET', price: '0.00044 TON', change: '+99.9%' },
  ];

  const handleConnect = () => {
    if (walletAddress) {
      tonConnectUI.disconnect();
    } else {
      tonConnectUI.openModal();
    }
  };

  const handleApe = (tokenName: string) => {
    if (!walletAddress) {
      alert('🦍 Connect your wallet first to APE!');
      tonConnectUI.openModal();
      return;
    }
    alert(`🦍 APE MODE ACTIVATED for ${tokenName}!\n\nWallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
  };

  const TokenCard = ({ token }: { token: typeof newTokens[0] }) => (
    <div className="token-card">
      <div className="token-info">
        <div className="token-name">{token.name}</div>
        <div className="token-price-row">
          <span className="token-price">{token.price}</span>
          <span className={`token-change ${token.change.startsWith('+') ? 'positive' : 'negative'}`}>
            {token.change}
          </span>
        </div>
      </div>
      <button className="ape-button" onClick={() => handleApe(token.name)}>
        <span className="ape-icon">🦍</span>
        <span className="ape-text">APE</span>
      </button>
    </div>
  );

  const HomeView = () => (
    <>
      <section className="hero">
        <h2>Launch memecoins instantly on TON</h2>
        <p>Create, fund, and trade tokens in seconds — open fun for everyone.</p>
        <button className="create-btn" onClick={() => setActiveTab('create')}>Create Token</button>
      </section>

      <section className="token-section">
        <div className="token-grid">
          <div className="token-column">
            <h3 className="column-title">
              <span className="new-badge">NEW</span>
              Newly Launch
            </h3>
            <div className="token-list">
              {newTokens.map((token) => (
                <TokenCard key={`new-${token.name}`} token={token} />
              ))}
            </div>
          </div>

          <div className="token-column">
            <h3 className="column-title">
              <span className="fire">🔥</span>
              Trending
            </h3>
            <div className="token-list">
              {trendTokens.map((token) => (
                <TokenCard key={`trend-${token.name}`} token={token} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const CreateView = () => (
    <div className="view-container">
      <h2 className="view-title">🚀 Create Token</h2>
      <div className="form-card">
        <div className="form-group">
          <label>Token Name</label>
          <input type="text" placeholder="e.g. DOGE TON" />
        </div>
        <div className="form-group">
          <label>Symbol</label>
          <input type="text" placeholder="e.g. DOGE" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea placeholder="What's this token about?" />
        </div>
        <div className="form-group">
          <label>Initial Liquidity (TON)</label>
          <input type="number" placeholder="1.0" />
        </div>
        <button className="launch-btn">🦍 LAUNCH TOKEN</button>
      </div>
    </div>
  );

  const BagView = () => (
    <div className="view-container">
      <h2 className="view-title">💰 Your Bag</h2>
      {walletAddress ? (
        <div className="bag-connected">
          <div className="wallet-info">
            <span className="wallet-label">Connected</span>
            <span className="wallet-addr">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</span>
          </div>
          <div className="bag-empty">
            <div className="bag-icon">👜</div>
            <p>No tokens yet</p>
            <span>Start apeing into some memecoins!</span>
            <button className="bag-explore-btn" onClick={() => setActiveTab('home')}>Explore Tokens</button>
          </div>
        </div>
      ) : (
        <div className="bag-empty">
          <div className="bag-icon">🔒</div>
          <p>Wallet not connected</p>
          <span>Connect your wallet to see your bag</span>
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
          <div className="profile-avatar">🦍</div>
          <div className="profile-name">Ape King</div>
          <div className="profile-address">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">12</div>
              <div className="stat-label">Tokens</div>
            </div>
            <div className="stat">
              <div className="stat-value">47</div>
              <div className="stat-label">Trades</div>
            </div>
            <div className="stat">
              <div className="stat-value">+142%</div>
              <div className="stat-label">PnL</div>
            </div>
          </div>
          <button className="disconnect-btn" onClick={handleConnect}>Disconnect</button>
        </div>
      ) : (
        <div className="profile-card not-connected">
          <div className="profile-avatar">❓</div>
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
      <header className="header">
        <div className="logo">
          <h1>OpenFun</h1>
          <span className="rocket">🚀</span>
        </div>
        <button className={`wallet-btn ${walletAddress ? 'connected' : ''}`} onClick={handleConnect}>
          {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <main className="main-content">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'create' && <CreateView />}
        {activeTab === 'bag' && <BagView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
