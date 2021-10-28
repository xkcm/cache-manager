import axios from "axios"
import { CacheManager } from "."

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

describe("testing Cache Manager", () => {
  var cacheManager1: CacheManager
  it('should successfully create Cache Manager (cacheManager1)', () => {
    cacheManager1 = new CacheManager()
    expect(cacheManager1.stores().length).toBe(0)
  })
  it('should add new store to cacheManager1 (cache-store-1)', () => {
    const storeId = 'cache-store-1'
    const store = cacheManager1.registerStore(storeId)
    const probablyStore = cacheManager1.store(storeId)
    expect(probablyStore).toBe(store)
    expect(probablyStore.id).toBe(storeId)
  })

  // cache-collection-1 config
  const itemsLifespan = Infinity
  const fetchSomeByOne = true
  const ignoreKeyMismatch = true

  it('should add new collection to cache-store-1 (cache-collection-1)', () => {
    const collectionId = 'cache-collection-1'
    const collection = cacheManager1.store('cache-store-1').registerCollection({
      fetcherConfig: {
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
    }, collectionId)

    collection.setting('itemsLifespan', itemsLifespan)
    collection.setting('fetchSomeByOne', fetchSomeByOne)
    collection.setting('ignoreKeyMismatch', ignoreKeyMismatch)
    
    expect(cacheManager1.store('cache-store-1').size().collections).toBe(1)
    expect(collection.size()).toBe(0)
    expect(collection.id).toBe(collectionId)
    expect(collection.setting('itemsLifespan')).toEqual(itemsLifespan)
    expect(collection.setting('fetchSomeByOne')).toEqual(fetchSomeByOne)
    expect(collection.setting('ignoreKeyMismatch')).toEqual(ignoreKeyMismatch)
  })

  const spiedAxios = jest.spyOn(axios, 'request')
  const id = 5

  it('should successfully fetch new item', async () => {
    const collection = cacheManager1.store('cache-store-1').collection('cache-collection-1')

    const item = await collection.getOne<Post>(id)
    expect(item.data.id).toEqual(id)
    expect(spiedAxios).toBeCalledTimes(1)
    expect(item.lifespan).toEqual(itemsLifespan)
  })

  it('should successfully read fetched item from the memory', async () => {
    spiedAxios.mockClear()
    await cacheManager1.store('cache-store-1').collection('cache-collection-1').getOne<Post>(id)
    expect(spiedAxios).not.toBeCalled()
  })

  it('should fetch some posts', async () => {
    spiedAxios.mockClear()
    const collection = cacheManager1.store('cache-store-1').collection('cache-collection-1')
    const posts = await collection.getSome<Post>([62, 32, id])
    expect(posts.length).toBe(3)
    expect(spiedAxios).toBeCalledTimes(2)
  })

  it('should perform request and cache it', async () => {
    spiedAxios.mockClear()
    const { data } = await cacheManager1.store('cache-store-1').request({
      url: 'http://jsonplaceholder.typicode.com/posts',
      method: 'GET'
    })
    expect(data.length).not.toBeNull()
    expect(cacheManager1.store('cache-store-1').size().requests).toBe(1)
    expect(spiedAxios).toBeCalledTimes(1)

    spiedAxios.mockClear()

    await cacheManager1.store('cache-store-1').request({
      url: 'http://jsonplaceholder.typicode.com/posts',
      method: 'GET'
    })

    expect(cacheManager1.store('cache-store-1').size().requests).toBe(1)
    expect(spiedAxios).toBeCalledTimes(0)
  })
  
})
