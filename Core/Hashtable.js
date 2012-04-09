/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Hashtable
 * @requires CustomEvent
*/

/**
 * This class provides a hashtable allowing powerful key/value interaction
 * @class Hashtable
 * @namespace Swell.Core
 * @inherits Swell.Core.CustomEventModel
*/
Swell.Core.Class({
    name        : 'Hashtable',
    namespace   : 'Swell.Core',
    inherits    : Swell.Core.CustomEventModel,
    functions   : function() {
        
        var _updateLength = function() {
            var _l = 0, _n;
            
            if(this._hash.__count__) {
                this.length = this._hash.__count__;
            } else {
                for(_n in this._hash) {
                    _l++;
                }
                this.length = _l;
            }
        }
        
        var _initEvents = function() {
            /**
             * @event onChange fires when an item is added/updated in the hashtable
            */
            this.createEvent('change', this);
            this.subscribe('change', _updateLength);
        }
       
        return {
            
            length : 0,
            
            /**
             * @private holds the getter function
            */
            _getter : null,

            /**
             * Constructor, initialize enumerable
             *
             * @function construct
             * @constructs
            */                
            construct : function() {
                this._hash = {};
                _initEvents.call(this);
            },
            
            /**
             * Resets the hashtable
             *
             * @function dispose
            */                  
            empty : function() {
                this._hash = {};
            },
            
            /**
             * Add/Update an entry in the hashtable
             * 
             * @function set
             * @param {String} key Key name
             * @return {Swell.Core.Hashtable}
            */ 
            set : function(key, value, fn) {
                
                var _old, _new = null;
                
                if(this._hash.hasOwnProperty(key)) {
                    _old = this._hash[key];
                }
                
                if(arguments.length === 1) {
                    if(this._setter) {
                        var _key = Swell.uniqueId();
                        this._hash[_key] = this._setter[0].call(this._hash, key, this._setter[1]);
                    } else {
                        this._hash[Swell.uniqueId()] = key;
                    }
                } else {
                    if(this._setter) {
                        this._hash[key] = this._setter[0].call(this._hash, value, this._setter[1]);
                    } else {
                        this._hash[key] = value;
                    }
                }
                _new = value;
                this.fireEvent('change', {'old' : _old, 'new' : _new});
                return this;
            },
            
            /**
             * Add an entry in the hashtable if the key does not exist
             * 
             * @function put
             * @param {String} key Key name
             * @return {Swell.Core.Hashtable}
            */ 
            put : function(key, value) {
                if(!this.exists(key)) {
                    this.set(key, value);
                    return this;
                }
                return false;
            },
            
            /**
             * Inject elements into a hashtable
             * 
             * @function inject
             * @param {Object} existing object as hashtable
             * @return {Swell.Core.Hashtable}
            */ 
            inject : function(o) {
                var _p;
                for(_p in o) {
                    this._hash[_p] = o[_p];
                }
                return this;
            },

            /**
             * Update an entry in the hashtable if the key exists
             * 
             * @function set
             * @param {String} key Key name
             * @return {Swell.Core.Hashtable}
            */ 
            update : function(key, value) {
                if(this.exists(key)) {
                    this.set(key, value);
                    return this;
                }
                return false;
            },
            
            /**
             * Get the value of the corresponding key in the hashtable
             * 
             * @function get
             * @param {String} key Key name
             * @return {Mixed/Boolean} value
            */
            get : function(key) {
                if(this._hash.hasOwnProperty(key)) {
                    if(this._getter) {
                        return this._getter[0].call(this._hash, key, this._hash[key], this._getter[1]);
                    }
                    return this._hash[key];
                }
                return false;
            },
            
            /**
             * Registers a getter function that will be executed when get function is called
             * key and value are automatically passed to the getter
             * 
             * @function get
             * @param {Function} fn getter function
            */
            defineGetter : function(fn, args) {
                if(Swell.Core.isFunction(fn)) {
                    this._getter = [fn, args];
                }
            },
            
            /**
             * Registers a setter function that will be executed when set function is called
             * key and value are automatically passed to the setter
             * 
             * @function set
             * @param {Function} fn setter function
            */
            defineSetter : function(fn, args) {
                if(Swell.Core.isFunction(fn)) {
                    this._setter = [fn, args];
                }
            },
            
            /**
             * Exchanges all keys with their associated values in the hashtable
             * 
             * @function flip
             * @return {Swell.Core.Hashtable}
            */
            flip : function() {
                var _k, _tmp = {};
                 
                for( _k in this._hash ) {
                    _tmp[this._hash[_k]] = _k;
                }
                this._hash = _tmp;
                return this;
            },
            
            /**
             * Returns the first item of the hashtable
             *
             * @function first
             * @param {Boolean} [extended] Returns an array with the first item as key and second one as val (optional)
             * @return {Mixed}
            */
            first : function(extended) {
                for(var _p in this._hash) {
                    if(!Swell.Core.isUndefined(extended)) {
                        return [_p, this._hash[_p]];
                    }
                    return this._hash[_p]; 
                }
                return false;
            },
            
            /**
             * Returns the last item of the hashtable
             *
             * @function last
             * @param {Boolean} [extended] Returns an array with the last item as key and second one as val (optional)
             * @return {Mixed}
            */
            last : function(extended) {
                var _lastitem = false;
                for(var _p in this._hash) {
                    _lastitem = this._hash[_p]; 
                }
                if(!Swell.Core.isUndefined(extended)) {
                    return [_p, _lastitem];
                }
                return _lastitem;
            },
            
            /**
             * Unsets an item from the hashtable
             *
             * @function remove
             * @return {Swell.Core.Hashtable}
            */
            remove : function(key) {
                if(this._hash.hasOwnProperty(key)) {
                    delete this._hash[key];
                    this.fireEvent('change', this);
                }
                return this;
            },
            
            /**
             * Applies the callback to the elements of the hashtable
             * 
             * @function map
             * @return {Swell.Core.Hashtable}
            */
            map : function(fn) {
                var _p, _tmp = {};
                if(Swell.Core.isFunction(fn)) {
                    for(_p in this._hash) {
                        _tmp[_p] = fn.call(null, this._hash[_p]); 
                    }
                }
                return _tmp;
            },
            
            /**
             * Test if a property exists in the hash table
             * 
             * @function exists
             * @return {Boolean}
            */
            exists : function(key) {
                return this._hash.hasOwnProperty(key);
            },
            
            /**
             * Applies an user function on every member of the hashtable
             * 
             * @function walk
             * @return {Swell.Core.Hashtable}
            */
            walk : function(fn) {
                var _p;
                if(Swell.Core.isFunction(fn)) {
                    for(_p in this._hash) {
                        this._hash[_p] = fn.call(this, this._hash[_p], _p); 
                    }
                }
                return this;
            },
            
            /**
             * Returns an array of keys
             * 
             * @function keys
             * @return {Mixed[]} keys
            */ 
            keys : function() {
                var _k, _tmp = [];
                for(_k in this._hash) {
                    _tmp.push(_k);
                }
                return _tmp;
            },
            
            /**
             * Pop the element off the end of array
             * 
             * @function pop
             * @return {Mixed} value of the popped item
            */ 
            pop : function() {
                var _item = this.last(true);
                delete _item[0];
                
                return _item[1];
            },
            
            /**
             * Returns an array of values
             * 
             * @function values
             * @return {Mixed[]} values
            */ 
            values : function() {
                var _k, _tmp = [];
                for(_k in this._hash) {
                    _tmp.push(this._hash[_k]);
                }
                return _tmp;
            },
            
            /**
             * Returns the wrapped native object
             * 
             * @function toObject
             * @return {Object}
            */
            toObject : function() {
                return this._hash;
            },
            
            /**
             * Returns a string representation of the wrapped native object
             * 
             * @function toSource
             * @return {String}
            */
            toSource : function() {
                if(this._hash.toSource) {
                    return this._hash.toSource();
                } else {
                    var _stack = [];
                    for(var _n in this._hash) {
                        _stack.push('"' + _n + '" : "' + this._hash[_n] + '"');
                    }
                    return '({' + _stack.join(',') + '})';
                }
            },
            
            /**
             * Returns the hashtable as a querystring representation
             * 
             * @function toQueryString
             * @return {String}
            */
            toQueryString : function() {
                return Swell.Core.toQueryString(this._hash);
            }
        }
    }()
});