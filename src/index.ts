/**
 * @description Cache Manager is a library that provides service for storing cached data and fetching new data from given endpoints.
 * 
 * @author xkcm
 * @name cache-manager
 * @version 1.0.0
 * 
 */

import { CacheStore, StoreID } from "./classes/CacheStore";
import * as utils from './utils'

export class CacheManager {
  private __stores: Map<StoreID, CacheStore>
  constructor(){
    this.__stores = new Map()
  }
  public registerStore(id?: StoreID){
    if (id){
      let found = this.__stores.get(id)
      if (found) return found
    } else id = utils.nextInteger('store')
    const newStore = new CacheStore(id)
    this.__stores.set(id, newStore)
    return newStore
  }
  public store(id: StoreID){
    return this.__stores.get(id)
  }
  public dropStore(id: StoreID){
    let store = this.__stores.get(id)
    store.dropCollections()
    return this.__stores.delete(id)
  }
  public stores(){
    return [...this.__stores.values()].map(store => ({
      id: store.id, store
    }))
  }
}
