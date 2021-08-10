/**
 * @description Cache Manager is a library that provides service for storing cached data and fetching new data from given endpoints.
 *
 * @author xkcm
 * @name cache-manager
 * @version 1.0.0
 *
 */
import { CacheStore, StoreID } from "./classes/CacheStore";
export declare class CacheManager {
    private __stores;
    constructor();
    registerStore(id?: StoreID): CacheStore;
    store(id: StoreID): CacheStore;
    dropStore(id: StoreID): boolean;
    stores(): {
        id: StoreID;
        CacheStore: CacheStore;
    }[];
}
