import { useAccount } from "wagmi";
import { useState } from "react";
import { deposit, getTransactions } from "../services/api.js";
import { useEffect } from "react";

const PROTOCOLS = [
  {
    name: "MockAave",
    address: "0x08fB0862ED02622EE9646f680B8B2EFcf2C78119",
    apy: 4.8,
  },
  {
    name: "MockCompound",
    address: "0x279a5354196e881B77cF20eD7CD2ceef53128b02",
    apy: 5.2,
  },
];

const MUSDC_ADDRESS = "0x93B46Ac2E2605F3B8b44EDC2dBfD90A5BfCA222E";

function DepositPage() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (address) loadTransactions();
  }, [address]);

  const loadTransactions = async () => {
    try {
      const res = await getTransactions(address);
      setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setTxHash(null);
      const res = await deposit(
        address,
        MUSDC_ADDRESS,
        amount,
        selectedProtocol.address,
      );
      setTxHash(res.data.txHash);
      await loadTransactions();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Deposit to Vault</h1>
          <p className="text-gray-400 text-sm mt-1">
            Deposit mUSDC to start earning yield
          </p>
        </div>

        {/* Deposit Form */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
          {/* Protocol Selection */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">
              Select Protocol
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedProtocol(p)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedProtocol.name === p.name
                      ? "border-green-500 bg-green-900/20"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-green-400 text-sm">{p.apy}% APY</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">
              Amount (mUSDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                         text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Summary */}
          {amount && (
            <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Protocol</span>
                <span className="text-white">{selectedProtocol.name}</span>
              </div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Amount</span>
                <span className="text-white">{amount} mUSDC</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Expected APY</span>
                <span className="text-green-400">{selectedProtocol.apy}%</span>
              </div>
            </div>
          )}

          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-800
                       text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Depositing... (waiting for Sepolia)" : "Deposit"}
          </button>

          {txHash && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <p className="text-green-400 text-sm font-medium">
                Transaction confirmed!
              </p>
              <a>
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="text-green-300 text-xs hover:underline break-all"
                {txHash}
              </a>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>

        {/* Transaction History */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex justify-between items-center py-2 
                                              border-b border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-white capitalize">{tx.type}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">
                      {(parseFloat(tx.amount) / 1e18).toFixed(2)} mUSDC
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        tx.status === "confirmed"
                          ? "bg-green-900/50 text-green-400"
                          : tx.status === "failed"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositPage;
