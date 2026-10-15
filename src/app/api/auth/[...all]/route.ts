// ============================================================
// ArcadeKit — Better Auth endpoints (/api/auth/*)
// ============================================================

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
