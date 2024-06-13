export interface IWritableClient {
  clientId: string;
  name: string;
  description: string;
  rootUrl: string;
  baseUrl: string;
  enabled: boolean;
  redirectUris: string[];
  webOrigins: string[];
  publicClient: boolean;
  frontchannelLogout: boolean;
  backchannelLogoutRevokeOfflineTokens: boolean;
  backchannelLogoutSessionRequired: boolean;
  backchannelLogoutUrl: string;
  frontchannelLogoutUrl: string;
  postLogoutRedirectUris: string[];
}

export interface IClient extends IWritableClient {
  id: string;

  secret: string;

  standardFlowEnabled: boolean;
  implicitFlowEnabled: boolean;
  directAccessGrantsEnabled: boolean;
  serviceAccountsEnabled: boolean;
  authorizationServicesEnabled: boolean;
}
