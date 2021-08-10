import { hashCode, nextInteger } from "../utils";
import { CacheCollection, CacheCollectionConfig, CollectionID } from "./CacheCollection";
import { FetcherConfig } from "./Fetcher";
import { CachedRequest } from './CachedRequest'
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type StoreID = number | string
interface AddCollectionConfig extends Omit<CacheCollectionConfig, 'id'> {
  fetcherConfig: FetcherConfig;
}
interface RequestAdditionalConfig {
  requestKey?: string;
  forceFetch?: boolean;
  lifespan?: number;
}

export class CacheStore {

  private __collections: Map<CollectionID, CacheCollection>
  private __requests: Map<string, CachedRequest>

  constructor(public id: StoreID){
    this.__collections = new Map()
    this.__requests = new Map()
  }
  public collection(id: CollectionID) {
    return this.__collections.get(id)
  }
  public registerCollection(config: AddCollectionConfig, id?: CollectionID){
    if (id) {
      let found = this.__collections.get(id)
      if (found) return found
    } else id = nextInteger('collection')
    const newCollection = new CacheCollection({
      id: id
    })
    newCollection.createFetcher(config.fetcherConfig)
    this.__collections.set(id, newCollection)
    return newCollection
  }
  public removeCollection(name: CollectionID){
    this.collection(name).drop()
  }
  public collections(){
    return [...this.__collections.entries()].map(([, collection]) => ({
      id: collection.id,
      size: collection.cache().length
    }))
  }
  public dropCollections(){
    for (let [id, collection] of this.__collections.entries()){
      collection.drop()
      collection = null
      this.__collections.delete(id)
    }
  }
  public size(){
    return {
      collections: this.__collections.size,
      requests: this.__requests.size
    }
  }

  public async request<T = any>(requestConfig: AxiosRequestConfig, config?: RequestAdditionalConfig): Promise<AxiosResponse<T>>{
    let requestKey = config?.requestKey || hashCode(JSON.stringify(requestConfig)).toString()

    // if request was cached return it
    let found = this.__requests.get(requestKey)
    if (found) return found.response
    // else perform request
    const response = await axios.request<T>(requestConfig)
    const cached = new CachedRequest({
      requestConfig: requestConfig,
      response,
      key: requestKey,
      lifespan: config?.lifespan
    })
    this.__requests.set(requestKey, cached)
    return response
  }
}