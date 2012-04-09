/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Iterator
 * @requires Core
*/

/**
 * @class Iterator
 * @namespace Swell.Core
*/
Swell.Core.Class({
    
    name      : 'Iterator',
    namespace : 'Core',
    functions : function() {
        
        /**
         * Normalizes datatypes in the iterator
         *
         * @private
         * @function _mapKeys
        */
        var _mapKeys = function() {
            var _n = 0;
            if(Swell.Core.isArray) {
                for(var _n = 0, _l = this._collection.length; _n < _l; _n++) {
                    var _rec = this._collection[_n];
                    this._keyMapper[_n] = [_rec, this._collection[_rec]];
                }
            } else {
                for(var _rec in this._nativeIterator) {
                    this._keyMapper[_n] = [_rec, this._collection[_rec]];
                    _n++;
                }     
            }
        }
        
        return {
            /**
             * @protected {Array/Object} _collection internal stack
            */
            _collection     : null,
            
            /**
             * @protected {Iterator} holds the native iterator instance
            */
            _nativeIterator : null,
            
            /**
             * @protected {Boolean} _currentPointer current index of iteration
            */
            _currentPointer : 0,
            
            /**
             * @protected {Array} _keyMapper normalize data type in Iterator instance
            */
            _keyMapper : [],
            
            /**
             * @constructs
             * @param {Mixed} o the Object/Array to iterate in
            */
            construct : function(o) {
                
                //if the incoming object is not an array, exit gracefully
                if(!Swell.Core.isArray(o) && !Swell.Core.isObject(o)) {
                    throw new Error('construct(): First arg must be either an Array or an Object');
                }
                
                //Store the native definition into a variable, note that we are not augmenting the object prototype here
                //but wrap the native object into a higher representation that will provide generic methods for all browsers
                this._collection = o;
                
                if(!!window.Iterator) {
                    this._nativeIterator = new Iterator(this._collection);
                }
                
                _mapKeys.call(this);
            },
            
            /**
             * Calls the specified callback for each iteration, passing data as an argument
             *
             * @public
             * @function each
             * @param {Function} callback the function to call
             * @param {Object|null} scope (optional) the obj passed in becomes the execution scope of the callback
             *
             * @see https://developer.mozilla.org/en/New_in_JavaScript_1.7
            */
            each : function(callback, scope) {
                if(!Swell.Core.isFunction(callback)) {
                    throw new Error('each(): First arg must be a function');
                }

                // Reset the current pointer
                this._currentPointer = 0;
                
                // Check if we can use native iterator
                if(this._nativeIterator) {
                    for(var _rec in this._nativeIterator) {
                        this._currentPointer++;
                        callback.apply(scope || this, _rec);
                    }
                    return;
                }
                
                // Non native iterator
                for(var _record in this._collection) {
                    this._currentPointer++;
                    callback.apply(scope || this, [_record, this._collection[_record]]);
                }
            },
            
            /**
             * Check if the iterator has reached its last position
             *
             * @public
             * @function atEnd
             * @return {Boolean}
             *
            */
            atEnd : function() {
                if(this._currentPointer < this._keyMapper.length) {
                    return false;
                }
                return true;
            },
            
            /**
             * Gets the current key/value pair
             *
             * @public
             * @function item
             * @return {Array}
             *
            */
            item : function() {
                return this._keyMapper[this._currentPointer];
            },
            
            /**
             * Forwards the cursor position of the iterator 
             *
             * @public
             * @function next
             * @return {Boolean}
             *
            */
            next : function() {
                if(this._nativeIterator) {
                    try {
                        this._nativeIterator.next();
                        this._currentPointer++;
                        return true;
                    } catch(ex) { // catch StopIteration exception if thrown
                        if(ex instanceof StopIteration) {
                            return false;
                        }
                    }
                }
                return !!this._collection[this._currentPointer++];
            }
        }
    }()
    
});

