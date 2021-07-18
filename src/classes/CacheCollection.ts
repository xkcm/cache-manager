import { CacheItem, CacheItemData, CacheItemKey } from "./CacheItem"
import { Fetcher, FetcherConfig } from "./Fetcher"

export type CollectionID = string | number
type CollectionSettingValue = string | number | boolean

export interface CacheCollectionConfig {
  id: CollectionID
}

export class CacheCollection {
  public id: CollectionID
  public fetcher: Fetcher

  private __items: Map<CacheItemKey, CacheItem>
  private settings: Map<string, CollectionSettingValue>
  constructor(config: CacheCollectionConfig){
    this.id = config.id
    this.__items = new Map()
    this.settings = new Map([
      ["ignoreKeyMismatch", false],
      ["fetchSomeByOne", false]
    ])
  }
  public async getOne<T = CacheItemData>(key: CacheItemKey): Promise<CacheItem<T>>{
    const cached = this.__items.get(key) as CacheItem<T>
    if (!cached) {
      let { data, key: extractedKey } = await this.fetcher.fetchOne<T>(key)
      if (key !== extractedKey && !this.setting('ignoreKeyMismatch')) throw new Error("Fetched key mismatch")
      const cacheItem = new CacheItem<T>(extractedKey, data, {
        parentCollection: this
      })
      this.__items.set(extractedKey, cacheItem)
      return cacheItem
    }
    return cached
  }
  public async getSome<T = CacheItemData>(keys: CacheItemKey[]): Promise<CacheItem<T>[]>{
    let [cached, toFetch] = keys.reduce<[CacheItemKey[], CacheItemKey[]]>((acc, key) => {
      if (this.__items.has(key)) acc[0].push(this.__items.get(key))
      else acc[1].push(key)
      return acc
    }, [[], []])
    var fetched = []
    if (toFetch.length > 0) {
      if (this.setting('fetchSomeByOne')) {
        for (let key of toFetch) {
          const fetchedOne = await this.getOne<T>(key)
          fetched.push(new CacheItem(key, fetchedOne, {
            parentCollection: this
          }))
        }
      }
      else {
        fetched = await this.fetcher.fetchSome<T>(toFetch)
        fetched = fetched.map(item => new CacheItem<T>(item.key, item.data, {
          parentCollection: this
        }))
      }
    }
    return [...cached, ...fetched]
  }
  public createFetcher(config: FetcherConfig){
    this.fetcher = new Fetcher(config)
    return this.fetcher
  }
  public drop(itemKey?: CacheItemKey){
    for(let key of (itemKey ? [itemKey] : this.__items.keys())) {
      let item = this.__items.get(key)
      item.destroy()
      item = null 
      this.__items.delete(key)
    }
  }
  public size(){
    return this.__items.size
  }
  public cache(){
    return [...this.__items.entries()].map((key, data) => ({
      key, data
    }))
  }
  public setting(name: string): CollectionSettingValue
  public setting(name: string, val: CollectionSettingValue): boolean
  public setting(name: string, val?: any): any{
    if (typeof val !== undefined) {
      if (this.settings.has(name)) {
        this.settings.set(name, val)
        return true
      }
      return false
    }
    else return this.settings.get(name)
  }
}