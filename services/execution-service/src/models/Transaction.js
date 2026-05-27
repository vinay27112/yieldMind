import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user_address: { type: String, required: true },
  type: {
    type: String,
    enum: ["deposit", "withdraw", "rebalance"],
    required: true,
  },
  token_address: { type: String, required: true },
  token_symbol: { type: String },
  amount: { type: String, required: true },
  from_protocol: { type: String },
  to_protocol: { type: String },
  tx_hash: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending",
  },
  gas_used: { type: String },
  error_message: { type: String },
  created_at: { type: Date, default: Date.now },
  confirmed_at: { type: Date },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
