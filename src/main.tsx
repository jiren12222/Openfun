main_tsx = '''import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl="https://openfun-dun.vercel.app/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
'''

env_example = '''# TON Center API Key (get from https://toncenter.com)
VITE_TONCENTER_API_KEY=your_toncenter_api_key_here

# Pinata JWT for IPFS uploads (get from https://pinata.cloud)
VITE_PINATA_JWT=your_pinata_jwt_here
'''

with open('/mnt/agents/output/main.tsx', 'w') as f:
    f.write(main_tsx)

with open('/mnt/agents/output/.env.example', 'w') as f:
    f.write(env_example)

print("All files written!")
print("\nFiles created:")
print("1. App.tsx - Main application code")
print("2. App.css - Styles")
print("3. main.tsx - Entry point")
print("4. .env.example - Environment variables template")
