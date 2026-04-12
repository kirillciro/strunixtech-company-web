// Type declarations for third-party auth SDKs loaded via <script> tags.

interface FBLoginResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: number;
  };
  status: "connected" | "not_authorized" | "unknown";
}

interface Window {
  fbAsyncInit?: () => void;
  FB: {
    init: (options: {
      appId: string;
      cookie?: boolean;
      xfbml?: boolean;
      version: string;
    }) => void;
    login: (
      callback: (response: FBLoginResponse) => void,
      options?: { scope?: string },
    ) => void;
    getLoginStatus: (callback: (response: FBLoginResponse) => void) => void;
  };
  AppleID: {
    auth: {
      init: (options: {
        clientId: string;
        scope?: string;
        redirectURI: string;
        usePopup?: boolean;
      }) => void;
      signIn: () => Promise<{
        authorization: {
          code: string;
          id_token: string;
          state?: string;
        };
        user?: {
          email?: string;
          name?: {
            firstName?: string;
            lastName?: string;
          };
        };
      }>;
    };
  };
}
