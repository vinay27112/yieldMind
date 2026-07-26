import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAccount } from "wagmi";
import ConnectPage from "./pages/ConnectPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DepositPage from "./pages/DepositPage.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
  const { isConnected } = useAccount();

  return (
    <BrowserRouter>
      {isConnected && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={isConnected ? <Navigate to="/dashboard" /> : <ConnectPage />}
        />
        <Route
          path="/dashboard"
          element={isConnected ? <DashboardPage /> : <Navigate to="/" />}
        />
        <Route
          path="/deposit"
          element={isConnected ? <DepositPage /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
