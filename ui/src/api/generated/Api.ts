/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum MediaType {
  Image = "Image",
  Video = "Video",
}

export enum ListingStatus {
  Available = "Available",
  Sold = "Sold",
  Unavailable = "Unavailable",
}

export enum ListingSortBy {
  MostRecent = "MostRecent",
  PriceAsc = "PriceAsc",
  PriceDesc = "PriceDesc",
}

export interface AuthResponse {
  token?: string | null;
  /** @format date-time */
  expiresAt?: string;
  /** @format uuid */
  userId?: string;
  email?: string | null;
  displayName?: string | null;
  roles?: string[] | null;
}

export interface ProfileDto {
  /** @format uuid */
  id?: string;
  email?: string | null;
  displayName?: string | null;
  description?: string | null;
}

export interface UpdateProfileRequest {
  /** @maxLength 256 */
  displayName?: string | null;
  /** @maxLength 2000 */
  description?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  /** @minLength 6 */
  newPassword: string;
}

export interface CreateListingRequest {
  /**
   * @minLength 1
   * @maxLength 200
   */
  name: string;
  /**
   * @minLength 1
   * @maxLength 4000
   */
  description: string;
  /**
   * @minLength 1
   * @maxLength 300
   */
  location: string;
  price?: string | null;
  tags?: string[] | null;
}

export interface ListingDto {
  /** @format uuid */
  id?: string;
  name?: string | null;
  description?: string | null;
  location?: string | null;
  price?: string | null;
  tags?: string[] | null;
  status?: ListingStatus;
  /** @format date-time */
  soldAt?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format uuid */
  ownerId?: string;
  ownerName?: string | null;
  media?: string[] | null;
}

export interface ListingDtoPagedResult {
  items?: ListingDto[] | null;
  /** @format int32 */
  total?: number;
  /** @format int32 */
  page?: number;
  /** @format int32 */
  pageSize?: number;
}

export interface ListingMediaDto {
  /** @format uuid */
  id?: string;
  type?: MediaType;
  url?: string | null;
  /** @format int32 */
  order?: number;
}

export interface LoginRequest {
  /**
   * @format email
   * @minLength 1
   */
  email: string;
  /** @minLength 1 */
  password: string;
}

export interface RegisterRequest {
  /**
   * @format email
   * @minLength 1
   */
  email: string;
  /** @minLength 6 */
  password: string;
  displayName?: string | null;
}

export interface UpdateListingRequest {
  /**
   * @minLength 1
   * @maxLength 200
   */
  name: string;
  /**
   * @minLength 1
   * @maxLength 4000
   */
  description: string;
  /**
   * @minLength 1
   * @maxLength 300
   */
  location: string;
  price?: string | null;
  tags?: string[] | null;
}

