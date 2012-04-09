/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Event
 * @requires Browser
 * @crossdep Element ElementEvent
*/
Swell.namespace('Core.Event');

/**
 * @class EventObject
 * @namespace Swell.Core
*/
Swell.Core.Class({
    
    name      : 'EventObject',
    namespace : 'Core',
    functions : {
        
        modifiers : {
            /**
             * Shift key
             * @property {Boolean}
            */
            shift : false,
            /**
             * Ctrl key
             * @property {Boolean}
            */
            ctrl  : false,
            /**
             * Alt key
             * @property {Boolean}
            */
            alt : false
        },
        /**
        * @property clientX
        */
        clientX : 0,
        /**
        * @property clientY
        */
        clientY : 0,
        /**
         * @constructor
        */
        construct : function(e) {
            // The first parameter is a DOM event
            this.event = e;
            
            this.clientX = this.event.clientX;
            this.clientY = this.event.clientY;
            
            this.modifiers.shift = this.event.shiftKey || false;
            this.modifiers.alt   = this.event.altKey   || false;
            this.modifiers.ctrl  = this.event.ctrlKey  || false;
            
            // Map event properties
            this.target        = this.event.target        || this.event.srcElement;
            this.relatedTarget = this.event.relatedTarget || this.event.fromElement;
            this.dataTransfer  = this.event.dataTransfer  || null;
            this.type          = this.event.type;
        },
        
        /**
         * @function getTarget
         * @return {HTMLElement} the event's target
         * @static
         */
        getTarget : function() {
            return this.event.target || this.event.srcElement;
        },
        
        /**
         * Normalize charcode returned by a keyboard event across browsers
         * @function getKeyCode
         * @return {int} the event's charCode
         * @static
         */
        getKeyCode : function() {
            return this.event.keyCode;
        },
        
        /**
         * Returns either the text corresponding to a charcode or the charcode itself
         * @function getCharCode
         * @return {Mixed} the event's charCode
         * @static
         */
        getCharCode : function(text) {
            var _char;
            _char = this.event.which ? this.event.which : this.event.keyCode;
            
            if(!Swell.Core.isUndefined(text)) {
                if(!this.event.which) {
                    _char = String.fromCharCode(this.event.keyCode);
                } else if(this.event.which > 0) {
                    _char = String.fromCharCode(this.event.which);
                }
            }
            return _char;
        },
        
        /**
         * Stopping event propagation
         * @function stopPropagation
        */
        stopPropagation : function() {
            if(this.event.stopPropagation) {
                this.event.stopPropagation();
                if(this.event.cancelBubble) {
                    this.event.cancelBubble = true;
                }
            } else { // the IE Way
                this.event.cancelBubble = true;
            }
        },
        
        /**
         * Prevent event from executing its default behavior
         * @function preventDefault
         * @param {String} [msg] Text to return when event is cancelled (IE Only)
        */
        preventDefault : function(msg) {
            /**
            * @see http://msdn.microsoft.com/en-us/library/ms534372(VS.85).aspx
            */
            msg = msg || false; // This will sets the returnValue for IE Only
            
            if(this.event.preventDefault) {
                this.event.preventDefault();
            } else { // the IE Way
                this.event.returnValue = msg;
            }
        },
        
        /**
         * Stopping event propagation and default behavior
         * @function stop
        */
        stop : function() {

            this.stopPropagation();
            this.preventDefault();
            
            return false;
        }
    }
});

