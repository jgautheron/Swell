/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Carousel
 * @requires Position CustomEvent Event KeyListener
*/

/**
 * @class Carousel
 * @namespace Swell.Widget
 * @inherits Swell.Core.CustomEventModel
*/
Swell.Core.Class({
    name      : 'Carousel',
    namespace : 'Widget',
    inherits  : Swell.Core.CustomEventModel,
    functions : function() {
    
        /**
         * Setups widget navigation (arrows) if asked
         *
         * @private
         * @static
         * @function _setUpNavigation
        */
        var _setUpNavigation = function() {
            if (this.config.navigation.html !== null) {
                this.container.el.prepend(this.config.navigation.html);
            }
        }
        
        /**
         * Handles backwards click event
         *
         * @private
         * @static
         * @function _handleBackward
        */
        var _handleBackward = function() {
            if (this.currentOffset === 0) {
                return;
            }
            this.currentOffset--;
            this.list.el.setStyle({left : '-' + this.offsets[this.currentOffset] + 'px'});
            this.fireEvent('onPositionChange');
        }
        
        /**
         * Handles forwards click event
         *
         * @private
         * @static
         * @function _handleForward
        */
        var _handleForward = function() {
            if (this.currentOffset === this.offsets.length - 2) {
                if (this.config.loop) {
                    var _firstImage = this.images[0], _el = Swell.Core.Element.get(_firstImage.image);
                    this.images.shift();
                    this.images.push(_firstImage);
                    _el.remove();
                    this.list.el.appendChild(_el);
                    for (var _o = 1; _o < this.offsets.length; _o++) {
                        this.offsets[_o] = this.offsets[_o] - _firstImage.containerWidth;
                    }
                    _computeOffsets.call(this);
                    this.currentOffset--;
                }
            } else if (this.currentOffset === this.offsets.length - 1) {
                return;
            }
            
            this.currentOffset++;
            this.list.el.setStyle({left : '-' + this.offsets[this.currentOffset] + 'px'});
            this.fireEvent('onPositionChange');
        }
        
        /**
         * Computes every offset in advance
         *
         * @private
         * @static
         * @function _computeOffsets
        */
        var _computeOffsets = function() {
            var _i = 0, _leftOffset = 0, _imagesWidth, _nextOffset;
            this.offsets = [0];
            while (this.images[_i]) {
                _imagesWidth = 0;
                while (_imagesWidth < this.viewport.width) {
                    if (Swell.Core.isUndefined(this.images[_i])) {
                        break;
                    }
                    _imagesWidth += this.images[_i].containerWidth;
                    _i++;
                }
                
                // are we at the end? if so we'd better stop this loop
                if (_imagesWidth < this.viewport.width) {
                    break;
                }
                
                _leftOffset = _leftOffset + _imagesWidth;
                if (_imagesWidth - this.IMAGE_EXTRA_MARGIN > this.viewport.width) {
                    // an image is not displayed entirely, but the next time, it will
                    _nextOffset = _leftOffset - this.images[_i - 1].containerWidth;
                    this.offsets.push(_nextOffset);
                    _leftOffset = _nextOffset;
                    _i--;
                } else {
                    this.offsets.push(_leftOffset);
                }
                this.images[_i].leftOffset = _leftOffset;
            }
        }
        
        /**
         * Registers each carousel image
         *
         * @private
         * @static
         * @function _parseImages
        */
        var _parseImages = function() {
            var _listElements = this.list.el.getChildren().getFirstChild().elements, _imageContainer;
            this.images = [];
            for (var _i = 0, _image; _image = _listElements[_i++];) {
                this.images.push({
                    image : _image.parentNode,
                    imageWidth : _image.width,
                    containerWidth : _image.parentNode.offsetWidth
                });
            }
        }
        
        /**
         * Widget application logic
         *
         * @private
         * @static
         * @function _handleCarousel
        */
        var _handleCarousel = function() {
            // initializes carousel
            _createEvents.call(this);
            _parseImages.call(this);
            _computeOffsets.call(this);
            
            // ensures total image width doesn't exceed carousel's viewport width
            if (this.offsets[this.offsets.length - 1] - this.IMAGE_EXTRA_MARGIN > this.viewport.width) {
                _setUpNavigation.call(this);
            
                // navigation events
                Swell.Core.Event.add(this.config.navigation.left, Swell.Core.Event.Type.CLICK, _handleBackward, this);
                Swell.Core.Event.add(this.config.navigation.right, Swell.Core.Event.Type.CLICK, _handleForward, this);
            }

            if (this.config.keylistener) {
                // allows focus on the container
                this.container.el.setAttribute({tabindex : 0}); 
                // binds keylistener on left & right keys (bound to its container)
                this.container.el.addKeyListener({keys : [Swell.Core.Event.Key.LEFT, Swell.Core.Event.Key.RIGHT]}, function(e, str, keycode) {
                    switch (keycode) {
                        case Swell.Core.Event.Key.LEFT:
                            _handleBackward.call(this);
                            break;
                        case Swell.Core.Event.Key.RIGHT:
                            _handleForward.call(this);
                            break;
                    }
                }, this);
            }
        }
        
        /**
         * Initialize custom events
         *
         * @function createEvents
        */
        var _createEvents = function() {
            this.createEvent('onPositionChange', this);
        }
        
        return {
            /**
             * @property {Int} Error margin allowed when computing offsets (in pixels)
             * @public
             * @constant
            */
            IMAGE_EXTRA_MARGIN : 15,
            
            /**
             * @property {Object} config Widget settings
             * @public
            */
            config : {
                loop : false,
                parent : null,
                keylistener : false,
                navigation : {
                    html : null,
                    left  : 'swell-widget-carousel-navigation-left',
                    right : 'swell-widget-carousel-navigation-right'
                }
            },
            
            /**
             * @property {Object} UL properties
             * @public
            */
            list : { el : null },
            
            /**
             * @property {Object} UL viewport properties
             * @public
            */
            viewport : { el : null, width : 0 },
            
            /**
             * @property {Object} Container properties
             * @public
            */
            container : { el : null },
            
            /**
             * @property {Object} Images stack
             * @public
            */
            images : [],
            
            /**
             * @property {Object} Computed offsets
             * @public
            */
            offsets : [0],
            
            /**
             * @property {Object} Current offset
             * @public
            */
            currentOffset : 0,
            
            /**
             * @constructor
             * @param {Mixed} el
             * @param {Object} config
            */
            construct : function(el, config) {
                // saves config
                this.config = Swell.Core.mergeObject(this.config, config || {});
                
                this.list.el = Swell.Core.Element.get(el);
                this.viewport.el = this.list.el.getParentNode();
                this.viewport.width = this.viewport.el.getWidth();
                this.container.el = Swell.Core.isString(this.config.parent) ? Swell.Core.Element.get(this.config.parent) : this.viewport.el.getParentNode();
                
                _handleCarousel.call(this);
            },
            
            /**
             * Sets as current the given offset
             *
             * @function setOffset
             * @param {Int} offset
            */
            setOffset : function(offset) {
                if (offset >= this.offsets.length) {
                    return;
                }
                
                this.currentOffset = offset;
                this.list.el.setStyle({left : '-' + this.offsets[this.currentOffset] + 'px'});
                this.fireEvent('onPositionChange');
            }
        }
        
    }()
    
});