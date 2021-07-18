import { nextInteger } from "../utils";
import { CacheCollection, CacheCollectionConfig, CollectionID } from "./CacheCollection";
import { FetcherConfig } from "./Fetcher";
import { CachedRequest } from './CachedRequest'
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type StoreID = number | string
interface AddCollectionConfig extends Omit<CacheCollectionConfig, 'id'> {
  fetcherConfig: FetcherConfig
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

  public async request<T>(url: string, config: Omit<AxiosRequestConfig, 'url'>): Promise<AxiosResponse<T>>{
    let found = this.__requests.get(url)
    if (found) return found.response
    const response = await axios.request<T>({
      url,
      ...config
    })
    const cached = new CachedRequest(response)
    this.__requests.set(url, cached)
    return response
  }
}