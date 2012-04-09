/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias ImageZoom
 * @requires Position Event Asset
*/

/**
 * @class ImageZoom
 * @namespace Swell.Widget
*/
Swell.Core.Class({
    name      : 'ImageZoom',
    namespace : 'Widget',
    functions : function() {
    
        /**
         * Computes the size ratio between the thumb and the big image
         *
         * @private
         * @static
         * @function _computeRatio
         * @return {Number}
        */
        var _computeRatio = function() {
            // check for illogical possibilities
            if (this.imageLarge.size.width < this.imageThumb.offset.width || this.imageLarge.size.height < this.imageThumb.offset.height) {
                throw new Error('The big image should be bigger and share the same size ratio.');
            }
            
            return this.imageLarge.size.width / this.imageThumb.offset.width;
        }
        
        /**
         * Creates and set up the zoom box
         *
         * @private
         * @static
         * @function _createZoomBox
         * @return {Object} Swell Element
        */
        var _createZoomBox = function() {
            var _defaultStyles = {
                width : this.config.containerWidth + 'px',
                height : this.config.containerHeight + 'px',
                background : 'transparent url(' + this.imageLarge.src + ') no-repeat 0 0',
                display : 'none'
            }, _caption = this.config.captionText === null ? null : html.div({style : this.config.captionStyle}, this.config.captionText);
            return html.div({
                style : Swell.Core.mergeObject(this.config.zoomBoxStyle, _defaultStyles)
            }, _caption).setContext(this.imageThumb.el, 'r').setX(this.config.zoomBoxLeftMargin, true).appendTo(document.body);
        }
        
        /**
         * Creates and set up the cursor box
         *
         * @private
         * @static
         * @function _createCursorBox
         * @return {Object} Swell Element
        */
        var _createCursorBox = function() {
            var _defaultStyles = {
                zIndex : 5,
                display : 'none',
                position : 'absolute',
                top : 0, left : 0,
                width : this.cursorBox.width + 'px',
                height : this.cursorBox.height + 'px'
            };
            _defaultStyles = Swell.Core.mergeObject(this.config.cursorBoxStyle, _defaultStyles);
            return html.div({
                style : _defaultStyles
            }).appendTo(this.imageContainer.el);
        }
        
        /**
         * Widget application logic
         *
         * @private
         * @static
         * @function _handleZoom
        */
        var _handleZoom = function() {
            this.imageLarge.el = _createZoomBox.call(this);
            this.imageThumb.border = this.imageThumb.el.getStyle('border');
            
            // cursor box
            this.ratio = _computeRatio.call(this);
            this.cursorBox.width = this.config.containerWidth / this.ratio;
            this.cursorBox.height = this.config.containerHeight / this.ratio;
            this.cursorBox.el = _createCursorBox.call(this);
            this.cursorBox.border = this.cursorBox.el.getStyle('border');

            // attach events
            var _overOut = Swell.Core.Element.get([this.imageLarge.el, this.cursorBox.el]);
            this.imageContainer.el.addEvent(Swell.Core.Event.Type.MOUSEOVER, function(e, _overOut) {
                _overOut.show();
                // substracts scroll width & height from left/top offsets
                this.imageThumb.leftScroll = this.imageThumb.offset.left - Swell.Core.getScrollWidth();
                this.imageThumb.topScroll  = this.imageThumb.offset.top - Swell.Core.getScrollHeight();
            }, this, _overOut);
            this.imageContainer.el.addEvent(Swell.Core.Event.Type.MOUSEOUT, _overOut.hide, _overOut);
            this.imageContainer.el.addEvent(Swell.Core.Event.Type.MOUSEMOVE, function(e, args) {
                // prevent the event to bubble up
                e.stopPropagation();
                
                // sets image position
                var _imageLeft = Math.min(Math.max((Math.abs(this.imageThumb.leftScroll - e.clientX) * this.ratio) - args[0], 0), args[2]),
                    _imageTop  = Math.min(Math.max((Math.abs(this.imageThumb.topScroll - e.clientY) * this.ratio) - args[1], 0), args[3]);
                this.imageLarge.el.elements[0].style.backgroundPosition = '-' + _imageLeft + 'px -' + _imageTop + 'px';
                
                // sets cursor box position
                var _cursorLeft = Math.min(Math.max(Math.abs(this.imageThumb.leftScroll - e.clientX) - args[4], 0), args[6]),
                    _cursorTop  = Math.min(Math.max(Math.abs(this.imageThumb.topScroll - e.clientY) - args[5], 0), args[7]);
                this.cursorBox.el.elements[0].style.left = _cursorLeft + 'px';
                this.cursorBox.el.elements[0].style.top  = _cursorTop + 'px';
                
            }, this, [this.config.containerWidth / 2, this.config.containerHeight / 2,
                      this.imageLarge.size.width - this.config.containerWidth - parseInt(this.imageThumb.border.left.width) - parseInt(this.imageThumb.border.right.width),
                      this.imageLarge.size.height - this.config.containerHeight - parseInt(this.imageThumb.border.top.width) - parseInt(this.imageThumb.border.bottom.width),
                      this.cursorBox.width / 2, this.cursorBox.height / 2,
                      this.imageThumb.offset.width - this.cursorBox.width - parseInt(this.cursorBox.border.left.width) - parseInt(this.cursorBox.border.right.width),
                      Math.ceil(this.imageThumb.offset.height - this.cursorBox.height - parseInt(this.cursorBox.border.top.width) - parseInt(this.cursorBox.border.bottom.width))]);
            _overOut = null;
            
        }
    
        return {
            /**
             * @property {Object} cursorBox Cursor box properties
             * @public
            */
            cursorBox : { el : null, width : null, height : null },
            
            /**
             * @property {Object} imageContainer Thumb image container properties
             * @public
            */
            imageContainer : { el : null },
            
            /**
             * @property {Object} imageThumb Thumb image properties
             * @public
            */
            imageThumb : { el : null, offset : null, leftScroll : 0, topScroll : 0, border : null },
            
            /**
             * @property {Object} imageLarge Big image properties
             * @public
            */
            imageLarge : { el : null, size : null },
            
            /**
             * @property {Number} ratio Size ratio between the thumb and the big image
             * @public
            */
            ratio : 0,
            
            /**
             * @property {Object} config Widget settings
             * @public
            */
            config : {
                containerWidth : 150,
                containerHeight : 200,
                zoomBoxLeftMargin : 50,
                captionText : null,
                captionStyle : {
                    backgroundColor : '#000',
                    height : '25px',
                    opacity : 0.5,
                    color : '#fff',
                    textAlign : 'center'
                },
                cursorBoxStyle : {
                    backgroundColor : '#000',
                    opacity : 0.5
                },
                zoomBoxStyle : {},
                /**
                 * @property {Function} onClick Event handler, scope set to thumb Swell Element
                */
                onClick : function(e) { e.stop(); }
            },
            
            /**
             * @constructs
             * @param {Mixed} el Anchor identifier which contains the IMG tag
             * @param {Object} config Widget configuration
            */
            construct : function(el, config) {
                // saves config
                this.config = Swell.Core.mergeObject(this.config, config || {});
                
                this.imageContainer.el = Swell.Core.Element.get(el);
                this.imageLarge.src = this.imageContainer.el.getAttribute('href');
                
                // ensures that the big image is loaded
                 new Swell.Core.Asset().load('img', this.imageLarge.src, function(img) {
                    this.imageLarge.size = { width : img[0].width, height : img[0].height };
                    this.imageThumb.el = this.imageContainer.el.getFirstChild();
                    this.imageThumb.offset = this.imageThumb.el.getOffset();
                    
                    this.imageContainer.el.addEvent(Swell.Core.Event.Type.CLICK, this.config.onClick, this.imageThumb.el)
                    this.imageContainer.el.setStyle({position : 'relative', display : 'block', cursor : 'default', overflow : 'hidden', width : this.imageThumb.offset.width + 'px'});
                    _handleZoom.call(this);
                }, this);
            }
        }
        
    }()
    
});