// src/authConfig.ts
export const msalConfig = {
    auth: {
      clientId: "c63e22b7-869d-4470-be87-3fee5e3479c4",
      authority: "https://login.microsoftonline.com/common",
      redirectUri: "http://localhost:3000"
    },
    cache: {
      cacheLocation: "localStorage"
    }
  };
  

  export const loginRequest = {
    scopes: ["User.Read"],
  };