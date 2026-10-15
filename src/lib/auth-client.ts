// ============================================================
// ArcadeKit — Better Auth client (browser)
// ============================================================

import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), usernameClient(), inferAdditionalFields<typeof auth>()],
});
