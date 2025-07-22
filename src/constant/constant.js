export const WS_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "staging"
    ? "wss://microservice-staging.bynd.ai/test"
    : process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_WS_URL
      : "";
export const MICROSERVICE_URL = process.env.NEXT_PUBLIC_MICROSERVICE_URL;
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const SIMILAR_TABLES_API_URL = process.env.NEXT_PUBLIC_SIMILAR_TABLES_API_URL || "";
export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;