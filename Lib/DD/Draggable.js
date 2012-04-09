/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Draggable
 * @requires Browser Event Element
*/

/**
 * @class Draggable
 * @namespace Swell.Lib.DD
*/
Swell.Core.Class({
    
    name      : 'Draggable',
    namespace : 'Lib.DD',
    functions : function() {
    
        var _dragActivationDelay = 100;
        
        var _createProxy = function(e) {
            try {
                
                
                this.proxy.addClass(this.CLS_PROXY);
                 
                // Create visual proxy for the element
                this.proxy.setStyle({
                    'position' : 'absolute',
                    'left'     : (e.clientX + 20) + "px",
                    'top'      : (e.clientY + 20) + "px"
                });


                if(!this._proxyInitialized) {
                    this.proxy.appendTo(document.body);
                    this.proxy.show();
                    this._proxyInitialized = true;
                }
                
            } catch(exception) {
                //@todo
            }
        }
        
        var _handleNative = function(el) {
            
            var _ddId;
            // Handle Webkit derivative behavior
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
                    el.current().style.khtmlUserDrag    = 'element';
                }
            }
        }
        
        /* Private handlers for DD Operations */
        var _onDragStart = function(e) {
        
            var dt = e.dataTransfer;

            if(Swell.Core.Browser.isGecko && Swell.Core.Browser.supports.webWorkers) {
                if(this.originalTarget) {
                    var _target = this.originalTarget.current();
                } else {
                    _target = e.target;
                }               
                var _dragImage = (!!this.options.proxy) ? document.createElement('span') : _target; //Ugly :S
                dt.setDragImage(_dragImage, 20, 20);
            }
            
            dt.effectAllowed = "all";
            
            if(this.options && this.options.dataCallback) {
                this.options.dataCallback.call(this, dt);
            }

            if(this.options && !!this.options.proxy) {
                this.proxy.show();
            }
            
            // Tell DDM That a drag start happened
            Swell.Lib.DD.DDM.notify(e, this);
        }
        
        var _onDragOver = function(e) {
            Swell.Lib.DD.DDM.notify(e, this);
        }
        
        var _onDrag = function(e) {
            
            var _offX = e.clientX || Swell.Lib.DD.DDM.X,
                _offY = e.clientY || Swell.Lib.DD.DDM.Y;
                
            if(this.proxy) {
                this.proxy.setStyle({
                    'left'   : (_offX + 20) + "px",
                    'top'    : (_offY + 20) + "px"
                });
            }
        }
        
        var _onDragEnd = function(e) {
            if(this.isDragging) {
                this.unreg();
            }
            Swell.Lib.DD.DDM.notify(e, this);
        }

        /* End of private handlers */
        
        
        /**
         * Initialize DnD events on the drag source
         * @function _handleListeners
         * @private
         */
        var _handleListeners = function(el) {
            /**
            * @event dragstart Fires when the drag-and-drop operation is initiated
            */
            Swell.Core.Event.add(el.current(), 'dragstart', _onDragStart, this);
            /**
            * @event drag  Fires continuously during the drag-and-drop operation
            */
            Swell.Core.Event.add(el.current(), 'drag', _onDrag, this);
            /**
            * @event dragend Fires when the drop event has fired on the drop target
            */           
            Swell.Core.Event.add(document.documentElement, 'dragover', _onDragOver, this);
            /**
            * @event dragend Fires when the drop event has fired on the drop target
            */           
            Swell.Core.Event.add(el.current(), 'dragend', _onDragEnd, this);
        }
        
        //Simple yet powerful way of detecting if the browser supports system DnD
        var _hasNativeDD = Swell.Core.Event.areSupported('drag','drop','dragstart','dragend','dragenter','dragover') || !!Event.DRAGDROP;
        
        // Part of the public API
        return {
            /**
            * classname applied on the proxy
            * @static
            * @property {String}
            */
            CLS_PROXY : 'dd-proxy',
            /**
            * classname applied on the proxy when hovering a valid drop target
            * @static
            * @property {String}
            */
            CLS_DROP_ALLOWED : 'dd-drop-allowed',
            /**
            * @static
            * @property {String} classname applied on the proxy when hovering an invalid drop target
            */
            CLS_NO_DROP     : 'dd-drop-forbidden',
            /**
             * @property {Object} options holds the Draggable options
             * @protected
            */
            options : {},
            /**
            * @private
            */
            _proxyInitialized : false,
            /**
             * @property {HTMLElement} holds the drag source object
             * @protected
            */
            _el : null,
            /**
             * @property {Boolean} indicates that the object is a draggable
             * @public
            */
            isDraggable : true,
            /**
             * @property {Boolean} indicates that the object is currently dragged
             * @public
            */
            isDragging : false,
            /**
            * @property {Boolean} indicates if the draggable is over a target or not
            */
            isOverTarget : false,
            /**
            * @property {Swell.Core.Element} original target
            */
            originalTarget : null,
            /**
             * Builds the DD object (object that follows the mouse cursor) using system DnD when possible 
             * and simulated implementation when necessary
             *
             * @constructs
             */
            construct : function(el, options, args) {

                el = Swell.Core.Element.get(el);
                if(!el) {
                    return false; // exit nicely
                }
                
                if(options && !!options.proxy && !!!options.delegate) {
                    this.proxy = el.clone(true);
                }
                
                this._el = el;
                this.options = Swell.Core.isObject(options) ? options : {};

                // Initialize DD Component
                // Test if element has an ID
                if(_hasNativeDD) {
                    if(!!!this.options.delegate) {
                        _handleNative.call(this, el);
                    } else {
                        Swell.Core.Event.add(el.current(), 'mousedown', function(e) {
                            
                            if(!this.isDragging) {
                                
                                // Transform element into a Swell Element
                                var _target = $(e.target);
                                var _draggableEl = _target.getParentBy(function(node) {
                                    if(node && node.nodeType === 1 && node.getAttribute('draggable')) {
                                        return true;
                                    }
                                }, this._el.current())

                                if(!!_draggableEl) {
                                
                                    this.isDragging = true;
                                    
                                    //detect timeout
                                    if(Swell.Core.Browser.isIE) {
                                        
                                        var _that = this;
                                        this.clickTimeout = setTimeout( 
                                            function() { 
                                                _draggableEl.current().dragDrop();
                                                clearTimeout(_that.clickTimeout);
                                            },
                                        _dragActivationDelay);
                                    }

                                    this.originalTarget = _draggableEl;

                                    _handleNative.call(this, _draggableEl);
                                    
                                    if(this.options && this.options.proxy) {
                                        // Check if clicked element is a child of the delegated parent
                                        if(!!this.options.proxyOverride) {
                                            this.proxy = this.options.proxyOverride;
                                        } else {
                                            this.proxy =  _draggableEl.clone(true);
                                        }
                                        
                                        if(!this._proxyInitialized) {
                                            _createProxy.call(this, e);
                                        }
                                    }
                                }
                            } 
                            
                        }, this)
                        
                        Swell.Core.Event.add(document, 'mouseup', function(e) {
                            
                            if(this.isDragging) {
                                this.unreg();
                            } 
                            
                        }, this)
                        
                        
                    }
                }

                // Add listeners
                _handleListeners.call(this, el);
            },
            
            /**
             * @function unreg 
            */
            unreg : function() {
                if(!!this.proxy && this.isDragging) {
                    this.proxy.remove();
                    this._proxyInitialized = false;
                }
                this.isDragging = false;
            },
            
            /**
             * @function getDragEl
             * @return {Swell.Core.Element}
            */
            getDragEl : function() {
                return this.originalTarget || this._el;
            },
            
            getMetaData : function() {
                return this.options.meta || null;
            },
            
            /**
             * @function setData
             * @return {Boolean}
            */
            setData : function(dt, type, value) {
                var _success = false;
                switch(type) {
                    case 'text/plain':
                        if(Swell.Core.isArray(value)) {
                            for(var _n = 0, _i = value.length; _n < _i; _n++) {
                                _success = dt.setData('Text', value[_n]);
                            }
                            if(!_success) {
                                value = value.join("\n");
                            }
                        } else {
                            _success = dt.setData('Text', value);
                        }
                        break;
                    case 'text/uri-list':
                        if(Swell.Core.isArray(value)) {
                            for(var _n = 0, _i = value.length; _n < _i; _n++) {
                                _success = dt.setData('URL', value[_n]);
                            }
                            if(!_success) {
                                value = value.join("\n");
                            }
                        } else {
                            _success = dt.setData('URL', value);
                        }
                        break;
                    case 'text/html':
                        _success = dt.setData(type, value);
                        break;
                }
                if(!_success) {
                    dt.setData('Text', value);
                }
                return _success;
            },
            
            /**
             * @function setStatus
             * @param {String} status
            */
            setStatus : function(status) {
                if(!!this[status]) {
                    // Reset class
                    this.proxy.resetClass([this.CLS_PROXY, this[status]]);
                } else {
                    this.proxy.resetClass(this.CLS_PROXY);
                }
            }
        }
    }()
});

// Set some shorthands for the class
Swell.alias(Swell.Lib.DD.Draggable, 'Draggable');
