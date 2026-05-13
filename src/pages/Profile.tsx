import { useTonWallet } from "@tonconnect/ui-react";
import { useEffect, useState } from "react";

export default function Profile() {
  const wallet = useTonWallet();

  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shortAddress = (addr: string) =>
    addr.slice(0, 6) + "..." + addr.slice(-4);

  const fetchBalance = async () => {
    if (!wallet) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://tonapi.io/v2/accounts/${wallet.account.address}`
      );

      const data = await res.json();

      const tonBalance = data.balance / 1e9;
      setBalance(tonBalance.toFixed(2));
    } catch (err) {
      setError("Failed to load balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [wallet]);

  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl text-green-400">Profile</h2>

      <div className="mt-6 text-gray-300">
        {wallet ? (
          <>
            <p className="text-green-400">Wallet Connected ✅</p>

            {/* ADDRESS */}
            <p className="mt-3">
              Address:
              <br />
              <span className="text-sm">
                {shortAddress(wallet.account.address)}
              </span>
            </p>

            {/* COPY BUTTON */}
            <button
              onClick={() =>
                navigator.clipboard.writeText(wallet.account.address)
              }
              className="mt-2 text-xs text-green-400 underline"
            >
              Copy Address
            </button>

            {/* BALANCE */}
            <div className="mt-4 text-lg text-green-300">
              {loading
                ? "Loading balance..."
                : error
                ? error
                : `Balance: ${balance} TON`}
            </div>

            {/* REFRESH */}
            <button
              onClick={fetchBalance}
              className="mt-3 px-4 py-2 bg-green-400 text-black rounded-lg"
            >
              Refresh Balance
            </button>
          </>
        ) : (
          <p>No wallet connected</p>
        )}
      </div>
    </div>
  );
}
