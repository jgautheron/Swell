/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 * 
 * @alias CustomEvent
 * @requires Core
*/

/**
 * @class CustomEvent
 * @namespace Swell.Core
*/
Swell.Core.Class({
    
    name      : 'CustomEvent',
    namespace : 'Core',
    functions : function() {
        
        return {
        
            /**
             * Custom event name
             * @property name
             * @type {String}
             */
            name : null,
            /**
             * Hash of custom event subscribers
             * @property subscribers
             * @type {Function[]}
            */
            subscribers : [],
            /**
             * Tell the Class that browser is DOM Level 3 compliant
             * @property isDomLevel3Browser
             * @type {Boolean}
            */
            isDomLevel3Browser : false,
            /**
             * Original scope of the CustomEvent (generally binds an event to a class)
             * @property scope
             * @type {Object}
            */
            scope : null,
            
            /**
             * @constructs
            */
            construct : function(name, scope) {
                //var _ev;
                
                this.subscribers = [];
                // Initialize custom event name
                this.name = name;
                // Sets current scope on window if scope is not an object
                this.scope = (Swell.Core.isObject(scope)) ? scope : window;
                
                // We have to check if current implementation supports
                // CustomEvent
                /*if(document.createEvent) {
                    // Try-catch CustomEvent
                    // So DOM Level 3 Compliant browsers can execute this code while others will fallback on the custom implementation
                    try {
                        // This code has not yet been tested as there's no Browser support for now.
                        _ev = document.createEvent('CustomEvent');
                        _ev.initCustomEventNS(null, this.name, true, true, this.name);
                        window.dispatchEvent(_ev);
                        this.isDomLevel3Browser = true;
                    } catch(e) {
                        this.isDomLevel3Browser = false;
                    }
                }*/
            },
            
            /**
             * Check if the passed function is already subscribed
             * @function isSubscribed
             * @param {Function} fn function reference (doesn't work with anonymous functions)
             * @return {Boolean}
            */
            isSubscribed : function(fn) {
                var _l = this.subscribers.length;
                while(_l--) {
                    if(fn === this.subscribers[_l].callback) {
                        return true;
                    }
                }
                return false;
            },
            
            /**
             * Subscribe to the Event
             *
             * @function subscribe
             * @param {Function} fn the function to be called back when event fires
             * @param {Object} [scope] the execution scope of the callback function e.g. (this keyword) (optional)
            */
            subscribe : function(fn, scope) {
                
                // Exit nicely if fn is not a valid function reference
                if(!Swell.Core.isFunction(fn)) {
                    return false;
                }
                // Then check if scope is an object (if defined)
                if(!scope || !Swell.Core.isObject(scope)) {
                    scope = this.scope;
                }
                
                var _wrapperFn;
                // We use a wrapper function for scope correction
                // This ensure to have a proper reference with "this" keyword
                // inside the callback function
                _wrapperFn = function() {
                    // get function arguments
                    var _funcArgs = [].slice.call(arguments, 0);
                    // Call function with cumulated arguments
                    return fn.apply(scope, _funcArgs);
                };
                
                //late static binding some arguments
                _wrapperFn.callback = fn;
                
                // We have to check if function signature is not in the subscribers stack
                if(!this.isSubscribed(fn)) {
                    this.subscribers.push(_wrapperFn);
                    return true;
                }
                return false;
            },

            /**
             * Unsubscribe a specific callback
             *
             * @function unsubscribe
             * @param {Function} callback function
             *
            */
            unsubscribe : function() {
                var _n, _callback;
                // Testing if fn is a function :D
                if(!arguments[1] && !Swell.Core.isFunction(arguments[0])) {
                    return false; // Exit nicely
                }
                
                // Unsubscribe specific listener
                for(_n=0, _l = this.subscribers.length; _n < _l; _n++) {
                    if(!Swell.Core.isUndefined(this.subscribers[_n])) {
                        _callback = this.subscribers[_n].callback;
                        
                        if(!arguments[1]) {
                            if(arguments[0] === _callback) {
                                this.subscribers[_n].callback = null;
                                this.subscribers[_n].args = null;
                                // Safe removal from array
                                this.subscribers.splice(_n, 1);
                            }
                        } else {
                            this.subscribers[_n].callback = null;
                            this.subscribers[_n].args = null;
                            this.subscribers.splice(_n, 1);
                        }
                    }
                }
                return true;
            },
            
            /**
             * Unsubscribe all callback functions from the event
             * @function unsubscribeAll
             *
            */
            unsubscribeAll : function() {
                // Detach all subscribers
                this.unsubscribe(null, true);
                // Reset subscriber array (prevent memleak)
                this.subscribers = [];
            },
            
            /**
             * Fire an event registered through createEvent
             * This will execute the callback functions with
             * the scope and the arguments passed in
             * the caller can provide arguments as well
             *
             * @function fire
             * @param {Mixed} [arguments] Arguments to passback to the callback function (optional)
             *
            */
            fire : function() {
                var _args = [].slice.call(arguments, 0), _n, _l;
                for(_n=0, _l = this.subscribers.length; _n < _l; _n++) {
                    if(!Swell.Core.isUndefined(this.subscribers[_n])) {
                        this.subscribers[_n].apply(this.subscribers[_n], _args);
                    }
                }
            },
            
            /**
             * Get all the subscribers
             *
             * @function getSubscribers
             * @return {Array} list of all the subscribers for this event
             *
            */
            getSubscribers : function() {
                return this.subscribers;
            }
        }
        
    }()
    
});

