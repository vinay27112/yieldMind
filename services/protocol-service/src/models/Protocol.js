import mongoose from "mongoose";

const protocolSchema = new mongoose.Schema({
  protocol: { type: String, required: true },
  token: { type: String, required: true },
  token_address: { type: String },
  supply_apy: { type: Number, default: 0 },
  borrow_apy: { type: Number, default: 0 },
  total_liquidity: { type: Number, default: 0 },
  utilization_rate: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  fetched_at: { type: Date, default: Date.now },
});

// Compound index — one entry per protocol+token combination
protocolSchema.index({ protocol: 1, token: 1 }, { unique: true });

const Protocol = mongoose.model("Protocol", protocolSchema);
export default Protocol;
