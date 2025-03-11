/* eslint-disable @typescript-eslint/no-unsafe-return */ // disabled as otherwise we cannot return typed responses
import type { AxiosResponse, CancelToken } from 'axios'
import axios from 'axios'

import { DEFAULT_REQUEST_TIMEOUT, IDP_URL } from 'src/app-constants'
import type { IClient, IWritableClient } from 'src/definitions/Client'
import { BaseAPI } from 'src/requestAPI/BaseAPI'

export class KeycloakRequestAPI extends BaseAPI {
  public static async testConnection(retry: boolean): Promise<AxiosResponse> {
    const testURL = `${IDP_URL}/.well-known/openid-configuration`

    if (!retry) {
      // do not check for valid authorization here as it would cause an endless loop because
      // token check fails -> this token check would fail also, without issuing a request of a new token
      // also, do not retry requests as the token refresh is called again anyways
      return axios.get(testURL)
    } else {
      // do not check for valid authorization here as it would cause an endless loop because
      // token check fails -> this token check would fail also, without issuing a request of a new token
      return this.checkNetworkConnectivityWrapper(
        () => axios.get(testURL),
        () => Promise.resolve(),
      )
    }
  }

  public static async clientsGet(
    params?: Record<string, unknown>,
    cancelToken?: CancelToken,
  ): Promise<AxiosResponse<IClient[]>> {
    const requestURL = `${IDP_URL}/self-service-clients/clients`

    return this.networkResultWrapper(() => {
      const header = {
        Authorization: `Bearer ${this.token}`,
      }
      return axios.get(requestURL, {
        headers: header,
        params,
        ...(cancelToken && { cancelToken }),
        timeout: DEFAULT_REQUEST_TIMEOUT,
      })
    })
  }

  public static async clientGet(
    clientUuid: string,
    params?: Record<string, unknown>,
    cancelToken?: CancelToken,
  ): Promise<AxiosResponse<IClient>> {
    const requestURL = `${IDP_URL}/self-service-clients/clients/${clientUuid}`

    return this.networkResultWrapper(() => {
      const header = {
        Authorization: `Bearer ${this.token}`,
      }
      return axios.get(requestURL, {
        headers: header,
        params,
        ...(cancelToken && { cancelToken }),
        timeout: DEFAULT_REQUEST_TIMEOUT,
      })
    })
  }

  static getCleanedWritableClient(data: IWritableClient): IWritableClient {
    return {
      clientId: data.clientId,
      name: data.name,
      description: data.description,
      rootUrl: data.rootUrl,
      baseUrl: data.baseUrl,
      enabled: data.enabled,
      redirectUris: data.redirectUris,
      webOrigins: data.webOrigins,
      publicClient: data.publicClient,
      frontchannelLogout: data.frontchannelLogout,
      backchannelLogoutRevokeOfflineTokens:
        data.backchannelLogoutRevokeOfflineTokens,
      backchannelLogoutSessionRequired: data.backchannelLogoutSessionRequired,
      backchannelLogoutUrl: data.backchannelLogoutUrl,
      frontchannelLogoutUrl: data.frontchannelLogoutUrl,
      postLogoutRedirectUris: data.postLogoutRedirectUris,
    }
  }

  public static async clientCreate(
    data: IWritableClient,
    params?: Record<string, unknown>,
    cancelToken?: CancelToken,
  ): Promise<AxiosResponse<IClient>> {
    const requestURL = `${IDP_URL}/self-service-clients/clients`

    return this.networkResultWrapper(() => {
      const header = {
        Authorization: `Bearer ${this.token}`,
      }
      return axios.post(
        requestURL,
        KeycloakRequestAPI.getCleanedWritableClient(data),
        {
          headers: header,
          params,
          ...(cancelToken && { cancelToken }),
          timeout: DEFAULT_REQUEST_TIMEOUT,
        },
      )
    })
  }

  public static async clientUpdate(
    clientUuid: string,
    data: IWritableClient,
    params?: Record<string, unknown>,
    cancelToken?: CancelToken,
  ): Promise<AxiosResponse<IClient>> {
    const requestURL = `${IDP_URL}/self-service-clients/clients/${clientUuid}`

    return this.networkResultWrapper(() => {
      const header = {
        Authorization: `Bearer ${this.token}`,
      }
      return axios.put(
        requestURL,
        KeycloakRequestAPI.getCleanedWritableClient(data),
        {
          headers: header,
          params,
          ...(cancelToken && { cancelToken }),
          timeout: DEFAULT_REQUEST_TIMEOUT,
        },
      )
    })
  }

  public static async clientRegenerateSecret(
    clientUuid: string,
    params?: Record<string, unknown>,
    cancelToken?: CancelToken,
  ): Promise<AxiosResponse<IClient>> {
    const requestURL = `${IDP_URL}/self-service-clients/clients/${clientUuid}/secret/regenerate`

    return this.networkResultWrapper(() => {
      const header = {
        Authorization: `Bearer ${this.token}`,
      }
      return axios.post(
        requestURL,
        {},
        {
          headers: header,
          params,
          ...(cancelToken && { cancelToken }),
          timeout: DEFAULT_REQUEST_TIMEOUT,
        },
      )
    })
  }

  public static async clientDelete(
    clientUuid: string,
    params?: Record<string, unknown>,
    cancelToken?: CancelToken,
  ): Promise<AxiosResponse<IClient>> {
    const requestURL = `${IDP_URL}/self-service-clients/clients/${clientUuid}`

    return this.networkResultWrapper(() => {
      const header = {
        Authorization: `Bearer ${this.token}`,
      }
      return axios.delete(
        requestURL,
        {
          headers: header,
          params,
          ...(cancelToken && { cancelToken }),
          timeout: DEFAULT_REQUEST_TIMEOUT,
        },
      )
    })
  }
}
