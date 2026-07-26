import { Link, useLocation } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";

function Navbar() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const location = useLocation();

  const shortAddress = `${address?.slice(0, 6)}...${address?.slice(-4)}`;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold text-xl">YieldMind</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className={`text-sm ${location.pathname === "/dashboard" ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            Dashboard
          </Link>
          <Link
            to="/deposit"
            className={`text-sm ${location.pathname === "/deposit" ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            Deposit
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">
            {shortAddress}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Disconnect
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
