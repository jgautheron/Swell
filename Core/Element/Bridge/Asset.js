/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 * 
 * @alias ElementAsset
 * @requires Asset Element Event
*/

/**
 * Element bridge to Asset
 * @class Asset
 * @namespace Swell.Core.Element.Bridge
 * @augments Swell.Core.Element
*/
Swell.Core.Class.mixins(Swell.Core.Element, {
    
    lazyload : function() {
        
        var _fn = function(args) {
            // Lazy load just works with images
            if(this._domEl.tagName !== 'IMG'          && 
               this._domEl.parentNode.tagName !== 'A' && 
               this._domEl.parentNode.getAttribute('rel') !== 'swell-lazy-load') {
                return false;
            }

            var _link   = this._domEl.parentNode;
            var _config = args[0] || {};
            
            if(_config.hasOwnProperty('trigger')) {
                // Trigger activates lazy loading on images
                if(_config.trigger === Swell.Core.Event.Type.CLICK     ||
                   _config.trigger === Swell.Core.Event.Type.DBLCLICK  ||
                   _config.trigger === Swell.Core.Event.Type.MOUSEDOWN ||
                   _config.trigger === Swell.Core.Event.Type.MOUSEUP   ||
                   _config.trigger === Swell.Core.Event.Type.MOUSEOVER ||
                   _config.trigger === Swell.Core.Event.Type.MOUSEOUT  ||
                   _config.trigger === Swell.Core.Event.Type.MOUSEMOVE) {
                    
                    this.addEvent(_config.trigger, function(e, args) {
                        
                        e.stop();
                        
                        if(args[2].hasOwnProperty('cls')) {
                            $(this).addClass(args[2].cls);
                        }

                        var lazyloader = new Swell.Core.Asset();
                        // Start the lazy loading part
                        lazyloader.load('img', args[1].href, function(im) {
                            this.src = im[0].src;
                        }, this);
                        
                        Swell.Core.Event.remove(this, args[2].trigger);
                        
                        return false;
                        
                    }, null, [this._domEl, _link, _config]);
                }
            }
            return true;
        }
        return this._delegate(_fn, arguments);
    }
});
