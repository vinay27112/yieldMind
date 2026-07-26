import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import {
  getPortfolio,
  getRiskScore,
  getStrategies,
  getProtocols,
} from "../services/api.js";

function DashboardPage() {
  const { address } = useAccount();
  const [portfolio, setPortfolio] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;
    loadDashboard();
  }, [address]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Fetch portfolio
      const portfolioRes = await getPortfolio(address);
      const portfolioData = portfolioRes.data.data;
      setPortfolio(portfolioData);

      // Fetch risk score
      const riskRes = await getRiskScore(portfolioData);
      setRiskData(riskRes.data.data);

      // Fetch strategies
      const strategiesRes = await getStrategies(portfolioData, "medium", 1000);
      setStrategies(strategiesRes.data.data.strategies);

      // Fetch protocols
      const protocolsRes = await getProtocols();
      setProtocols(protocolsRes.data.data.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 text-lg">Loading portfolio...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Portfolio Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Total Value</p>
            <p className="text-2xl font-bold text-white">
              $
              {portfolio?.total_value_usd?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Risk Score</p>
            <p
              className={`text-2xl font-bold ${
                riskData?.risk_score?.score > 70
                  ? "text-red-400"
                  : riskData?.risk_score?.score > 40
                    ? "text-yellow-400"
                    : "text-green-400"
              }`}
            >
              {riskData?.risk_score?.score}/100
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">In Vault</p>
            <p className="text-2xl font-bold text-green-400">
              {parseFloat(portfolio?.vault_position?.deposited || 0).toFixed(2)}{" "}
              mUSDC
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Balances */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h2 className="text-white font-semibold mb-4">Token Balances</h2>
            <div className="space-y-3">
              {portfolio?.balances?.map((token) => (
                <div
                  key={token.symbol}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium">{token.symbol}</p>
                    <p className="text-gray-400 text-sm">
                      {parseFloat(token.balance).toFixed(4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">
                      $
                      {token.value_usd?.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ${token.price_usd?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h2 className="text-white font-semibold mb-4">Risk Breakdown</h2>
            {riskData?.risk_score?.breakdown && (
              <div className="space-y-3">
                {Object.entries(riskData.risk_score.breakdown).map(
                  ([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 capitalize">{key}</span>
                        <span className="text-white">{value}/100</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            value > 70
                              ? "bg-red-400"
                              : value > 40
                                ? "bg-yellow-400"
                                : "bg-green-400"
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
            {riskData?.explanation && (
              <p className="text-gray-400 text-sm mt-4 border-t border-gray-800 pt-4">
                {riskData.explanation}
              </p>
            )}
          </div>
        </div>

        {/* AI Flags */}
        {riskData?.risk_score?.flags?.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-6">
            <h2 className="text-yellow-400 font-semibold mb-2">⚠ AI Alerts</h2>
            <ul className="space-y-1">
              {riskData.risk_score.flags.map((flag, i) => (
                <li key={i} className="text-yellow-200 text-sm">
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strategies */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
          <h2 className="text-white font-semibold mb-4">
            Recommended Strategies
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {strategies?.map((strategy, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4">
                <p className="text-white font-medium">{strategy.protocol}</p>
                <p className="text-gray-400 text-sm">{strategy.token}</p>
                <p className="text-green-400 text-xl font-bold mt-2">
                  {strategy.expected_apy}%
                </p>
                <p className="text-gray-500 text-xs">APY</p>
                <p className="text-gray-400 text-xs mt-2">
                  Risk: {strategy.risk_score}/100
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Protocols */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-semibold mb-4">
            Top Yield Opportunities
          </h2>
          <div className="space-y-2">
            {protocols?.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
              >
                <div>
                  <span className="text-white font-medium capitalize">
                    {p.protocol}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">{p.token}</span>
                </div>
                <span className="text-green-400 font-semibold">
                  {p.supply_apy}% APY
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