export interface UserDto {
  /** @format uuid */
  id?: string;
  email?: string | null;
  displayName?: string | null;
  enabled?: boolean;
  /** @format date-time */
  createdAt?: string;
  roles?: string[] | null;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Yasaman Listing API
 * @version v1
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  account = {
    /**
     * No description
     *
     * @tags Account
     * @name AccountRegisterCreate
     * @request POST:/api/account/register
     * @secure
     */
    accountRegisterCreate: (
      data: RegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<AuthResponse, any>({
        path: `/api/account/register`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountLoginCreate
     * @request POST:/api/account/login
     * @secure
     */
    accountLoginCreate: (data: LoginRequest, params: RequestParams = {}) =>
      this.request<AuthResponse, any>({
        path: `/api/account/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountProfileList
     * @request GET:/api/account/profile
     * @secure
     */
    accountProfileList: (params: RequestParams = {}) =>
      this.request<ProfileDto, any>({
        path: `/api/account/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountProfileUpdate
     * @request PUT:/api/account/profile
     * @secure
     */
    accountProfileUpdate: (data: UpdateProfileRequest, params: RequestParams = {}) =>
      this.request<ProfileDto, any>({
        path: `/api/account/profile`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Account
     * @name AccountPasswordUpdate
     * @request PUT:/api/account/password
     * @secure
     */
    accountPasswordUpdate: (data: ChangePasswordRequest, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/account/password`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  listing = {
    /**
     * No description
     *
     * @tags Listing
     * @name ListingsList
     * @request GET:/api/listings
     * @secure
     */
    listingsList: (
      query?: {
        search?: string;
        status?: ListingStatus;
        /** @format uuid */
        ownerId?: string;
        sortBy?: ListingSortBy;
        /**
         * @format int32
         * @default 1
         */
        page?: number;
        /**
         * @format int32
         * @default 20
         */
        pageSize?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListingDtoPagedResult, any>({
        path: `/api/listings`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsCreate
     * @request POST:/api/listings
     * @secure
     */
    listingsCreate: (data: CreateListingRequest, params: RequestParams = {}) =>
      this.request<ListingDto, any>({
        path: `/api/listings`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsDetail
     * @request GET:/api/listings/{id}
     * @secure
     */
    listingsDetail: (id: string, params: RequestParams = {}) =>
      this.request<ListingDto, any>({
        path: `/api/listings/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsUpdate
     * @request PUT:/api/listings/{id}
     * @secure
     */
    listingsUpdate: (
      id: string,
      data: UpdateListingRequest,
      params: RequestParams = {},
    ) =>
      this.request<ListingDto, any>({
        path: `/api/listings/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsDelete
     * @request DELETE:/api/listings/{id}
     * @secure
     */
    listingsDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/listings/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsSoldCreate
     * @request POST:/api/listings/{id}/sold
     * @secure
     */
    listingsSoldCreate: (id: string, params: RequestParams = {}) =>
      this.request<ListingDto, any>({
        path: `/api/listings/${id}/sold`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsAvailableCreate
     * @request POST:/api/listings/{id}/available
     * @secure
     */
    listingsAvailableCreate: (id: string, params: RequestParams = {}) =>
      this.request<ListingDto, any>({
        path: `/api/listings/${id}/available`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsUnavailableCreate
     * @request POST:/api/listings/{id}/unavailable
     * @secure
     */
    listingsUnavailableCreate: (id: string, params: RequestParams = {}) =>
      this.request<ListingDto, any>({
        path: `/api/listings/${id}/unavailable`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsMediaCreate
     * @request POST:/api/listings/{id}/media
     * @secure
     */
    listingsMediaCreate: (
      id: string,
      data: {
        /** @format binary */
        file?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListingMediaDto, any>({
        path: `/api/listings/${id}/media`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsMediaDelete
     * @request DELETE:/api/listings/{id}/media/{mediaId}
     * @secure
     */
    listingsMediaDelete: (
      id: string,
      mediaId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/listings/${id}/media/${mediaId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Listing
     * @name ListingsMediaOrderUpdate
     * @request PUT:/api/listings/{id}/media/order
     * @secure
     */
    listingsMediaOrderUpdate: (
      id: string,
      data: {
        mediaIds: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/listings/${id}/media/order`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags User
     * @name UsersList
     * @request GET:/api/users
     * @secure
     */
    usersList: (params: RequestParams = {}) =>
      this.request<UserDto[], any>({
        path: `/api/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UsersActivateCreate
     * @request POST:/api/users/{id}/activate
     * @secure
     */
    usersActivateCreate: (id: string, params: RequestParams = {}) =>
      this.request<UserDto, any>({
        path: `/api/users/${id}/activate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UsersDeactivateCreate
     * @request POST:/api/users/{id}/deactivate
     * @secure
     */
    usersDeactivateCreate: (id: string, params: RequestParams = {}) =>
      this.request<UserDto, any>({
        path: `/api/users/${id}/deactivate`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UsersDelete
     * @request DELETE:/api/users/{id}
     * @secure
     */
    usersDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/users/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
}