/**
 * The Event Class provides tools for cross-browser event handling
 *
 * @class Event
 * @namespace Swell.Core
 * @static
*/
Swell.Core.Event = new function(){
    
    // Keep a private collection of events
    // this will help to remove listeners attached to object later
    var __listeners__    = {},
        __preloadDelay__ = 0.3,
        __preloadStack__ = {};
    
    return {
        
        /**
         * Assign an event handler to a DOM element and maintain a representation of
         * the handler into a cache object
         * 
         * @function add
         *
         * @param {String|HTMLElement|Array} o the object to assign the handler to
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function that will be attached to the event (this function will always receive a Swell.Core.EventObject as the first argument, this helps providing a single and consistent way of retrieving properties of event object in a cross-browser approach)
         * @param {Object} scope the obj passed in becomes the execution scope of the handler
         * @param {Mixed} args, arbitrary variables that will be passed back to the handler
         * @param {Boolean|Undefined} skipcache for internal use only, use this parameter with caution
         *
         * @see http://en.wikipedia.org/wiki/DOM_Events
         * @see http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget-addEventListener
        */
        add : function(o, type, fn, scope, args, skipcache, capture) {

            var _type, _wrapperFn, _fnScope, _eventObject, isCached = true, _capture = (!!capture) ? capture : false;
            
            // Testing if o is an object or a string
            // add is just dealing with DOM events, and is not meant to
            // handle custom events of Swell Objects
            // as Swell.Core.Dom is not part of the core distribution <~20K :D
            // We will use the good old document.getElementById for element retrieval
            if(Swell.Core.isString(o)) {
                o = Swell.Core.get(o);
            } else if(Swell.Core.isArray(o)) {
                // Loop on function
                for(var _n = 0; _n < o.length; _n++) {
                    this.add(o[_n], type, fn, scope, args);
                }
                o = null;
            }
            
            // Supporting multiple types
            if(Swell.Core.isArray(type)) {
                // Loop on function
                for(var _n = 0; _n < type.length; _n++) {
                    this.add(o, type[_n], fn, scope, args);
                }
                o = null;
            }
            
            if(!o) {
                return;
            }
            
            // Check if fn is a function, exit nicely
            if(!Swell.Core.isFunction(fn)) {
                return;
            }
            
            args = args !== null ? args : [];
            
            _wrapperFn = function(e) {
            
                var _funcArgs = [];
                
                // Create a new Swell Event object
                _eventObject = new Swell.Core.EventObject(e);
                
                _funcArgs.push(_eventObject, args)
                
                // Pass the event object to the function
                // This will be a Swell Event
                _fnScope = (Swell.Core.isObject(scope)) ? scope : _eventObject.getTarget();
                fn.apply(_fnScope, _funcArgs);
            }
            
            // Append callback property to wrapper function
            _wrapperFn.handler = fn;
            
            // Store safe representation of event type
            _type = type;
            
            // Append handler into collection, this will help
            // to garbage collect even anonymous functions
            if(!skipcache) {
                isCached = this.addToCache(o, _type, _wrapperFn);
            }
            
            if(isCached) {
                // Check if object supports native addEventListener (DOM Level 2) 
                if(o.addEventListener) {
                    o.addEventListener(type, _wrapperFn, _capture);
                } else if(o.attachEvent) {
                    // This is IE event handling, as IE never implements standards the right way :(
                    // append "on" keyword
                    o.attachEvent('on'+type, _wrapperFn);
                }
            }
        },
        
        /**
         * Detects if a given event name is supported
         * @function isSupported
         *
         * @param   {String} eventName the Event name click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @see     http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
         * @return  {Boolean}
        */
        isSupported : function(eventName) {
            return Swell.Core.isEventSupported(eventName);
        },
        
        /**
         * Checks if the event names passed as function arguments are supported
         * @function areSupported
         *
         * @param   {String[]} the Event name(s) click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @see     http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
         * @return  {Boolean}
        */
        areSupported : function() {
            var _eventNames = [].slice.call(arguments, 0), _isSupported = true;
            for(var _i = 0, _eventName; _eventName = _eventNames[_i++];) {
                // If one of the event names is not supported stop the loop and change supported status
                if(!this.isSupported(_eventName)) {
                    _isSupported = false;
                    break;
                }
            }
            return _isSupported;
        },
        
        /**
         * Fires programmatically a native DOM event
         * @function simulate
         *
         * @param {String|HTMLElement|Array} o the object to assign the handler to
         * @param {String} type event type : click, change, keypress, etc, never prepend "on" keyword as Swell does this job for you
         *
         * @see https://developer.mozilla.org/en/DOM/element.dispatchEvent
         * @see http://msdn.microsoft.com/en-us/library/ms536390(VS.85).aspx
        */
        simulate : function(o, e) {
            var _event;
            // Testing if o is an object or a string
            // add is just dealing with DOM events, and is not meant to
            // handle custom events of Swell Objects
            // as Swell.Core.Dom is not part of the core distribution <~20K :D
            // We will use the good old document.getElementById for element retrieval
            
            if(Swell.Core.isString(o)) {
                o = Swell.Core.get(o);
            } else if(Swell.Core.isArray(o)) {
                // Loop on function
                for(var n = 0; n < o.length; n++) {
                    this.simulate(o[n], e);
                }
                o = null;
            }
            
            if(!o) {
                return;
            }
            if(document.createEventObject) { // IE
                _event = document.createEventObject();
                return o.fireEvent('on' + e, _event);
            }
            else {
                // All other browsers
                _event = document.createEvent('HTMLEvents');
                _event.initEvent(e, true, true); //event type,bubbling,cancellable
                return !o.dispatchEvent(_event);
            }
        },

        /**
         * Suspend a whole event type e.g., click, or in junction with fn parameter a targetted event handler 
         *
         * @function suspend
         * @param {String|HTMLElement|Array} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fns the function to suspend
         *
        */
        suspend : function(o, type, fn) {
            /* Remove event listeners but preserve listener cache */
            this.remove(o, type, fn, true);
        },
        
        /**
         * Restore a whole event type e.g., click, or in junction with fn parameter a targetted event handler 
         *
         * @function restore
         * @param {String|HTMLElement|Array} o he object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to restore
        */
        restore : function(o, type, fn) {
            /* This will re-attach listeners to an element using the cache */
            this.add(o, type, fn, null, null, true);
        },
        
        /**
         * Remove an event handler from a DOM element and its representation in the cache 
         *
         * @function remove
         *
         * @param {String|HTMLElement|Array} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to remove
         * @param {Boolean|Undefined} preservecache for internal use only, use this parameter with caution
        */
        remove : function(o, type, fn, preservecache) {
            
            var _listeners, _i;
            type            = type || false;
            fn              = fn   || false;
            preservecache   = preservecache || false;
            
            // Testing if o is either a string, an object or an array
            if(Swell.Core.isString(o)) {
                o = Swell.Core.get(o);
            } else if(Swell.Core.isArray(o)) {
                // Loop on function
                for(var n = 0; n < o.length; n++) {
                    this.remove(o[n], type, fn);
                }
                o = null;
            }
            
            if(!o) {
                return;
            }

            if(type && !fn) {
                //Type is defined but fn has not been passed to function
                // Grab the listener from the cache
                _listeners = this.loadFromCache(o, type);

                if(_listeners) {
                    //The listener is in the cache
                    //Remove listener of the object then remove from cache
                    // Reverse loop to gain some speed :D
                    _i = _listeners.length;
                    while (_i--) {
                        if(o.removeEventListener) {
                            o.removeEventListener(type, _listeners[_i], false);
                        } else if(o.detachEvent) {
                            o.detachEvent('on' + type, _listeners[_i]);
                        }
                    }
                    //Remove type from cache
                    if(!preservecache) {
                        this.deleteFromCache(o, type);
                    }
                }
            } else if(type && Swell.Core.isFunction(fn)) {
                // Grab the listeners from cache
                _listeners = this.loadFromCache(o, type);
                if(_listeners) {
                    //The listener is in the cache
                    //Compare the listener we want to remove with each listeners
                    //in the cache, remove listener when needed
                    _i = _listeners.length;
                    while (_i--) {
                        if(_listeners[_i].handler === fn) {
                            if(o.removeEventListener) {
                                o.removeEventListener(type, _listeners[_i], false);
                            } else if(o.detachEvent) {
                                o.detachEvent('on' + type, _listeners[_i]);
                            }
                            //Remove listener from cache
                            if(!preservecache) {
                                this.deleteFromCache(o, type, fn);
                            }
                        }
                    }
                }
            }
        },
        
        /**
         * Remove all event handlers to avoid memleaks
         *
         * @function removeAll
        */
        removeAll : function() {
            var o = null;
            for(var _listener in __listeners__) {
                o = Swell.Core.get(_listener);
                for(var _type in __listeners__[_listener]) {
                    var _stack = __listeners__[_listener][_type],
                        _i     = _stack.length;
                    while(_i--) {
                        if(o.removeEventListener) {
                            o.removeEventListener(_type, _stack[_i], false);
                        } else if(o.detachEvent) {
                            o.detachEvent('on' + _type, _stack[_i]);
                        }
                        //Remove listener from cache
                        this.deleteFromCache(o, _type);
                    }
                }
            }
        },
        
        /**
         * Delete an event from the cache
         *
         * @function deleteFromCache
         * @param {HTMLElement} o he object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to delete from cache
        */
        deleteFromCache : function(o, type, fn) {
            
            var _k, _handler;
            type = type || false;
            fn   = fn   || false;
            
            if(!o.id) {
                return false;
            }
            if(__listeners__.hasOwnProperty(o.id)) {
                
                // Listener has been found in the cache
                // Delete it either by type or function
                // Add an elseif statement for more functionality (not recommended)
                
                if(type && fn) {
                    if(__listeners__[o.id].hasOwnProperty(type) && Swell.Core.isFunction(fn)) {
                        // Loop listeners of the event type
                        // and if we find a correct match, delete the entry from the cache
                        for(_k in  __listeners__[o.id][type]) {
                            // Create a reference on handler
                            _handler = __listeners__[o.id][type][_k];
                            // If there's a strict equality between functions
                            // we assume that listeners are equals and can be safely deleted from cache
                            if(_handler.handler === fn) {
                                __listeners__[o.id][type][_k] = null; //Prevent IE from leaking
                                delete __listeners__[o.id][type][_k];
                            }
                        }
                    }
                }
                else if(type && !fn) {
                    if(__listeners__[o.id].hasOwnProperty(type)) {
                        // Loop listeners of the event type
                        for(_k in  __listeners__[o.id][type]) {
                            __listeners__[o.id][type][_k] = null; //Prevent IE from leaking
                            delete __listeners__[o.id][type][_k];
                        }
                    }
                }
            }
            return true;
        },
        
        /**
         * Loads an event from the cache
         *
         * @function loadFromCache
         * @param {HTMLElement} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
        */
        loadFromCache : function(o, type) {
            
            var _listener = false;
            type = type || false;

            // Retrieve an object in the cache
            if(!o.id) {
                // ID has been deleted or we are trying to load an object that is not yet in the cache
                return false;
            }
            if(__listeners__.hasOwnProperty(o.id)) {
                // Listener has been found in the cache
                if(type) {
                    // Check if type exists
                    if(__listeners__[o.id].hasOwnProperty(type)) {
                        _listener = __listeners__[o.id][type];
                    }
                } else {
                    _listener = __listeners__[o.id];
                }
            }
            return _listener;
        },
        
        /**
         * Adds an event into cache
         *
         * @function addToCache
         * @param {HTMLElement} o the object that holds the handler
         * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
         * @param {Function} fn the function to add into cache
        */
        addToCache : function(o, type, fn) {
            var _listener, _n, _handler, _found = false;
            // Add ID
            if(!o.id) {
                // Increment unique ID index
                o.id = Swell.uniqueId();
            }
            // Check if element is already registered into listeners
            // If Function and eventName are the same, we don't append the same listener
            // this is part of the W3C Recommandation for DOM Level 2 events
            if(__listeners__.hasOwnProperty(o.id)) {
                _listener = __listeners__[o.id];
            } else {
                _listener = __listeners__[o.id] = {};
            }
            // Checking if event is registered in the cache
            if(_listener.hasOwnProperty(type)) {
                // Now iterate through event handlers
                // and skip caching if the same handler is attached to the element
                for(_n=0; _n < _listener[type].length; _n++) {
                    _handler = _listener[type][_n]['handler'];
                    if(_handler === fn.handler) {
                        // Event handler is already defined, exit nicely
                        _found = true;
                        break;
                    }
                }
                // Tell caller that this handler cannot be cached (event will not be added to DOM)
                if(_found) {
                    return false;
                }
            }
            // Creating hash of handlers
            if(Swell.Core.isArray(_listener[type])) {
                _listener[type].push(fn);
            } else {
               _listener[type] = [fn];
            }
            // Everything should be ok at this point, handler is in the cache
            return true;
        },
        
        /**
         * Return all listeners of an object, (nota : this only concerns events added with Swell.Core.Event)
         *
         * @function getListeners
         * @param {HTMLElement} o the object that holds the handler
        */
        getListeners : function(o) {
            if(Swell.Core.isString(o)) {
                o = Swell.Core.get(o);
            }
            if(!o.id) {
                return false;
            }
            if(__listeners__.hasOwnProperty(o.id)) {
                return __listeners__[o.id];
            }
            return false;
        },
        
        /**
         * Copy listeners of an object to another
         *
         * @function cloneListeners
         * @param {HTMLElement} o the object that holds the handler
         * @param {HTMLElement} dest the object that will receive the cloned handlers
        */
        cloneListeners : function(o, dest, type) {
            
            var _handlers, _k, _n;
            if(Swell.Core.isString(dest)) {
                dest = Swell.Core.get(dest);
            }
            if(Swell.Core.isString(o)) {
                o = Swell.Core.get(o);
            }
            if(!o) {
                return false;
            }
            
            _handlers = this.loadFromCache(o);
            if(_handlers) {
                // Start copying...
                for(_k in _handlers) {
                    // If type is defined
                    if(type && type !== _k) {
                        // Type is not targetted
                        continue;
                    }
                    // And another loop for handlers
                    _n = _handlers[_k].length;
                    while(_n--) {
                        this.add(dest, _k, _handlers[_k][_n].handler);
                    }
                }
            }
            return true;
        },

        /** 
         * Here goes built-in events
        */
        onDomReady : function(fn, scope, args) {
            var _engineVer, _browserVer, _useDOMContentLoaded = false;
            if(args) {
                if(!Swell.Core.isArray(args)) {
                    args = [args];
                }
            } else {
                args = [];
            }
            // Checking if Browser is a Gecko based browser
            // Using DOMContentLoaded if available
            if(Swell.Core.Browser.isGecko) {
                _useDOMContentLoaded = true;
            } else {
                // Checking other browsers
                if(Swell.Core.Browser.isWebkit) {
                    _engineVer = parseFloat(Swell.Core.Browser.version.engine);
                    // Testing if Webkit engine supports DOMContentLoaded event
                    if(_engineVer >= 525.13) {
                        _useDOMContentLoaded = true;
                    }
                } else if(Swell.Core.Browser.isOpera) {
                    // Testing browser version
                    _browserVer = parseFloat(Swell.Core.Browser.version);
                    if(_browserVer >= 9) {
                        //DOMContentLoaded is supported by Opera >= 9
                        _useDOMContentLoaded = true;
                    }
                }
            }
            if(_useDOMContentLoaded) {
                this.add(document, 'DOMContentLoaded', fn, scope, args);
            } else {
                // Target IE Only
                if(Swell.Core.Browser.isIE) {
                    if(document.location.protocol !== 'https') {
                        //Ugly hack of Dean Edwards :D
                        document.write('<scr' + 'ipt id="SwellDomReady" ' + 'src=//:><\/scr' + 'ipt>');
                        this.add('SwellDomReady', Swell.Core.Event.Type.READYSTATE, function(e) {
                            if(this.readyState === 'complete') {
                                // We can call our original handler
                                fn.apply(scope, args);
                            }
                        });
                    } else { // This is Diego's perini trick (re-engineered of course), used as well by YUI and almost all the others :D
                        (function() {
                            try {
                                document.documentElement.doScroll('left');
                            } catch(e) {
                                setTimeout(arguments.callee, 0);
                                return;
                            }
                            fn.apply(scope, args);
                        })();
                    }
                }
            }
        },
        
        /**
         * @borrows Swell.Core.Event.add as this.on
        */
        on : function() {
            return this.add.apply(this, arguments);
        },
        
        /**
         * @borrows Swell.Core.Event.add as this.addEventListener
        */
        addEventListener : function() {
            return this.add.apply(this, arguments);
        },
        
        /**
         * @borrows Swell.Core.Event.add as this.addEvent
        */
        addEvent : function() {
            return this.add.apply(this, arguments);
        },
        
        /**
         * @alias Swell.Core.Event.remove
        */
        un : function() {
            return this.remove.apply(this, arguments);
        }
    }
    
}();

