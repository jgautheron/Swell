/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Droppable
 * @requires Browser Event Element
*/

/**
 * @class Droppable
 * @namespace Swell.Lib.DD
*/
Swell.Core.Class({
    
    name      : 'Droppable',
    namespace : 'Lib.DD',
    functions : function() {
        
        var _handleNative = function(el) {
            
            var _ddId;
            // Flag Element to draggable -> true, this is useful for future HTML 5 implementation and necessary for internal processing
            // Handle Webkit derivative behavior
            el.setAttribute({'droppable' : 'true'});
            
            _ddId = el.getAttribute('id');
            // Assign a unique ID to the DD Element, if the id is not defined
            if(!_ddId || _ddId === '') {
                _ddId = Swell.uniqueId();
                el.setAttribute({'id' : _ddId});
            }

            // Activate Drag & drop for IE and Webkit
            if(Swell.Core.Browser.isWebkit || Swell.Core.Browser.isIE) {
                if(Swell.Core.Browser.isWebkit) {
                    el.current().style.webkitUserDrag   = 'element';
                }
            }
        }
        
        var _onDragLeave = function(e) {
            Swell.Lib.DD.DDM.notify(e, this);
        }
        
        var _onDrop = function(e) {

            e.preventDefault();
            this._el.removeClass('dd-drag-over');
            
            Swell.Lib.DD.DDM.notify(e, this);
        }
        
        var _onDragEnter = function(e) {
            e.preventDefault();
            Swell.Lib.DD.DDM.notify(e, this);
            return false;
        }

        var _onDragOver = function(e) {
            
            if(!!!this._options.denyDrop) {
                e.preventDefault();
            }
            Swell.Lib.DD.DDM.notify(e, this);
            return false;
        }
        
        /* End of private handlers */
        
        var _handleListeners = function(el) {
            /**
            * @event dragleave Fires when the drag-drop operation leaves a drop target
            */
            Swell.Core.Event.add(el.current(), 'dragleave', _onDragLeave, this);
            
            Swell.Core.Event.add(el.current(), 'dragexit', _onDragLeave, this);
            /**
             * @event dragenter  Fires when the drag-drop operation encounters a drop target
             * @event dragover Fires when the drag-drop operation is over a drop target
            */
            Swell.Core.Event.add(el.current(), 'dragenter', _onDragEnter, this);
            Swell.Core.Event.add(el.current(), 'dragover', _onDragOver, this);
            /**
            * @event drop Fires when the drop operation is done over a drop target
            */
            Swell.Core.Event.add(el.current(), 'drop', _onDrop, this);
        }
        
        var _hasNativeDD = Swell.Core.Event.areSupported('drop','dragenter','dragover') || !!Event.DRAGDROP;
        
        // Part of the public API
        return {
            
            /**
             * @property _options holds the Draggable options
             * @protected
            */
            _options : {},
            /**
             * @property {Boolean} indicates that the object is a draggable
             * @public
            */
            isDroppable : true,
            /**
             * @constructs
             * @param {Mixed} el
             * @param {Object} options
             * @param {Mixed} args
            */
            construct : function(el, options, args) {

                el = Swell.Core.Element.get(el);
                if(!el) {
                    return false; // exit nicely
                }

                this._options = Swell.Core.isObject(options) ? options : {};
                this._el = el;

                // Initialize DD Component
                // Test if element has an ID
                if(_hasNativeDD) {
                    _handleNative.call(this, el);
                }

                // Add DD Object to DDM
                Swell.Lib.DD.DDM.register(el.getAttribute('id'), this);
                // Add listeners
                _handleListeners.call(this, el);
            },

            getDropEl : function() {
                return this._el;
            },
            
            /**
             * @function hasType
             * @param {Object} e
             * @param {String} type
             * @return {Boolean}
            */
            hasType : function(e, type) {
                var _mapping ={
                    'DD_TEXT_PLAIN' : 'text',
                    'DD_URL'        : 'url'
                }
                try {
                    if(Swell.Core.Browser.isGecko) {
                        //Override mapping
                        _mapping ={
                            'DD_TEXT_PLAIN' : 'text/plain',
                            'DD_URL'        : 'text/x-moz-url'
                        }
                        for(var _type in _mapping) {
                            if(e.dataTransfer.types.contains(_mapping[_type])) {
                                if(type == _type) {
                                    return true;
                                }
                            }
                        }
                    } else if(Swell.Core.Browser.isWebkit) {
                        for(var _type in _mapping) {
                            for(var _mime in e.dataTransfer.types) {
                                if(e.dataTransfer.types[_mime] == _mapping[_type]) {
                                    if(_type == type) {
                                        return true;
                                    }
                                }
                            }
                        }
                    } else if(Swell.Core.Browser.isIE) {
                        for(var _type in _mapping) {
                            if(e.dataTransfer.getData(_mapping[_type])) {
                                if(type == _type) {
                                    return true;
                                }
                            }
                        }
                    }
                } catch(ex) {return false}
                return false;
            },
            
            /**
             * @function getData
             * @param {Object} e
             * @param {String} type
             * @return {Mixed}
            */
            getData : function(e, type) {
                try {
                    switch(type) {
                        case 'DD_TEXT_PLAIN':
                            if(Swell.Core.Browser.isIE) {
                                return e.dataTransfer.getData('Text');
                            }
                            return e.dataTransfer.getData('text/plain');
                        break;
                        case 'DD_URL':
                            if(Swell.Core.Browser.isGecko) {
                                return e.dataTransfer.getData('text/x-moz-url');
                            }
                            return e.dataTransfer.getData('URL');
                        break;
                    }
                } catch(ex) {
                    return false;
                }
                return false;
            },
            
            /**
             * @function ondragover
            */
            ondragover : function() {
                // Public API Only
            },
            
            /**
             * @function ondragenter
            */
            ondragenter : function() {},
            
            /**
             * @function ondragleave
            */
            ondragleave : function() {},
            
            /**
             * @function ondrop
            */
            ondrop : function() {}
        }
    }()
});

// Set some shorthands for the class
Swell.alias(Swell.Lib.DD.Droppable, 'Droppable');
