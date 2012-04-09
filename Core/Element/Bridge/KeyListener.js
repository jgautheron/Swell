/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias ElementKeyListener
 * @requires Element Event KeyListener
*/

/**
 * Element bridge to KeyListener
 * @class KeyListener
 * @namespace Swell.Core.Element.Bridge
 * @augments Swell.Core.Element
*/
Swell.Core.Class.mixins(Swell.Core.Element, {
    /**
     * KeyListener is a utility that provides an easy interface for listening for
     * keydown/keyup events fired against DOM elements.
     *
     * @function addKeyListener
     * @param {Object|String} keys
     * @param {Function} callback function to call when key is detected
     * @param {Object} scope
    */
    addKeyListener : function() {
        var _fn = function(args) {
            return Swell.Core.Event.addKeyListener(this._domEl, args[0], args[1], args[2]);
        }
        return this._delegate(_fn, arguments);
    }
});
