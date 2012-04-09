/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Position
 * @requires BrowserSupports Element
*/

/**
 * Adds handy position-related methods to Element
 * @class Position
 * @namespace Swell.Core.Position
 * @augments Swell.Core.Element
*/
Swell.Core.Class.mixins(Swell.Core.Element, {
    /**
     * Executes the given function on the hidden element
     *
     * @private
     * @function _checkHiddenElementProperty
     * @param {Function} fn
     * @return {Mixed}
    */
    _checkHiddenElementProperty : function(fn) {
        var _defaultPosition   = this.getStyle('position'),
            _defaultVisibility = this.getStyle('visibility'),
            _property;
            
        // we need to display the element to check its property
        this.setStyle({
            'position'   : 'absolute',
            'visibility' : 'hidden',
            'display'    : ''
        });
        
        _property = fn.call(this);
        
        // and eventually sets the element at its original state
        this.setStyle({
            'position'   : _defaultPosition,
            'visibility' : _defaultVisibility,
            'display'    : 'none'
        });
        
        return _property;
    },
    
    /**
     * Updates the given object and sets width/height values
     *
     * @private
     * @function _computeOffset
     * @param {Object} TRBL offsets
     * @return {Object}
    */
    _computeOffset : function(o) {
        o.width  = Math.abs(o.left - o.right);
        o.height = Math.abs(o.top - o.bottom);
        return o;
    },
    
    /**
     * Returns element left offset
     *
     * @function getX
     * @return {Int}
    */
    getX : function(el) {
        var _fn = function(args) {
            if (this._domEl.offsetWidth === 0) { // IE
                return parseInt(this._domEl.style.left);
            }
            var el = args && args.nodeType ? args : this._domEl;
            // if the given element has a parent node
            if (el.offsetParent) {
                return el.offsetLeft + _fn.call(this, el.offsetParent);
            }
            return !el.offsetLeft && this._domEl.style.left > 0 ? this._domEl.style.left : el.offsetLeft;
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns element top offset
     *
     * @function getY
     * @return {Int}
    */
    getY : function() {
        var _fn = function(args) {
            if (this._domEl.offsetWidth === 0) { // IE
                return parseInt(this._domEl.style.top);
            }
            var _el = args && args.nodeType ? args : this._domEl;
            // if the given element has a parent node
            if (_el.offsetParent) {
                return _el.offsetTop + _fn.call(this, _el.offsetParent);
            }
            return !_el.offsetTop && this._domEl.style.top > 0 ? this._domEl.style.top : _el.offsetTop;
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns element top/left offset
     *
     * @function getXY
     * @return {Int}
    */
    getXY : function() {
        var _fn = function(args) {
            return [ this.getX(), this.getY() ];
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Sets element left offset
     *
     * @function setX
     * @param {Int} pos the value in pixels
     * @param {Boolean} add should we override its current offset or add the value?
    */
    setX : function() {
        var _fn = function(args) {
            var _pos = args[0], _add = args[1] || false;
            if (_add) {
                return this.setStyle({ left : this.getX() + _pos + 'px' });
            }
            return this.setStyle({ left : _pos + 'px' });
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Sets element top offset
     *
     * @function setY
     * @param {Int} pos the value in pixels
     * @param {Boolean} add should we override its current offset or add the value?
    */
    setY : function() {
        var _fn = function(args) {
            var _pos = args[0], _add = args[1] || false;
            if (_add) {
                return this.setStyle({ top : this.getY() + _pos + 'px' });
            }
            return this.setStyle({ top : _pos + 'px' });
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Sets element top offset
     *
     * @function setXY
     * @param {Array} X/Y offsets
     * @param {Boolean} should we override its current offset or add the value?
    */
    setXY : function() {
        var _fn = function(args) {
            var _pos = args[0], _add = args[1] || false;
            this.setX(_pos[0], _add);
            this.setY(_pos[1], _add);
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Returns element width
     *
     * @function getWidth
     * @return {Int}
     * @todo quick lookup at getBoundingClientRect().width
    */
    getWidth : function() {
        var _fn = function() {
            // if the element is an image
            if (this._domEl.tagName === 'IMG') {
                return this._domEl.width;
            }
        
            // if the element is not hidden
            if (this._domEl.style.display !== 'none') {
                return this._domEl.offsetWidth || this._domEl.clientWidth || parseInt(this.getStyle('width'));
            }
            
            return this._checkHiddenElementProperty.call(this, function() {
                return this._domEl.clientWidth || parseInt(this.getStyle('width'));
            });
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns element height
     *
     * @function getHeight
     * @return {Int}
     * @todo quick lookup at getBoundingClientRect().height
    */
    getHeight : function() {
        var _fn = function() {
            // if the element is an image
            if (this._domEl.tagName === 'IMG') {
                return this._domEl.height;
            }
            
            // if the element is not hidden
            if (this._domEl.style.display !== 'none') {
                return this._domEl.offsetHeight || this._domEl.clientHeight || parseInt(this.getStyle('height'));
            }
            
            return this._checkHiddenElementProperty.call(this, function() {
                return this._domEl.clientHeight || parseInt(this.getStyle('height'));
            });
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns element width & height
     *
     * @function getDimensions
     * @return {Array}
    */
    getDimensions : function() {
        var _fn = function() {
            return { width : this.getWidth(), height : this.getHeight() };
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns element area
     *
     * @function getOffset
     * @return {Object}
     * @see https://developer.mozilla.org/En/DOM/Element.getBoundingClientRect
    */
    getOffset : function() {
        var _fn = function() {
            var _offset;
            if (!Swell.Core.Browser.supports.getBoundingClientRect) {
                var _x = this.getX(), _y = this.getY();
                _offset = {
                    top    : _y,
                    right  : Math.abs(_x + this.getWidth()),
                    bottom : Math.abs(_y + this.getHeight()),
                    left   : _x
                };
            } else {
                _offset = this._domEl.getBoundingClientRect();
                var _scrollHeight = Swell.Core.getScrollHeight(),
                    _scrollWidth  = Swell.Core.getScrollWidth();
                // features sniffing
                if (Swell.Core.Browser.isIE && !Swell.Core.Browser.supports.XDomainRequest) {
                    _scrollWidth -= 2;
                    _scrollHeight -= 2;
                }
                // getBoundingClientRect properties are read-only
                _offset = {
                    top : _offset.top + _scrollHeight,
                    right : _offset.right + _scrollWidth,
                    bottom : _offset.bottom + _scrollHeight,
                    left : _offset.left + _scrollWidth
                };
                // extended getBoundingClientRect (FF 3.5)
                if ('width' in _offset) {
                    return _offset;
                }
            }
            return this._computeOffset(_offset);
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Checks if the given element's offsets holds in the current element
     *
     * @function holds
     * @param {Object} TRBL offsets
     * @return {Boolean}
    */
    holds : function() {
        var _fn = function(args) {
            var _currentEl = this.getOffset(), _givenEl = args[0];
            if (_givenEl.top >= _currentEl.top && _givenEl.left >= _currentEl.left &&
                _givenEl.bottom <= _currentEl.bottom && _givenEl.right <= _currentEl.right) {
                return true;
            }
            return false;
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Checks if the given element's offsets collides with the current element
     *
     * @function collides
     * @param {Object} TRBL offsets
     * @return {Boolean}
    */
    collides : function() {
        var _fn = function(args) {
            var _currentEl = this.getOffset(), _givenEl = args[0];
            if ((_currentEl.right < _givenEl.left || _currentEl.left < _givenEl.right) &&
                (_currentEl.bottom < _givenEl.top || _currentEl.top < _givenEl.bottom)) {
                return true;
            }
            return false;
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns area that wraps both elements (in term of position)
     *
     * @function getWrapperArea
     * @param {Object} TRBL offsets
     * @return {Object}
    */
    getWrapperArea : function() {
        var _fn = function(args) {
            var _currentEl = this.getOffset(), _givenEl = args[0];
            return this._computeOffset({
                top    : Math.min(_currentEl.top,    _givenEl.top),
                right  : Math.max(_currentEl.right,  _givenEl.right),
                bottom : Math.max(_currentEl.bottom, _givenEl.bottom),
                left   : Math.min(_currentEl.left,   _givenEl.left)
            });
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Returns area that both elements have in common
     *
     * @function getIntersectArea
     * @param {Object} TRBL offsets
     * @return {Object}
    */
    getIntersectArea : function() {
        var _fn = function(args) {
            var _currentEl = this.getOffset(), _givenEl = args[0],
                _top    = Math.max(_currentEl.top,    _givenEl.top),
                _right  = Math.min(_currentEl.right,  _givenEl.right),
                _bottom = Math.min(_currentEl.bottom, _givenEl.bottom),
                _left   = Math.max(_currentEl.left,   _givenEl.left);
            return _bottom >= _top && _right >= _left ? this._computeOffset({ top : _top, right : _right, bottom : _bottom, left : _left }) : null;
        }
        return this._delegate(_fn, arguments, false);
    },
    
    /**
     * Applies position and size to the current element
     *
     * @function applyBoxModel
     * @param {Object} TRBL offsets
     * @return {Object}
    */
    applyBoxModel : function() {
        var _fn = function(args) {
            var _o = args[0];
            this.setX(_o.left);
            this.setY(_o.top);
            this.setStyle({
                width  : _o.width + 'px',
                height : _o.height + 'px'
            });
            return _o;
        }
        return this._delegate(_fn, arguments);
    },
    
    /**
     * Attach the current element to the given one
     *
     * @function setContext
     * @param {Mixed} reference element
     * @param {String} position (t/r/b/l)
    */
    setContext : function() {
        var _fn = function(args) {
            var _el = Swell.Core.getEl(args[0]), _pos = args[1] || 'b', _elOffset = _css = { position : 'absolute' }, _currentEl = this._domEl, _elWidth = this.getWidth(), _elHeight = this.getHeight(), _pos2 = _pos.charAt(1);

            // gets passed element offset
            this._domEl = _el;
            _elOffset = this.getOffset();
            this._domEl = _currentEl;
            
            // sets position
            switch (_pos.charAt(0)) {
                case 't':
                    _css.left = _elOffset.left + 'px';
                    _css.top  = _elOffset.top - _elHeight + 'px';
                    break;
                case 'r':
                    _css.left = _elOffset.right + 'px';
                    _css.top  = _elOffset.top + 'px';
                    break;
                case 'b':
                    _css.left = _elOffset.left + 'px';
                    _css.top  = _elOffset.bottom + 'px';
                    break;
                case 'l':
                    _css.left = _elOffset.left - _elWidth + 'px';
                    _css.top  = _elOffset.top + 'px';
                    break;
            }
            switch (_pos2) {
                case 't':
                    _css.top  = _elOffset.top + 'px';
                    break;
                case 'r':
                    _css.left = _elOffset.right - _elWidth + 'px';
                    break;
                case 'b':
                    _css.top  = _elOffset.bottom - _elHeight + 'px';
                    break;
                case 'l':
                    _css.left = _elOffset.left + 'px';
                    break;
            }
            this.setStyle(_css);
        }
        return this._delegate(_fn, arguments);
    }
});
