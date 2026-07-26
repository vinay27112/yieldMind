import { useConnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ConnectPage() {
  const { connect, isPending, error } = useConnect();
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) navigate("/dashboard");
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Yield<span className="text-green-400">Mind</span>
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered DeFi yield optimization
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Connect your wallet to get started
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="mb-6">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-white font-semibold text-lg mb-2">
              What YieldMind does
            </h2>
            <ul className="text-gray-400 text-sm space-y-2 text-left">
              <li>✓ AI risk scoring for your portfolio</li>
              <li>✓ Real-time yield optimization across Aave & Compound</li>
              <li>✓ Automated rebalancing when better rates found</li>
              <li>✓ Price alerts via email</li>
            </ul>
          </div>

          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isPending}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-800 
                       text-black font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {isPending ? "Connecting..." : "Connect MetaMask"}
          </button>

          {error && (
            <p className="text-red-400 text-sm mt-3">{error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectPage;
