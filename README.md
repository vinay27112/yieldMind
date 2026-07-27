# YieldMind

AI-powered DeFi yield optimization and risk management platform. An
8-service event-driven backend behind three Solidity contracts deployed on
Sepolia, with an AI microservice for risk scoring and strategy
recommendations.

**Status:** In active development — architecture and contracts are built and
Sepolia-deployed, but not live-hosted (see [Deployment status](#deployment-status)).
**Repo:** https://github.com/vinay27112/yieldMind

---

## How it works

A user connects a wallet (via wagmi/viem on the frontend) and deposits funds
through the `execution-service`, which submits transactions to the
`YieldVault` contract on Sepolia. Behind the scenes, the `ai-service` scores
risk and recommends strategies using Groq/Gemini, `price-feed-service` and
`protocol-service` keep live market data flowing, and everything
communicates asynchronously over **Kafka** rather than direct service-to-service
HTTP calls — so, for example, a price update published by
`price-feed-service` can be consumed by both `ai-service` (to re-score risk)
and `notification-service` (to alert a user) without those two services
knowing about each other.

## Architecture

```
services/
  auth-service/          Node.js — user accounts, JWT sessions
  wallet-service/         Node.js — wallet linking, on-chain balance reads
  protocol-service/       Node.js — tracks supported DeFi protocols & yield rates
  price-feed-service/     Node.js — ingests & normalizes live asset prices
  execution-service/      Node.js — signs & submits deposit/withdraw/rebalance txns
  ai-service/              Python/FastAPI — risk scoring & strategy recs (Groq/Gemini)
  analytics-service/       Python/FastAPI — aggregates historical performance
  notification-service/    Node.js — Kafka consumer, dispatches email alerts
contracts/                Solidity (Hardhat) — YieldVault, RiskOracle, AlertRegistry
frontend/                 React + wagmi + viem + recharts
```

### Smart contracts (deployed on Sepolia)

| Contract | Purpose |
|---|---|
| `YieldVault.sol` | `deposit()`, `withdraw()`, `rebalance()` — role-gated via OpenZeppelin AccessControl, guarded with ReentrancyGuard and Pausable |
| `RiskOracle.sol` | On-chain risk scoring |
| `AlertRegistry.sol` | User-configured alert thresholds |
| `MockERC20.sol` / `MockProtocol.sol` | Test doubles for local/testnet development |

Deployed addresses are tracked in `contracts/ignition/deployed-addresses.json`.

### Inter-service communication

All 8 services + Kafka are wired together via the root `docker-compose.yml`
for local development. There is no API gateway in front of them — the
frontend currently calls each service's port directly (see Frontend section).

## Environment variables

Every service has its own `.env`. Keys actually used, by service:

**auth-service**
```
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
```

**execution-service**
```
PORT=
MONGODB_URI=
SEPOLIA_RPC_URL=
PRIVATE_KEY=            # signer wallet that submits on-chain transactions
YIELD_VAULT_ADDRESS=
MOCK_USDC_ADDRESS=
MOCK_AAVE_ADDRESS=
MOCK_COMPOUND_ADDRESS=
KAFKA_BROKERS=
```

**analytics-service**
```
PORT=
DATABASE_URL=
KAFKA_BROKERS=
```

*(wallet-service, protocol-service, price-feed-service, ai-service, and
notification-service each have their own `.env` too — check each service's
folder directly; most need at minimum `PORT`, `KAFKA_BROKERS`, and a
database connection string, with `ai-service` additionally needing a
Groq/Gemini API key.)*

**frontend**
```
Currently hardcoded per-service URLs in src/services/api.js, e.g.:
AUTH_URL = http://localhost:3001
WALLET_URL = http://localhost:3002
AI_URL = http://localhost:5001
EXECUTION_URL = http://localhost:3005
PROTOCOL_URL = http://localhost:3004
ANALYTICS_URL = http://localhost:5002
```
Should be moved to `VITE_*` env vars before any real deployment — see
Known limitations.

> **Security note:** two `.env` files (execution-service, analytics-service)
> were previously committed to this repo with real credentials (a wallet
> private key and a database connection string). Those files have since
> been untracked and `.gitignore` added, and the exposed credentials should
> be treated as compromised and rotated if that hasn't already happened.
> Never commit a real `.env` — only commit `.env.example` files with keys
> but empty values.

## Running locally

```bash
docker-compose up --build
```
This brings up Kafka and all 8 services together. Each service also has its
own Dockerfile and can be run individually with `docker build` + `docker run`
if you only need one.

Frontend, separately:
```bash
cd frontend
npm install
npm run dev
```

## Docker

Every service has its own `Dockerfile`, and the root `docker-compose.yml`
orchestrates all 8 services plus a Kafka broker for local development. This
part is fully built out and working.

## Kubernetes

**Status: not yet built.** This is the main piece of outstanding
infrastructure work. Planned approach, once resumed:

- One `Deployment` + `Service` pair per microservice (8 total), following
  the same pattern: a `ConfigMap` for non-sensitive config (ports, timeouts),
  a `Secret` for credentials (created via `kubectl create secret`, never
  committed to git — Kubernetes Secrets are base64-encoded, not encrypted,
  so committing one is exactly as unsafe as committing a `.env`).
- A Kafka deployment (likely via a Helm chart like Bitnami's, rather than
  hand-rolled manifests, given Kafka's operational complexity).
- All resources scoped to a single `yieldmind` namespace.

No manifests exist in this repo yet.

## Deployment status

**Not deployed.** Given the architecture — 8 independent services, no API
gateway, and a Kafka broker — a full live deployment isn't a practical use
of free-tier hosting. The contracts themselves *are* live on Sepolia (real,
verifiable transactions), and every service runs correctly locally via
Docker Compose; this is presented as a completed, working architecture
rather than a hosted demo.

If a partial live demo is ever wanted, the realistic path is deploying just
`auth-service` + `execution-service` + `frontend` (enough for a deposit
flow against the real contracts), with the rest of the architecture
documented rather than hosted.

## Known limitations

- No API gateway — frontend calls all 6 relevant services directly by URL,
  currently hardcoded to `localhost`. Needs a gateway (or at minimum,
  env-var-driven URLs) before any real deployment.
- No Kubernetes manifests (see above).
- No automated tests for the smart contracts — verified manually against
  Sepolia rather than via a Hardhat test suite. `contracts/test/Lock.js` is
  leftover Hardhat boilerplate unrelated to the actual contracts and should
  be replaced with real tests for YieldVault/RiskOracle/AlertRegistry.
- No automated tests for any of the 8 services.
