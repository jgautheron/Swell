/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias DDM
 * @requires BrowserSupports Event Element
 * @crossdep DDM Draggable
 * @crossdep DDM Droppable
*/

/**
 * @class DDM
 * @namespace Swell.Lib.DD
 * @static
*/
Swell.namespace('Swell.Lib.DD');

Swell.Lib.DD.DDM = new function(){
    
    if(Swell.Core.Browser.isGecko) {
        // Only for faulty FF
        Swell.Core.Event.add(document, Swell.Core.Event.Type.DRAGOVER, function(e) {
            Swell.Lib.DD.DDM.X = e.clientX, 
            Swell.Lib.DD.DDM.Y = e.clientY;
            e.stop();
        });
    }
    /**
     * @property {Object} _draggableStack holds the current draggable objects 
     * @private
    */
    var _draggableStack = {};
    /**
     * @property {Object} _droppableStack holds the current droppable objects 
     * @private
    */
    var _droppableStack = {};
    
    return {
        
        /**
         * @property {Swell.Lib.DD.Droppable} activeDroppable current droppable object 
        */
        activeDroppable : null,
        /**
         * @property {Swell.Lib.DD.Draggable} activeDraggable current draggable object
        */
        activeDraggable : null,
        /**
         * @function notify call the appropriate callback of the DD object
         * @private
         */
        notify : function(e, dd) {
            // Detect if object is a droppable
            // and give visual feedback on the appropriate event
            switch(e.type) {
                
                case Swell.Core.Event.Type.DRAGSTART:
                    if(dd.isDraggable) {
                        this.activeDraggable = dd;
                    }
                    break;
                
                case Swell.Core.Event.Type.DRAGOVER:
                    if(this.activeDroppable && !$(e.target).isChild(this.activeDroppable, true)) {
                        
                        if(this.activeDraggable && !!this.activeDraggable.proxy) {
                            this.activeDraggable.proxy.removeClass('dd-proxy-hover');
                        }
                        
                        this.activeDroppable.removeClass('dd-drag-over');
                    }
                    break;
                /**
                 * dragenter
                */
                case Swell.Core.Event.Type.DRAGENTER:
                    if(dd.isDroppable) {
                        
                        if(this.activeDraggable && !!this.activeDraggable.proxy) {
                            this.activeDraggable.proxy.addClass('dd-proxy-hover');
                        }
                        // Apply style on the drop target
                        dd.getDropEl().addClass('dd-drag-over');
                        // Register the current drop target
                        if(!this.activeDroppable) {
                            this.activeDroppable = dd.getDropEl();
                        }
                    }
                    break;
            }
            
            if(!!dd['on' + e.type]) {
                if(Swell.Core.isFunction(dd['on' + e.type])) {
                    //Dispatch callback
                    
                    
                    if(e.type === Swell.Core.Event.Type.DROP) {
                        if(this.activeDraggable && this.activeDraggable.isDragging) {
                            this.activeDraggable.unreg();
                        }
                        dd['on' + e.type].call(dd, e, this.activeDraggable);
                    } else {
                        dd['on' + e.type].call(dd, e);
                    }
                }
            }
        },
        /**
         * @function register the name says it all
         */
        register : function(id, obj) {
            // Check if object is a draggable or droppable 
            if(obj.isDraggable) {
                _draggableStack[id] = obj;
            } else if(obj.isDroppable) {
                _droppableStack[id] = obj;
            }
            // Fire onRegister event
            this.onRegister.fire(obj);
        },
        /**
         * @function getDragEl retrieve the current stack of dragged elements
         * @return {Array}
         */        
        getDragEl : function() {
            var _returnStack = [];
            for(var _dragEl in _draggableStack) {
                _returnStack.push(_draggableStack[_dragEl]);
            }
            return _returnStack;
        },
        /**
        * @event onRegister fires when a new DD object is added to DDM
        */
        onRegister : new Swell.Core.CustomEvent('onRegister', this)
    }
}();