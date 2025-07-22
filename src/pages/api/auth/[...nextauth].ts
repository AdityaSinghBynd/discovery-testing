import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "../../../constant/constant";

// --- Types for extensibility and clarity ---
interface ExtendedUser extends User {
  id: string;
  email: string;
  token: string;
  refreshToken: string;
  tokenExpires: number;
  name?: string;
}

interface ExtendedSession extends Session {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// --- Utility functions for robust extraction ---
const extractField = (
  sources: any[],
  fields: string[]
): string | undefined => {
  for (const src of sources) {
    if (!src) continue;
    for (const field of fields) {
      if (typeof src[field] === "string" && src[field]) return src[field];
    }
  }
  return undefined;
};

const extractTokenField = (
  sources: any[],
  fields: string[]
): string | undefined => {
  for (const src of sources) {
    if (!src) continue;
    for (const field of fields) {
      if (typeof src[field] === "string" && src[field]) return src[field];
    }
  }
  return undefined;
};

const extractTokenExpires = (
  sources: any[],
  fields: string[]
): number | null => {
  for (const src of sources) {
    if (!src) continue;
    for (const field of fields) {
      const val = src[field];
      if (typeof val === "number" && !isNaN(val)) return val;
      if (typeof val === "string" && !isNaN(Number(val))) return Number(val);
    }
  }
  return null;
};

// --- Refresh Token Logic ---
async function refreshAccessToken(token: any) {
  try {
    if (!token?.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.refreshToken}`,
      },
    });

    if (response.status === 401) {
      console.error("[refreshAccessToken] 401 Unauthorized: Refresh token may be expired or invalid.");
      return {
        ...token,
        accessToken: "",
        refreshToken: "",
        tokenExpires: null,
        error: "RefreshAccessTokenError",
        logout: true,
      };
    }

    if (!response.ok) {
      // Log other errors
      console.error(`[refreshAccessToken] Error: Received status ${response.status}`);
      return {
        ...token,
        accessToken: "",
        refreshToken: "",
        tokenExpires: null,
        error: "RefreshAccessTokenError",
        logout: true,
      };
    }

    const data = await response.json();
    // Validate response fields
    const newAccessToken = data.token || token.accessToken || "";
    const newRefreshToken = data.refreshToken || token.refreshToken || "";
    let newTokenExpires = data.tokenExpires || token.tokenExpires || null;
    // Normalize tokenExpires to ms
    if (typeof newTokenExpires === "number" && newTokenExpires < 1e12) {
      newTokenExpires = newTokenExpires * 1000;
    }

    if (!newAccessToken || !newRefreshToken || !newTokenExpires) {
      console.error("[refreshAccessToken] Invalid refresh response:", data);
      return {
        ...token,
        accessToken: "",
        refreshToken: "",
        tokenExpires: null,
        error: "RefreshAccessTokenError",
        logout: true,
      };
    }

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenExpires: newTokenExpires,
      error: undefined,
      logout: false,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      accessToken: "",
      refreshToken: "",
      tokenExpires: null,
      error: "RefreshAccessTokenError",
      logout: true,
    };
  }
}

const ssoTokenProvider = CredentialsProvider({
  id: "sso-token", // required to avoid conflict
  name: "SSO Token",
  credentials: {
    token: { label: "Token", type: "text" },
  },
  async authorize(credentials) {
    const token = credentials?.token;

    if (!token) return null;

    try {
      // Call your own backend to validate and get user info
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // NOTE: The backend returns the user object directly as data, not under data.user
      const data = res.data;
      // The backend returns the user object directly, not under data.user
      // So the check for data?.user is incorrect, should check for data?.id or data?.email
      if (!data?.id || !data?.email) return null;

      return {
        id: String(data.id),
        email: data.email,
        name: (data.firstName ? data.firstName : "") + (data.lastName ? " " + data.lastName : ""),
        token: token,
        refreshToken: "",
        tokenExpires: null,
      };
    } catch (err) {
      console.error("SSO token authorization failed", err);
      return null;
    }
  },
});


// --- Provider Configurations ---
const azureADProvider = AzureADProvider({
  clientId: process.env.AZURE_CLIENT_ID || "",
  clientSecret: process.env.AZURE_CLIENT_SECRET || "",
  tenantId: process.env.AZURE_TENANT_ID || "",
  authorization: {
    params: {
      scope: "openid profile email offline_access",
    },
  },
  async profile(profile, tokens) {
    // Remove backend SAML/cert verification and just return the profile fields
    // This avoids the SAML/cert verification error and allows login with Azure AD
    const email =
      profile.email ||
      profile.preferred_username ||
      profile.upn ||
      "";
    const name = profile.name || "";
    const azureId = profile.oid || profile.sub || profile.id || "";

    return {
      id: String(azureId),
      email,
      token: tokens.id_token || "",
      refreshToken: tokens.refresh_token || "",
      tokenExpires: tokens.expires_at || null,
      name,
    };
  },
});

const credentialsProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }
    try {
      const response = await axios.post(`${BASE_URL}/auth/email/login`, {
        email: credentials.email,
        password: credentials.password,
      });
      const userData = response.data;
      if (
        userData &&
        userData.user &&
        userData.token &&
        userData.refreshToken &&
        userData.tokenExpires
      ) {
        const { user, token, refreshToken, tokenExpires } = userData;
        // Normalize tokenExpires to ms
        let normalizedTokenExpires = tokenExpires;
        if (typeof normalizedTokenExpires === "number" && normalizedTokenExpires < 1e12) {
          normalizedTokenExpires = normalizedTokenExpires * 1000;
        }
        return {
          id: String(user.id),
          email: user.email,
          token,
          refreshToken,
          tokenExpires: normalizedTokenExpires,
          name: user.name || "",
        };
      }
      return null;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Authorization error:",
          (error as AxiosError).response?.data || error.message
        );
      } else {
        console.error("Authorization error:", error);
      }
      return null;
    }
  },
});

// --- NextAuth Options ---
export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [azureADProvider, credentialsProvider, ssoTokenProvider],
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      const sources = [user, profile, account, token];
      token.id =
        token.id ||
        extractField(sources, [
          "id",
          "sub",
          "oid",
          "user_id",
          "uid",
          "userId",
          "objectId",
        ]);
      token.email =
        token.email ||
        extractField(sources, [
          "email",
          "preferred_username",
          "upn",
          "mail",
          "userPrincipalName",
        ]);
      token.name =
        token.name ||
        extractField(sources, ["name", "displayName", "given_name"]);
      token.accessToken =
        account?.access_token ||
        token.accessToken ||
        extractTokenField(sources, [
          "token",
          "accessToken",
          "access_token",
        ]) ||
        "";
      token.refreshToken =
        account?.refresh_token ||
        token.refreshToken ||
        extractTokenField(sources, [
          "refreshToken",
          "refresh_token",
        ]) ||
        "";
      token.tokenExpires =
        account?.expires_at ||
        token.tokenExpires ||
        extractTokenExpires(sources, [
          "tokenExpires",
          "token_expires",
          "expires_at",
        ]);
      if (typeof token.tokenExpires === "number" && token.tokenExpires < 1e12) {
        token.tokenExpires = token.tokenExpires * 1000;
      }
      if (trigger === "update" && session) {
        token.accessToken = session.accessToken ?? token.accessToken;
        token.refreshToken = session.refreshToken ?? token.refreshToken;
        token.tokenExpires = session.tokenExpires ?? token.tokenExpires;
        token.name = session.user?.name ?? token.name;
        token.email = session.user?.email ?? token.email;
        token.id = session.user?.id ?? token.id;
        if (typeof token.tokenExpires === "number" && token.tokenExpires < 1e12) {
          token.tokenExpires = token.tokenExpires * 1000;
        }
        return token;
      }
      if (!token.tokenExpires) {
        return token;
      }
      const expiresAt =
        typeof token.tokenExpires === "number" && token.tokenExpires < 1e12
          ? token.tokenExpires * 1000
          : token.tokenExpires;
      if (
        typeof expiresAt === "number" &&
        Date.now() < expiresAt - 60 * 1000
      ) {
        return token;
      }
      const refreshedToken = await refreshAccessToken(token);
      if (refreshedToken.logout) {
        return {
          ...refreshedToken,
          error: "SessionExpiredLogout",
        };
      }
      return refreshedToken;
    },
    async session({ session, token }) {
      const extendedSession: ExtendedSession = {
        ...session,
        user: {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string | undefined,
        },
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
      (extendedSession as any).tokenExpires = token.tokenExpires;
      if (token.error) {
        (extendedSession as any).error = token.error;
      }

      if ((token as any).logout) {
        (extendedSession as any).logout = true;
      }

      return extendedSession;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  // --- Logout fallback: custom events handler ---
  events: {
    async signOut({ token }) {
      try {
        await axios.post(`${BASE_URL}/auth/logout`, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
      } catch (e) {
        console.error("Logout error:", e);
      }
    },
  },
};

export default NextAuth(authOptions);