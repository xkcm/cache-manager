import axios, { AxiosResponse } from 'axios'
import { CacheItem, CacheItemData, CacheItemKey } from './CacheItem';

type UriConstructor<T> = string | ((args: T) => string)
type PayloadConstructor<T> = Record<string | number, unknown> | ((args: T) => Record<string | number, unknown>)
type AllowedHttpMethods = 'POST' | 'GET'
interface RequestSchema<T, Y> {
  method: AllowedHttpMethods;
  uri: UriConstructor<T>;
  responseTranslator: Y;
  payload?: PayloadConstructor<T>;
};
type FetchingScheme = 'fetchOne' | 'fetchSome'

export interface FetcherConfig {
  schemes: {
    fetchOne?: RequestSchema<{ key: CacheItemKey }, <T = CacheItemData>(response: AxiosResponse) => { data: T, key: CacheItemKey }>;
    fetchSome?: RequestSchema<{ keys: CacheItemKey[] }, <T = CacheItemData>(response: AxiosResponse) => { data: T, key: CacheItemKey }[]>;
  }
}

export class Fetcher {
  public fetchingSchemes: FetcherConfig['schemes']
  constructor(config: FetcherConfig){
    this.fetchingSchemes = config.schemes
  }
  private constructUri<T>(base: UriConstructor<T>, params: T): string{
    if (typeof base === 'function') return base.call(base, params)
    if (typeof base === 'string') {
      return base.replace(/:([a-zA-Z0-9]+)/g, (match, name) => {
        if (name in params) return String(JSON.stringify(params[name]))
        return match
      })
    }
  }
  private constructPayload<T>(base: PayloadConstructor<T>, params: T): Record<string | number, unknown>{
    if (typeof base === 'function') return base.call(base, params)
    if (typeof base === 'object' && Object.prototype.toString.call(base) === '[object Object]') return Object.assign({}, base)
  }
  public async fetchOne<T = CacheItemData>(key: CacheItemKey): Promise<{ data: T, key: CacheItemKey }>{
    if (!this.fetchingSchemes.fetchOne) throw new Error('Fetching scheme \'fetchOne\' not specified')
    const response = await this.fetch<T>('fetchOne', { key })
    const data = this.fetchingSchemes.fetchOne.responseTranslator<T>(response)
    return data
  }
  public async fetchSome<T = CacheItemData>(keys: CacheItemKey[]): Promise<{ data: T, key: CacheItemKey }[]>{
    if (!this.fetchingSchemes.fetchSome) throw new Error('Fetching scheme \'fetchSome\' not specified')
    const response = await this.fetch<T>('fetchSome', { keys })
    const data = this.fetchingSchemes.fetchSome.responseTranslator<T>(response)
    return data
  }
  public setScheme<T extends FetchingScheme>(fetchingScheme: T, config: FetcherConfig['schemes'][T]){
    this.fetchingSchemes[fetchingScheme] = config
  }
  private async fetch<T>(fetchMethod: FetchingScheme, params: Record<string | number, any>){
    const uri = this.constructUri(this.fetchingSchemes[fetchMethod].uri, params)
    const payload = this.fetchingSchemes[fetchMethod].payload ? this.constructPayload(this.fetchingSchemes[fetchMethod].payload, params) : {}
    const response = await axios.request<T>({
      method: this.fetchingSchemes[fetchMethod].method,
      data: payload,
      url: uri
    })
    return response
  }
}
