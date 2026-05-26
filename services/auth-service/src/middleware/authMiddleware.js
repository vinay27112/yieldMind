import jwt from "jsonwebtoken";
import { error } from "../utils/response.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, "No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload to req.user
    next();
  } catch (err) {
    return error(res, "Invalid or expired token", 401);
  }
};
