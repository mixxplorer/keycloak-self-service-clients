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

  // The usernames of the managers.
  managers: string[];
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

export interface IClientManagers {
  /// The usernames of the users that are allowed to manage the client.
  managers: string[],
}