/**
 * CustomEventModel is meant to be used in the inheritance chain only
 * This will provide a Built-in Custom-Event system for any class
 * inheriting CustomEventModel
 *
 * @class CustomEventModel
 * @namespace Swell.Core
*/
Swell.Core.Class({
    
    name : 'CustomEventModel',
    namespace : 'Core',
    functions : function() {
        
        /** Only private static variables and methods, should reside here */
       
        return {
            
            _listeners : {},
            
            /**
             * Constructor, initialize listeners, and construct the parent class
             *
             * @function construct
             * @constructor
            */
            construct : function(){
                this._listeners = {};
                this.parent.apply(this, arguments);
            },
            
            /**
             * Create a new Custom event
             *
             * @function createEvent
             * @param {String} name Name of the Event e.g. "initialized"
             * @param {Object} [scope] Default Execution scope of the callback function (optional)
            */
            createEvent : function(name, scope) {
                // Address potential scope issues
                scope = scope || this;
                //Override existing listeners, create a stack when a new one is created
                this._listeners[name] = new Swell.Core.CustomEvent(name, scope);
            },
            
            /**
             * Fire a Custom event registered with createEvent
             *
             * @function fireEvent
             * @param {String} name Name of the Event to fire e.g. "initialized"
             * @param {Mixed} [args] Arguments to pass to the callback function (optional)
            */
            fireEvent : function(name, args) {
                var _listener;
                _listener = this._listeners[name];

                if (_listener) {
                    _listener.fire(args);
                }
            },
            
            /**
             * Subscribe to a Custom event registered with createEvent
             *
             * @function subscribe
             * @param {String} name Name of the Event to subscribe e.g. "initialized"
             * @param {Function} callback Callback function to call when the event fires
             * @param {Object} [scope] Overrides default execution scope of the callback function (optional)
             * @param {Mixed} [args] Arguments to pass to the callback function (optional)
            */
            subscribe : function(name, callback, scope, args) {
                var _listener;
                _listener = this._listeners[name];

                if (_listener) {
                    _listener.subscribe(callback, scope, args);
                }
            },
            
            /**
             * Unsubscribe to a Custom event registered with createEvent
             *
             * @function unsubscribe
             * @param {String} name Name of the Event to unsubscribe e.g. "initialized"
             * @param {Function} [callback] Callback function to unsubscribe (optional)
            */
            unsubscribe : function(name, callback) {
                if(this._listeners.hasOwnProperty(name) && !callback) {
                    // Unsubscribe all
                    this._listeners[name].unsubscribeAll();
                } else {
                    this._listeners[name].unsubscribe(callback);
                }
            },
            
            getEvents : function() {
                return this._listeners;
            }
        }
    }()
});