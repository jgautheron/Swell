/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Core
*/
(function() {

    /*
     * Inspired by inheritance implementation done by Alex Arnell <alex@twologic.com>
    */
    var Class = {

        extend : function(parent, cfg) {
            var mixin;
            if(arguments.length == 1) cfg = parent, parent = null;
            var func = function() {
                this[Swell.CONSTRUCTOR_NAME] = this[Swell.CONSTRUCTOR_NAME] || Function();
                if (!Class.extending) this[Swell.CONSTRUCTOR_NAME].apply(this, arguments);
            };
            if (Swell.Core.isObject(parent)) {
                
                Class.extending = true;
                func.prototype  = new parent(arguments);

                delete Class.extending;
            }
            var mixins = [];
            if (cfg && cfg.mixins) {
                if (cfg.mixins.reverse) {
                    mixins = mixins.concat(cfg.mixins.reverse());
                } else {
                    mixins.push(cfg.mixins);
                }
                delete cfg.mixins;
            }
            if (cfg) Class.inherit(func.prototype, cfg);
            for (var i = 0; (mixin = mixins[i]); i++) {
                Class.mixin(func.prototype, mixin);
            }
            
            return func;
        },
        
        mixin : function(dest) {
            var src;
            for (var i = 1; (src = arguments[i]); i++) {
                if (!Swell.Core.isUndefined(src) && !Swell.Core.isNull(src)) {
                    for (var prop in src) {
                        if (!dest[prop]) { // only mixin functions, if they don't previously exist
                            dest[prop] = src[prop];
                        }
                    }
                }
            }
            return dest;
        },
        
        inherit : function(dest, src, fname) {
            
            if (arguments.length == 3) {
                var ancestor = dest[fname],
                descendent = src[fname],
                method = descendent;
                
                descendent = function() {
                    var ref = this.parent;
                    this.parent = ancestor;
                    var result = method.apply(this, arguments);
                    ref ? this.parent = ref: delete this.parent;
                    return result;
                }; // mask the underlying method
                descendent.valueOf = function() {
                    return method;
                };
                descendent.toString = function() {
                    return method.toString();
                };
                dest[fname] = descendent;
            } else {
                
                for (var prop in src) {
                    if (dest[prop] && Swell.Core.isFunction(src[prop])) {
                        Class.inherit(dest, src, prop);
                    } else {
                        dest[prop] = src[prop];
                    }
                }
            }
            return dest;
        }
    };

    /**
    * @class Core
    * @namespace Swell
    * @static
    */
    Swell.Core = {
    
        /**
         * Just test if variable passed to the function is an array
         *
         * @function isArray
         * @static
         * @param {mixed} a The object being tested
         * @return {boolean}
        */
        isArray : function(a) { 
            return Object.prototype.toString.call(a) === '[object Array]'; 

        },
        
        /**
         * Test if variable passed to the function is a boolean
         *
         * @function isBoolean
         * @static
         * @param {mixed} o The object being tested
         * @return {boolean}
        */
        isBoolean : function(o) {
            return typeof o === 'boolean';
        },
        
        /**
         * Test if variable passed to the function is a function
         *
         * @function isFunction
         * @static
         * @param {mixed} o The object being tested
         * @return {boolean}
        */
        isFunction : function(o) {
            return typeof o === 'function';
        },
        
        /**
         * Test if variable passed to the function is null
         *
         * @function isNull
         * @static
         * @param {mixed} o The object being tested
         * @return {boolean}
        */
        isNull : function(o) {
            return o === null;
        },
        
        /**
         * Test if variable passed to the function is a number
         *
         * @function isInteger
         * @static
         * @param {Mixed} i The object being tested
         * @return {Boolean}
        */
        isInteger : function(i) {
            var o = parseInt(i);
            return (!isNaN(o) && o.toString() == i);
        },
        
        /**
         * Test if variable passed to the function is a float
         *
         * @function isFloat
         * @static
         * @param {Mixed} i The object being tested
         * @return {boolean}
        */
        isFloat : function(i) {
            var o = parseFloat(i);
            return (!isNaN(o) && o.toString() == i);
        },
        
        /**
         * Test if variable passed to the function is an object or a function
         * 
         * @function isObject
         * @static
         * @param {mixed} o The object being tested
         * @return {boolean}
        */  
        isObject : function(o) {
            return (o && (typeof o === 'object' || Swell.Core.isFunction(o)));
        },
            
        /**
         * Test if variable passed to the function is a string
         * 
         * @function isString
         * @static
         * @param {Mixed} o The object being tested
         * @return {Boolean}
        */
        isString : function(o) {
            return typeof o === 'string';
        },
        /**
         * Detects if a given event name is supported
         * @function isSupported
         * @static
         * @param   {String} eventName the Event name click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @see     http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
         * @return  {Boolean}
        */
        isEventSupported : function(eventName) {
            // Remove on keyword if defined
            eventName = eventName.replace(/^on/i, '');
            var _tags = {
                'select':'input',
                'change':'input',
                'submit':'form',
                'reset' :'form',
                'error' :'img',
                'load'  :'img',
                'abort' :'img'
            }, _el, _isSupported;
            // Element is never appended to the DOM, but gets nullified in the end to prevent leaks
            _el = document.createElement(_tags[eventName] || 'span');
            eventName = 'on' + eventName;
            _isSupported = (eventName in _el);
            // FF doesn't support the above statement
            // We have to manually set an attribute and test it afterwards
            if (!_isSupported) {
                _el.setAttribute(eventName, 'return;');
                _isSupported = typeof _el[eventName] == 'function';
            }
            _el = null;
            return _isSupported;
        },
        
        /**
         * Test if variable passed to the function is undefined
         * 
         * @function isUndefined
         * @static
         * @param {Mixed} o The object being tested
         * @return {Boolean}
        */ 
        isUndefined : function(o) {
            return typeof o === 'undefined';
        },
        
        /**
         * Trim whitespace on both sides
         * 
         * @function trim
         * @static
         * @param {String} str The string to trim
         * @return {String}
        */ 
        trim : function(str) {
            // native implementation?
            if (!Swell.Core.isUndefined(String.trim)) {
                return str.trim();
            }
            return /^[\s]?(.+?)[\s]?$/.exec(str, '')[1];
        },
        
        /**
         * Camelize a string
         * 
         * @function camelize
         * @static
         * @param {String} str The string to camelize
         * @return {String}
        */ 
        camelize : function(str) {
            if (str.indexOf('-') === -1) {
                return str;
            }
            return str.replace(/-([a-z])/g, function(o, g) {return g.toUpperCase();});
        },
        
        /**
         * Merges two objects
         * 
         * @function mergeObject
         * @static
         * @param {Object} obj1
         * @param {Object} obj2 This object values will override obj1 values
         * @return {Boolean}
        */ 
        mergeObject : function(obj1, obj2){
            if(typeof obj1 !== 'object' || typeof obj2 !== 'object') {
                return false;
            }
            
            for (var attr in obj2) {
                if (typeof obj2[attr] === 'object') {
                    obj1[attr] = Swell.Core.mergeObject(obj1[attr], obj2[attr]);
                    continue;
                }
                obj1[attr] = obj2[attr];
            }
            return obj1;
        },
        
        /**
         * Count properties of an object
         * 
         * @function countProperties
         * @static
         * @param {Object} o The object being tested
         * @return {Int}
        */ 
        countProperties : function(o){
            var _c = 0;
            if(!Swell.Core.isObject(o)) {
                return false;
            }
            if(o.__count__) {
                _c = o.__count__;
            } else {
                
                for(var prop in o) {
                    _c++;
                }
            }
            return _c;
        },
        
        /**
         * Test if object passed to the function has properties
         * 
         * @function hasProperties
         * @static
         * @param {Object} o The object being tested
         * @return {Boolean}
        */ 
        hasProperties : function(o){
            if(!Swell.Core.isObject(o)) {
                return false;
            }
            if(o.__count__) {
                return o.__count__;
            } else {
                for(var prop in o) {
                    return true;
                }
            }
        },

        /**
         * Returns an array of keys taking an object as a source 
         * 
         * @function getKeys
         * @static
         * @param {Object} o Object with keys
         * @return {String[]} keys
        */ 
        getKeys : function(o) {
            var k, tmp;
            if(Swell.Core.isObject(o)) {
                tmp = [];
                for(k in o) {
                    tmp.push(k);
                }
                return tmp;
            }
            return false;
        },
        
        /**
         * Check if a needle is contained into the array passed as second argument
         * 
         * @function inArray
         * @static
         * @param  {Mixed} needle value to search in the haystack
         * @param  {Array} haystack array to search in
         * @return {Boolean}
        */ 
        inArray : function(needle, haystack) {
            var _l = haystack.length;
            while(_l--) {
                if(needle === haystack[_l]) {
                    return true;
                }
            }
            return false;
        },
        
        /**
         * Transforms an object as hashtable into a querystring representation
         * 
         * @function toQueryString
         * @static
         * @param  {Object} Object as hashtable
         * @return {String}
        */
        toQueryString : function(o) {
            if(!Swell.Core.isObject(o)) {
                return false;
            }
            var _p, _qs = [];
            for(_p in o) {
                _qs.push(encodeURIComponent(_p) + '=' + encodeURIComponent(o[_p]));
            }
            return _qs.join('&');
        },
        
        /**
         * Converts a rgb value into an hexadecimal string
         * 
         * @function rgbToHex
         * @static
         * @param  {Integer} red
         * @param  {Integer} green
         * @param  {Integer} value
         * @return {String}
         * @see http://members.tripod.com/~gristle/hexconv.html
        */
        rgbToHex : function(r, g, b) {
            var _hex = { 0 : 0, 1 : 1, 2 : 2, 3 : 3, 4 : 4, 5 : 5, 6 : 6, 7 : 7, 8 : 8, 9 : 9,
                        10 : 'a', 11 : 'b', 12 : 'c', 13 : 'd', 14 : 'e', 15 : 'f' },
                _r1 = _hex[Math.floor(r / 16)], _r2 = _hex[r % 16],
                _g1 = _hex[Math.floor(g / 16)], _g2 = _hex[g % 16],
                _b1 = _hex[Math.floor(b / 16)], _b2 = _hex[b % 16];
            return '#' + _r1 + _r2 + _g1 + _g2 + _b1 + _b2;
        },
        
        /**
         * Converts an hexadecimal string to a rgb value
         * 
         * @function rgbToHex
         * @static
         * @param  {String} hexadecimal string
         * @return {Array}
         * @see http://members.tripod.com/~gristle/hexconv.html
        */
        hexToRgb : function(hex) {
            hex = hex.toLowerCase().replace('#', '');
            hex = hex.length === 3 ? hex + hex : hex;
            var _rgb = /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/.exec(hex);
            return [ parseInt(_rgb[1], 16), parseInt(_rgb[2], 16), parseInt(_rgb[3], 16) ];
        },
        
        /**
         * Converts a value in pixels with the given element
         * IE specific
         * 
         * @function toPixels
         * @static
         * @param  {el} element
         * @param  {String} value to convert
         * @return {String}
         * @see http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
        */
        toPixels : function(el, val) {
            var _style = el.style.left, _runtimeStyle = el.runtimeStyle.left;
            el.runtimeStyle.left = el.currentStyle.left;
            el.style.left = val || 0;
            val = el.style.pixelLeft;
            el.style.left = _style;
            el.runtimeStyle.left = _runtimeStyle;
            return val;
        },
        
        /**
         * Returns viewport width
         *
         * @function getViewportWidth
         * @static
         * @return {Int}
        */
        getViewportWidth : function() {
            // gecko/webkit/presto/IE7
            if (window.innerWidth) {
                return window.innerWidth;
            }
            
            // IE standards mode
            if (document.documentElement.clientWidth) {
                return document.documentElement.clientWidth;
            }
            
            // IE quirks mode
            if (document.body.clientWidth) {
                return document.body.clientWidth;
            }
        },
        
        /**
         * Returns viewport height
         *
         * @function getViewportHeight
         * @static
         * @return {Int}
        */
        getViewportHeight : function() {
            // gecko/webkit/presto/IE7
            if (window.innerHeight) {
                return window.innerHeight;
            }
            
            // IE6- standards mode
            if (document.documentElement.clientHeight) {
                return document.documentElement.clientHeight;
            }
            
            // IE6- quirks mode
            if (document.body.clientHeight) {
                return document.body.clientHeight;
            }
        },
        
        /**
         * Returns scroll width
         *
         * @function getScrollWidth
         * @static
         * @return {Int}
        */
        getScrollWidth : function() {
            // gecko/webkit/presto/IE7
            if (window.pageXOffset) {
                return window.pageXOffset;
            }
            
            // IE6- standards mode
            if (document.documentElement.scrollLeft) {
                return document.documentElement.scrollLeft;
            }
            
            // IE6- quirks mode
            if (document.body.scrollLeft) {
                return document.body.scrollLeft;
            }
            
            return 0;
        },
        
        /**
         * Returns scroll height
         *
         * @function getScrollHeight
         * @static
         * @return {Int}
        */
        getScrollHeight : function() {
            // gecko/webkit/presto/IE7
            if (window.pageYOffset) {
                return window.pageYOffset;
            }
            
            // IE6- standards mode
            if (document.documentElement.scrollTop) {
                return document.documentElement.scrollTop;
            }
            
            // IE6- quirks mode
            if (document.body.scrollTop) {
                return document.body.scrollTop;
            }
            
            return 0;
        },
        
        /**
         * Sets cookie
         *
         * @function setCookie
         * @static
         * @param {String} name
         * @param {Mixed} value
         * @param {Int} days
        */
        setCookie : function(name, value, days) {
            if (days){
                var _date = new Date(), _expires;
                _date.setTime(_date.getTime() + (days * 24 * 60 * 60 * 1000));
                _expires = '; expires=' + _date.toGMTString();
            }
            else {
                _expires = '';
            }
            document.cookie = name + '=' + value + _expires + '; path=/';
        },
        
        /**
         * Retrieves cookie data
         *
         * @function getCookie
         * @static
         * @return {String}
        */
        getCookie : function(name) {
            var _key = name + '=', 
                _valueAt = document.cookie.split(';');
            for(var _i = 0; _i < _valueAt.length; _i++) {
                var _c = _valueAt[_i];
                while(_c.charAt(0) === ' ') {
                    _c = _c.substring(1, _c.length);
                }
                if(_c.indexOf(_key) == 0) {
                    return _c.substring(_key.length, _c.length);
                }
            }
            return null;
        },
        
        /**
         * Retrieves element's HTMLElement
         *
         * @function get
         * @static
         * @param {String} element ID
         * @return {HTMLElement}
        */
        get : function(el) {
            // since IE 5.5
            return document.getElementById(el);
        },
        
        /**
         * Converts whatever the passed argument is as a HTMLElement
         *
         * @function getEl
         * @static
         * @param {Mixed} el
         * @return {HTMLElement}
        */
        getEl : function(el) {
            if (el === null) {
                return false;
            }
        
            // common plain ID
            if (Swell.Core.isString(el)) {
                return Swell.Core.get(el);
            }
            
            // already a HTMLElement
            if (el.nodeType) {
                return el;
            }
            
            // Swell Element
            if (el instanceof Swell.Core.Element) {
                return el.elements[0];
            }
            
            return null;
        },
        
        /**
         * Get the prototype object, uses the native method when possible (starting from JavaScript 1.9.1)
         * 
         * @function getPrototypeOf
         * @static
         * @see https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Global_Objects/Object/GetPrototypeOf
         * @param {Object} o the object to get the prototype of
         * @return {Object}
        */ 
        getPrototypeOf : function(o) {
            // Check if getPrototypeOf is a language construct in the current browser
            // No user-agent parsing here, just clever property testing
            if(Swell.Core.isFunction(Object.getPrototypeOf)) {
                return Object.getPrototypeOf(o);
            }
            // Determining Instance Relationships with __proto__ property
            if(Swell.Core.isObject(Object.__proto__)) {
                return o.__proto__;
            } else {
                return o.constructor.prototype;
            }
        },
        
        Class : function(o) {
            var constructor, proto, events, namespace, cls = {}, ns, inheritedCls = null, _ns;
            // If o is empty, create an anonymous class
            o = o || {};
            
            // Exit nicely if name property is not cfgined
            if(!o.hasOwnProperty('name')) {
                return false;
            }
            
            if(!o.hasOwnProperty('namespace')) {
                return false;
            } else {
                ns = Swell.namespace(o.namespace);
            }
            
            // Start creating class
            // The functions are the prototype :D
            if(o.hasOwnProperty('functions') && Swell.Core.isObject(o.functions)) {
                cls = o.functions;
            }
            
            // Check at first if Class has mixins of Another objects or anonymous mixins
            if(o.hasOwnProperty('mixins')) {
                cls.mixins = o.mixins;
            }
                       
            ns[o.name] = Class.extend(inheritedCls, cls);
            ns[o.name].ns = {'path' : o.namespace, 'name' : o.name};
            
            _ns = {'path' : o.namespace, 'name' : o.name};
            
            // Implement Multiple inheritance
            if(o.inherits && Swell.Core.isArray(o.inherits)) {
                for(var i=0; i < o.inherits.length; i++) {
                    Swell.Core.Class.inherit.call({'namespace' : _ns}, ns[o.name], o.inherits[i]);
                }
            } else if(o.inherits && Swell.Core.isObject(o.inherits) && !Swell.Core.isArray(o.inherits)) {
                Swell.Core.Class.inherit.call({'namespace' : _ns}, ns[o.name], o.inherits);
            }
           
            return ns[o.name];
        }
    };
    
    // Static functions
    Swell.Core.Class.inherit =  function() {
        
        var _args, _src, _n, _l, _ns;
        
        _args = [].slice.call(arguments,0);
        _src = _args.shift();
        
        if(!this.hasOwnProperty('namespace')) {
            _ns = Swell.namespace(_src.ns.path);
            _ns.name = _src.ns.name;
        } else {
            _ns = Swell.namespace(this.namespace.path);
            _ns.name = this.namespace.name;
        }
        
        for(_n = 0, _l = _args.length; _n < _l; _n++) {
            var _func = Class.extend(_ns[_ns.name], _args[_n].prototype);
            _ns[_ns.name] = _func;
        }
    };
    
    Swell.Core.Class.extend = function(parent, child) {
        return Class.extend(parent, child);
    }
    
    Swell.Core.Class.augment = function(parent, child, override) {
        if (!parent || !child) {
            return false;
        }
        var _p, _override = Swell.Core.isUndefined(override) ? false : override;

        for(_p in child) { 
            if (override || typeof(parent[_p]) === 'undefined') {
                parent[_p] = child[_p];
            }
        }
    }
    
    Swell.Core.Class.mixins =  function() {
        arguments[0] = arguments[0].prototype;
        arguments[0] = Class.mixin.apply(null, arguments);
    };

})();