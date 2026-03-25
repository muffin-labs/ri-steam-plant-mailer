import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Compare a plaintext password against the stored bcrypt hash.
 * Returns true if the password matches.
 */
export async function verifyPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error("ADMIN_PASSWORD_HASH environment variable is not set");
  }
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT with a 24-hour expiry.
 */
export function createToken() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
}

/**
 * Verify a JWT and return the decoded payload, or null if invalid/expired.
 */
export function verifyToken(token) {
  if (!JWT_SECRET) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract the admin token from the "admin_token" cookie on an incoming request.
 */
export function getTokenFromRequest(request) {
  const cookie = request.cookies?.get("admin_token");
  return cookie?.value ?? null;
}

/**
 * Middleware helper that verifies the admin token.
 * Returns null if auth succeeds (caller should proceed),
 * or a 401 NextResponse if auth fails.
 */
export function requireAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Auth succeeded — return null so the caller knows to proceed
  return null;
}