/**
 * Constants for event names.
 * @enum {string}
 * @static
 * @see http://www.quirksmode.org/dom/events/
*/
Swell.Core.Event.Type = {

    // Mouse events
    CLICK               : 'click',
    DBLCLICK            : 'dblclick',
    MOUSEDOWN           : 'mousedown',
    MOUSEUP             : 'mouseup',
    MOUSEOVER           : 'mouseover',
    MOUSEOUT            : 'mouseout',
    MOUSEMOVE           : 'mousemove',
    MOUSEWHEEL          : 'mousewheel',

    // Key events
    KEYPRESS            : 'keypress',
    KEYDOWN             : 'keydown',
    KEYUP               : 'keyup',
    PASTE               : 'paste',

    // Focus
    BLUR                : 'blur',
    FOCUS               : 'focus',
    
    // DD
    DRAGSTART           : 'dragstart',
    DRAG                : 'drag',
    DRAGENTER           : 'dragenter',
    DRAGOVER            : 'dragover',
    DRAGLEAVE           : 'dragleave',
    DRAGEXIT            : 'dragexit',
    DRAGEND             : 'dragend',
    DROP                : 'drop',

    // Forms
    CHANGE              : 'change',
    SELECT              : 'select',
    SUBMIT              : 'submit',
    RESET               : 'reset',

    // Misc
    LOAD                : 'load',
    UNLOAD              : 'unload',
    HELP                : 'help',
    RESIZE              : 'resize',
    SCROLL              : 'scroll',
    READYSTATE          : 'readystatechange',
    CONTEXTMENU         : 'contextmenu',
    ERROR               : 'error',
    
    // IE Proprietary events (the most common)
    MOUSEENTER          : 'mouseenter',
    MOUSELEAVE          : 'mouseleave',
    DEACTIVATE          : 'deactivate',
    FOCUSIN             : 'focusin',
    FOCUSOUT            : 'focusout',
    HASHCHANGE          : 'hashchange',
    ABORT               : 'abort',
    ACTIVATE            : 'activate',
    AFTERPRINT          : 'afterprint',
    
    // Mozilla Specific Events
    COPY                : 'copy',
    CUT                 : 'cut'

};