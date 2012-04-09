/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias ElementEvent
 * @requires Element Event
*/

/**
 * Element bridge to Event
 * @class Event
 * @namespace Swell.Core.Element.Bridge
 * @augments Swell.Core.Element
*/
Swell.Core.Class.mixins(Swell.Core.Element, {

    /**
     * Assign an event handler to a DOM element and maintain a representation of
     * the handler into a cache object
     *
     * @function addEvent
     * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
     * @param {Function} fn the function that will be attached to the event (this function will always receive a Swell.Core.EventObject as the first argument,
     *                      this helps providing a single and consistent way of retrieving properties of event object in a cross-browser approach)
     * @param {Object} scope the obj passed in becomes the execution scope of the handler
     * @param {Mixed} args, arbitrary variables that will be passed back to the handler
     * @return {HTMLElement}
    */
    addEvent : function() {
        var _fn = function(args) {
            return Swell.Core.Event.add(this._domEl, args[0], args[1], args[2], args[3]);
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Remove an event handler from a DOM element and its representation in the cache 
     *
     * @function removeEvent
     * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
     * @param {Function} fn the function to remove
    */
    removeEvent : function() {
        var _fn = function(args) {
            return Swell.Core.Event.remove(this._domEl, args[0], args[1]);
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Suspend a whole event type e.g., click, or in junction with fn parameter a targetted event handler 
     *
     * @function suspendEvent
     * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
     * @param {Function} fns the function to suspend
     *
    */
    suspendEvent : function() {
        var _fn = function(args) {
            return Swell.Core.Event.suspend(this._domEl, args[0], args[1]);
        }
        return this._delegate(_fn, arguments);
    },

    /**
     * Restore a whole event type e.g., click, or in junction with fn parameter a targetted event handler 
     *
     * @function restoreEvent
     * @param {String} type event type : click, load, etc, never prepend "on" keyword as Swell does this job for you
     * @param {Function} fn the function to restore
    */
    restoreEvent : function() {
        var _fn = function(args) {
            return Swell.Core.Event.restore(this._domEl, args[0], args[1]);
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Fires programmatically a native DOM event
     *
     * @function simulateEvent
     * @param {String} type event type : click, change, keypress, etc, never prepend "on" keyword as Swell does this job for you
    */
    simulateEvent : function() {
        var _fn = function(args) {
            return Swell.Core.Event.simulate(this._domEl, args);
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Return all listeners of an object, (nota : this only concerns events added with Swell.Core.Event)
     *
     * @function getListeners
    */
    getListeners : function() {
        var _fn = function(args) {
            return Swell.Core.Event.getListeners(this._domEl);
        }
        return this._delegate(_fn, arguments);
    }
});
