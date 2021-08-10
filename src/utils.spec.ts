import * as utils from './utils'

describe("Testing utils for CacheManager", () => {
  it("should return back next integers as expected", () => {
    for(let i = 0; i < 99; i++) expect(utils.nextInteger()).toBe(i)
    for(let i = 0; i < 99; i++) expect(utils.nextInteger('label1')).toBe(i)
    for(let i = 0; i < 99; i++) expect(utils.nextInteger('some-label')).toBe(i)
  })
  it("should clear next integer generator", () => {
    expect(utils.nextInteger('label2')).toBe(0)
    expect(utils.nextInteger('label2')).toBe(1)
    expect(utils.nextInteger('label2')).toBe(2)
    utils.nextInteger.clear('label2')
    expect(utils.nextInteger('label2')).toBe(0)
  })
  it('should set default value for next integer generator', () => {
    utils.nextInteger.set(25, 'label3')
    expect(utils.nextInteger('label3')).toBe(25)
    expect(utils.nextInteger('label3')).toBe(26)
  })
  it('should stringify simple function', () => {
    const fn = () => console.log('test')
    const string = utils.stringifyFunction(fn)
    expect(string).toContain("console.log('test')")
  })
})
