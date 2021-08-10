"use strict";
/**
 * @description Cache Manager is a library that provides service for storing cached data and fetching new data from given endpoints.
 *
 * @author xkcm
 * @name cache-manager
 * @version 1.0.0
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.CacheManager = void 0;
var CacheStore_1 = require("./classes/CacheStore");
var utils = __importStar(require("./utils"));
var CacheManager = /** @class */ (function () {
    function CacheManager() {
        this.__stores = new Map();
    }
    CacheManager.prototype.registerStore = function (id) {
        if (id) {
            var found = this.__stores.get(id);
            if (found)
                return found;
        }
        else
            id = utils.nextInteger('store');
        var newStore = new CacheStore_1.CacheStore(id);
        this.__stores.set(id, newStore);
        return newStore;
    };
    CacheManager.prototype.store = function (id) {
        return this.__stores.get(id);
    };
    CacheManager.prototype.dropStore = function (id) {
        var store = this.__stores.get(id);
        store.dropCollections();
        store = null;
        return this.__stores["delete"](id);
    };
    CacheManager.prototype.stores = function () {
        return __spreadArray([], __read(this.__stores.entries())).map(function (_a) {
            var _b = __read(_a, 2), store = _b[1];
            return ({
                id: store.id, CacheStore: store
            });
        });
    };
    return CacheManager;
}());
exports.CacheManager = CacheManager;
