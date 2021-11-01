# cache-manager
### Description
TypeScript library for managing cache storage with __key-based__ items and scheduling auto updates for NodeJS and web.
### Structure
The main node in the *cache-manager* hierarchy is `CacheManager` instance. `CacheManager` manages `CacheStores` which manage single `CacheCollections`. `CacheStores` are meant to be used in different parts of the application and `CacheCollection` helps partition the data into smaller chunks which makes it more organised.

![cache-manager hierarchy](https://i.imgur.com/xed1pjv.png)

---
## Usage
This example shows how to instantiate `CacheManager` and register a store with a collection. By instantiating the collection we have to pass the *fetching schemes* for a Fetcher that is instantiated inside of `CacheCollection`.
```ts
const cacheManager = new CacheManager()
const store01 = cacheManager.registerStore("store-1")
const collection01 = store01.registerCollection({
  fetcherConfig: { // instructions for Fetcher on how to fetch new data
    schemes: {
      fetchOne: {
        method: "GET",
        uri: "https://jsonplaceholder.typicode.com/posts/:key",
        responseTranslator: (axiosResponse) => ({
          data: axiosResponse.data,
          key: axiosResponse.data['id']
        })
      }
    }
  }
}, /* optional */ "collection-1" )
collection01.setting("itemsLifespan", Infinity) // do not update cached items
collection01.setting("ignoreKeyMismatch", true) // ignore difference in the key from fetched data and the given key
```
We can then use the `CacheCollection` to get items by given keys.

```ts
const item5 = await collection01.getOne<Post>(5)
```
`CacheCollection` automatically caches fetched item and on the next attempt to get it, it will return this item from the memory.

If you want to get more items than one you can specify *fetching scheme* for fetching multiple items or you can set the `CacheCollection` option **fetchSomeByOne** to `true`. This will tell the `Fetcher` to get the items separately.

```ts
collection01.setting("fetchSomeByOne", true)
```

By having `CacheManager` declared as `cacheManager` you can access the `CacheStores` and `CacheCollections` globally without the need to assign them to the variables. To do that you need *store ID* and *collection ID*.

```ts
const item3 = await cacheManager.store(/* store ID */ "store-1").collection(/* collection ID */ "collection-1").getOne<Post>(3)
```
---
## Creator's note
This library will not be further developed, it is impractial and difficult to set up and customize. Therefore I will be developing a new TypeScript library with a completely different approach. Check this other repo [here](http://github.com/xkcm/ts-cache).
## API

## [`CacheManager`](src/index.ts#L13)

Manager and container for `CacheStores`.
### [`CacheManager#constructor()`](src/index.ts#L15)

**Params**

Constructor takes no parameters.

**Return value**

`CacheManager` instance

**Example**
```ts
const cacheManager = new CacheManager()
```
### [`CacheManager#registerStore(id?)`](src/index.ts#L18)

Registers a new store.

**Params**
* `id` **{String}**: (optional) Store ID

**Return value**

`CacheStore` instance

**Example**
```ts
const store01 = cacheManager.registerStore("store-1")
```

### [`CacheManager#store(id)`](src/index.ts#L27)

Returns registered `CacheStore` by `id`

**Params**
* `id` **{String}**: (required) Store ID

**Return value**

`CacheStore` instance

**Example**
```ts
const theSameStore = cacheManager.store("store-1")
```

### [`CacheManager#dropStore(id)`](src/index.ts#L30)

Drops `CacheStore` with given `id` and deletes all its `CacheCollections` and `CacheItems`

**Params**
* `id` **{String}**: (required) Store ID

**Return value**

`boolean` (`true` if dropped successfully and `false` otherwise)

**Example**
```ts
cacheManager.dropStore("collection-1")
```

### [`CacheManager#stores()`](src/index.ts#L35)

Returns list of registered `CacheStores`

**Params**

`CacheManager#stores()` takes no parameters

**Return value**

`[ { id: String, store: CacheStore } ]`

**Example**
```ts
cacheManager.stores()
```

## [`CacheStore`](src/classes/CacheStore.ts)
`CacheStore` is used as container and manager of `CacheCollections`
### [`CacheStore#registerCollection(config, id?)`](src/classes/CacheStore.ts#L29)

Registers new `CacheCollection`

**Params**
* `config` [**{AddCollectionConfig}**](#addcollectionconfig): (required) `CacheCollection` configuration object
* `id` **{String}**: (optional) Collection ID

**Return value**

`CacheCollection` instance

**Example**
```ts
cacheManager.store("store-1").registerCollection({
  fetcherConfig: {
    schemes: {
      fetchOne: {
        method: "POST",
        uri: "https://jsonplaceholder.typicode.com/posts/:key",
        responseTranslator: (axiosResponse) => ({
          data: axiosResponse.data,
          key: axiosResponse.data['id']
        })
      }
    }
  }
}, "some-custom-id")
```

### [`CacheStore#collection(id)`](src/classes/CacheStore.ts#L26)
Returns registered `CacheCollection` by `id`

**Params**
* `id` **{String}**: (required) Collection ID

**Return value**

`CacheCollection` instance

**Example**
```ts
cacheManager.store("store-1").collection("some-custom-id")
```

### [`CacheStore#collections()`](src/classes/CacheStore.ts#L45)
Returns list of registered `CacheCollections`

**Params**

`CacheStore#collections()` takes no parameters

**Return value**

`[ { id: String, size: number } ]`

**Example**
```ts
cacheManager.store("store-1").collections()
```

### [`CacheStore#dropCollection(id)`](src/classes/CacheStore.ts#L43)
Drops `CacheCollection` instance by `id`

**Params**
* `id` **{String}**: (required) Collection ID

**Return value**

`boolean` (`true` if dropped successfully, `false` otherwise)

**Example**
```ts
cacheManager.store("store-1").dropCollection("some-custom-id")
```

### [`CacheStore#dropCollections()`](src/classes/CacheStore.ts#L51)
Drops all registered `CacheCollections`

**Params**

`CacheStore#dropCollections()` takes no parameters

**Return value**

`boolean` (`true` if dropped successfully, `false` otherwise)

**Example**
```ts
cacheManager.store("store-1").dropCollections()
```

### [`CacheStore#size()`](src/classes/CacheStore.ts#L59)
Returns object containing sizes of `CacheCollections` and `CachedRequests`

**Params**

`CacheStore#size()` takes no parameters

**Return value**

`{ collections: number, requests: number }`

**Example**
```ts
cacheManager.store("store-1").size()
```

### [`CacheStore#request<T>(requestConfig, additionalConfig?)`](src/classes/CacheStore.ts#L66)
Performs request and caches its response in a `CachedRequest` instance

**Params**
* `requestConfig` **{AxiosRequestConfig}**: (required) Request configuration matching the [`axios`](https://github.com/axios/axios#request-config) request configuration scheme
* `additionalConfig` [**{RequestAdditionalConfig}**](#requestadditionalconfig): (optional) Additional `CachedRequest` configuration

**Return value**

`Promise<AxiosResponse<T>>` 

**Example**
```ts
cacheManager.store("store-1").request({
  method: "get",
  url: "http://example.com",
  headers: {
    "Some-Custom-Header": "123"
  }
})
```

## [`CacheCollection`](src/classes/CacheCollection.ts)
`CacheCollection` is used to store and manage `CacheItems`
### [`CacheCollection#getOne<T>(key)`](src/classes/CacheCollection.ts#L27)
Returns key-based `CacheItem` from memory or fetches it using `Fetcher`

**Params**
* `key` **{CacheItemKey}**: (required) Key of the item

**Return value**

`Promise<CacheItem<T>>`

**Example**
```ts
cacheManager.store("store-1").collection("collection-1").getOne<Post>(19)
```

### [`CacheCollection#getSome<T>(keys)`](src/classes/CacheCollection.ts#L44)
Returns key-based `CacheItems` from memory or fetches those which are not in the memory yet using `Fetcher`

**Params**
* `keys` **{CacheItemKey[]}**: (required) Keys of the items

**Return value**

`Promise<CacheItem<T>[]>`

**Example**
```ts
cacheManager.store("store-1").collection("collection-1").getSome<Post>([19, 21, 4])
// this will fetch only items 21 and 4, since 19 is cached
```

### [`CacheCollection#createFetcher(fetcherConfig)`](src/classes/CacheCollection.ts#L77)
Creates new `Fetcher` instance using given `fetcherConfig`

**Params**
* `fetcherConfig` [**{FetcherConfig}**](#fetcherconfig): (required) `Fetcher` configuration

**Return value**

`Fetcher` instance

**Example**
```ts
cacheManager.store("store-1").collection("collection-1").createFetcher({
  schemes: {
    fetchOne: ...
  }
})
```

### [`CacheCollection#drop(key?)`](src/classes/CacheCollection.ts#L81)
Drops `CacheItem` with given `key` or all `CacheItems` if no `key` is passed

**Params**
* `key` **{CacheItemKey}**: (optional) Key of the item to drop

**Return value**

`boolean` (`true` if dropped successfully, `false` otherwise)

**Example**
```ts
cacheManager.store("store-1").collection("collection-1").drop(21)
```

### [`CacheCollection#size()`](src/classes/CacheCollection.ts#L91)
Returns the number of `CachedItems` within the `CacheCollection`

**Params**

`CacheCollection#size()` takes no parameters

**Return value**

`number` of `CacheItems`

**Example**
```ts
cacheManager.store("store-1").collection("collection-1").size()
```

### [`CacheCollection#cache()`](src/classes/CacheCollection.ts#L94)
Returns list of all `CachedItems` mapped to an `Object`

**Params**

`CacheCollection#cache()` takes no parameters

**Return value**

`[ { key: CacheItemKey, data: CacheItemData } ]`

**Example**
```ts
const collectionOneCache = cacheManager.store("store-1").collection("collection-1").cache()
```

### [`CacheCollection#setting(name, value?)`](src/classes/CacheCollection.ts#L101)
Returns the `CacheCollection` *setting* labeled by `name` or sets it the new `value` if the second argument is passed

**Params**

* `name` **{String}**: (required) Label of the setting
* `value` [**{CollectionSettingValue}**](#collectionsettingvalue): (optional) Value of the setting

**Return value**

`CollectionSettingValue` or `boolean` if second argument is passed

**Example**
```ts
cacheManager.store("store-1").collection("collection-1").setting("itemsLifespan", 100*1000)
// sets the update time of collection items to 100 seconds
```



---
## Interfaces
### `CacheItemKey` `CacheItemData`
`CacheItemKey` and `CacheItemData` types are defined for better code clarity
```ts
type CacheItemKey = unknown
type CacheItemData = unknown
```
### `AddCollectionConfig`
```ts
interface AddCollectionConfig{
  fetcherConfig: FetcherConfig
};
```
### `FetcherConfig`
```ts
interface FetcherConfig {
  schemes: {
    fetchOne?: RequestSchema<{key: CacheItemKey}, <T = CacheItemData>(response: AxiosResponse) => { data: T, key: CacheItemKey }>;
    fetchSome?: RequestSchema<{keys: CacheItemKey[]},  <T = CacheItemData>(response: AxiosResponse) => { data: T, key: CacheItemKey }[]>;
  }
}
```
### `RequestSchema<T, Y>`
```ts
interface RequestSchema<T, Y> {
  method: "POST" | "GET";
  uri: UriConstructor<T>;
  responseTranslator: Y;
  payload?: PayloadConstructor<T>;
};
```
* `method` - Request method
* `uri` - Source URI
* `responseTranslator` - Callback used to transform received data into key-based data
* `payload` - Request payload
### `UriConstructor<T>`
`UriConstructor<T>` is either a **URI String** or a function that returns one. **URI String** is a regular URI to the fetching source with different placeholders depending on the *fetching scheme*.

For `fetchOne` *fetching scheme*, available placeholders are:

- `:key` - it gets replaced by the `key` value passed to the [`CacheCollection#getOne<T>(key)`](#cachecollectiongetonetkey)

For `fetchSome` *fetching scheme*, available placeholders are:

- `:keys` - it gets replaced by the *stringified* `keys` value passed to the [`CacheCollection#getSome<T>(keys)`](#cachecollectiongetsometkeys)

```ts
type UriConstructor<T> = string | ((args: T) => string);
```
### `PayloadConstructor<T>`
```ts
type PayloadConstructor<T> = Record<string | number, unknown> | ((args: T) => Record<string | number, unknown>);
```

### `RequestAdditionalConfig`
```ts
interface RequestAdditionalConfig {
  requestKey?: string;
  forceFetch?: boolean;
  lifespan?: number;
};
```

* `requestKey` - `CachedRequest` unique key used to identify request
* `forceFetch` - Perform the request even though it is cached
* `lifespan` - Time in miliseconds after which the request should be updated (performed again and its response cached)

### `CollectionSettingValue`
```ts
type CollectionSettingValue = string | number | boolean
```
