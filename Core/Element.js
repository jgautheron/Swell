/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Element
 * @requires Hashtable
 * @crossdep Event ElementEvent
 * @crossdep KeyListener ElementKeyListener
 * @crossdep Asset ElementAsset
*/

/**
 * @class Element
 * @namespace Swell.Core
*/
Swell.Core.Class({
    
    name      : 'Element',
    namespace : 'Core',
    functions : function() {
        
        var _CURRENT_STYLE = 'CURRENT_STYLE',
            _DEFAULT_VIEW = 'DEFAULT_VIEW';
            
        /**
         * Registered className RegExp
         *
         * @private
         * @static
         * @property _registeredExpr
         * @type {Object}
        */
        var _registeredExpr = {};
        
        /**
         * Style exceptions
         *
         * @private
         * @static
         * @property _styleExceptions
         * @type {Object}
        */
        var _styleExceptions = {
            'CURRENT_STYLE' : {
                'float' : 'styleFloat',
                'opacity' : 'filter',
                'border' : null
            },
            'DEFAULT_VIEW' : {
                'float' : 'cssFloat',
                'border' : null,
                'backgroundColor' : null
            }
        };
        
        /**
         * Checks if the given node is not empty (and not linebreaks, spaces, tabs...)
         *
         * @private
         * @static
         * @function _isEmptyNode
         * @param {String} nodeValue
         * @return {Boolean}
        */
        var _isEmptyNode = function(nodeValue) {
            if (/^[\s]+$/.test(nodeValue)) {
                return true;
            }
            return false;
        }
        
        /**
         * Returns the className regex
         *
         * @private
         * @static
         * @function _expr
         * @param {String} className
         * @return {RegExp}
        */
        var _expr = function(className) {
            // if the className RegExp has already been used before...
            if (_registeredExpr[className]) {
                return _registeredExpr[className];
            }
            // keep the result in cache (~40% performance gain once cached)
            var _regExp = new RegExp('\\b' + className + '\\b');
            _registeredExpr[className] = _regExp;
            return _regExp;
        }
        
        /**
         * Checks if the element is a child of the given parent
         *
         * @private
         * @function _isChild
         * @param {HTMLElement} child
         * @param {HTMLElement} parent
         * @param {Boolean} deep recursive iteration
         * @return {Boolean}
        */
        var _isChild = function(parent, deep) {
            // a quicker method, that'll be needed for deep & large checks
            /*if (deep && this._domEl.id) {
                if ('id="' + this._domEl.id + '"'.indexOf(parent.innerHTML) !== -1) {
                    return true;
                }
                return false;
            }*/
            
            // loops through the DOM
            var _children = parent.getElementsByTagName('*'), _i, _l;
            for(_i = 0, _l = _children.length; _i < _l; _i++) {
                if(deep) {
                    // We don't care about parent
                    if(_children[_i] === this._domEl) {
                        return true;
                    }
                } else {
                    if(_children[_i] === this._domEl && _children[_i].parentNode === parent) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        /**
         * Stores passed elements in the private property _el
         * If any element is a string, _get will try to retrieve its HTMLElement
         *
         * @private
         * @static
         * @function _get
         * @param {Mixed} args
         * @return {Mixed}
        */
        var _get = function(_args) {
            if (_args.nodeType) {
                this.elements = [ _args ];
                return;
            }
        
            var _i = _args.length, _els = [], _el;
            while (_i--) {
                _el = Swell.Core.getEl(_args[_i]);
                _els = _el !== null ? _els.concat(_el) : _els;
            }
            this.elements = _els;
        };
        
        return {
            
            /**
             * @constructs
             * @param {Mixed[]} el the element ID to grab, or an array of several IDs
             */
            construct : function() {
                // HTMLelements stack
                this.elements = [];
                
                // current element being processed
                this._domEl = null;
                
                // last method returned values
                this.returnValue = [];
                
                var _args = Swell.Core.isObject(arguments[0][0]) ? arguments[0][0] : [].slice.call(arguments[0], 0);
                _get.call(this, _args);
            },
        
            /**
             * Manages batch processing and normalize return values depending on input type
             * it provides as well a single entry point for lazy function call
             * and retains arguments originally passed to the public API method
             *
             * @protected
             * @function _delegate
             * @param {Function} _fn
             * @param {Mixed} args
             * @param {Boolean} chain
             * @param {Boolean} node
             * @return {Mixed}
            */
            _delegate : function(_fn, args, chain, node) {
                args = args.length > 1 ? [].slice.call(args, 0) : [args[0]];
                chain = typeof chain === 'undefined' ? true : false;
                node = typeof node === 'undefined' ? false : true;
                
                if (!this._domEl) {
                    var _l = this.elements.length, _retval = [];
                    while (_l--) {
                        this._domEl = this.elements[_l];
                        _retval.push(_fn.call(this, args));
                    }
                    this._domEl = null;
                    this.returnValue = _retval.length < 2 ? _retval[0] : _retval;
                    
                    if (node && typeof this.returnValue !== 'undefined' && this.returnValue !== false) {
                        this.returnValue = Swell.Core.Element.get(this.returnValue);
                    }
                    return chain ? this : this.returnValue;
                }
                return _fn.call(this, args);
            },
            
            /**
             * Checks if the given element has the specified classname
             *
             * @function hasClass
             * @param {Mixed[]} className
             * @return {Boolean}
            */
            hasClass : function() {
                var _fn = function(className) {
                    className = className[0];
                    return _expr(className).test(this._domEl.className);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Adds the given classname to the current element
             *
             * @function addClass
             * @param {Mixed[]} className
            */
            addClass : function() {
                var _fn = function(className) {
                    className = className[0];
                    if (Swell.Core.isArray(className)) {
                        var _l = className.length;
                        while (_l--) {
                           _fn.call(this, className[_l]);
                        }
                        return this._domEl.className;
                    }
                    
                    // check if the element doesn't already have the class
                    if (this.hasClass(className)) {
                        return false;
                    }
                    // and finally add the class
                    this._domEl.className = Swell.Core.trim([this._domEl.className, className].join(' '));
                    
                    return this._domEl.className;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Removes element's given classname
             *
             * @function removeClass
             * @param {Mixed[]} className
            */
            removeClass : function() {
                var _fn = function(className) {
                    className = className[0];
                    if (Swell.Core.isArray(className)) {
                        var _l = className.length;
                        while (_l--) {
                           _fn.call(this, className[_l]);
                        }
                        return;
                    }
                    
                    this._domEl.className = this._domEl.className.replace(_expr(className), '');
                    return this._domEl.className;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Toggles element class name
             *
             * @function toggleClass
             * @param {Mixed[]} className
            */
            toggleClass : function() {
                var _fn = function(className) {
                    className = className[0];
                    if (Swell.Core.isArray(className)) {
                        var _l = className.length;
                        while (_l--) {
                            _fn.call(this, className[_l]);
                        }
                        return this._domEl.className;
                    }
                    
                    if (this.hasClass(className)) {
                        this.removeClass(className);
                    } else {
                        this.addClass(className);
                    }
                    return this._domEl.className;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Overrides the element classnames by the given one(s)
             *
             * @function resetClass
             * @param {Mixed[]} className
            */
            resetClass : function() {
                var _fn = function(className) {
                    className = Swell.Core.isArray(className[0]) ? className[0].join(' ') : className[0];
                    this._domEl.className = className;
                    return this._domEl.className;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Returns the value of the given style
             *
             * @function getStyle
             * @param {String} style css property
             * @return {String}
             * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-OverrideAndComputed
             * @see https://developer.mozilla.org/en/Gecko_DOM_Reference/Examples#Example_6.3a_getComputedStyle
             * @todo border-radius
            */
            getStyle : function() {
                arguments[0] = Swell.Core.camelize(arguments[0]);
                var _fn = function(style) {
                    style = style[0];
                    var _method = this._domEl.currentStyle ? { o : this._domEl.currentStyle, type : _CURRENT_STYLE } : { o : document.defaultView.getComputedStyle(this._domEl, null), type : _DEFAULT_VIEW };
                    var _exceptions = new Swell.Core.Hashtable().inject(_styleExceptions[_method.type]);
                    _exceptions.defineGetter(function(key, val, arg) {
                        var _oStyle = arg.o, _isCurrentStyle = (arg.type === _CURRENT_STYLE);
                        switch (key) {
                            case 'opacity':
                                if (_isCurrentStyle) {
                                    return /opacity\s?=\s?([0-9]+)/.exec(_oStyle[val])[1]/100;
                                }
                            case 'border':
                                return {
                                    top : { width : _oStyle['borderTopWidth'] },
                                    right : { width : _oStyle['borderRightWidth'] },
                                    bottom : { width : _oStyle['borderBottomWidth'] },
                                    left : { width : _oStyle['borderLeftWidth'] }
                                };
                            case 'backgroundColor':
                                if (_oStyle[key].indexOf('rgb') !== -1) {
                                    var _rgb = /(\d+),\s*(\d+),\s*(\d+)/.exec(_oStyle[key]);
                                    return Swell.Core.rgbToHex(_rgb[1], _rgb[2], _rgb[3]);
                                }
                            default:
                                return _oStyle[key];
                        }
                    }, _method);
                    // is the given property in the _styleExceptions[method] array?
                    if (_exceptions.exists(style)) {
                        return _exceptions.get(style);
                    }
                    
                    // common cross-browser properties
                    var _style = _method.o[style] || this._domEl.style[style];
                    // IE doesn't convert non-pixels values
                    if (_method.type === _CURRENT_STYLE) {
                        // if the value is already in pixels, we don't need to go any further
                        if (_style.indexOf('px') !== -1) {
                            return _style;
                        }
                        // ensure that we can convert the value
                        if (/^\d+([a-z]{2}|%)$/i.test(_style)) {
                            return Swell.Core.toPixels(this._domEl, _style) + 'px';
                        }
                    }
                    
                    return _style;
                }
                return this._delegate(_fn, arguments, false);
            },
            
            /**
             * Resets the style attribute
             *
             * @function resetStyle
            */
            resetStyle : function() {
                var _fn = function() {
                    this._domEl.style.cssText = '';
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Applies the value of the given style
             *
             * @function setStyle
             * @param {Object} style css properties
             * @todo opacity, proper return values
            */
            setStyle : function() {
                var _fn = function(styles) {
                    var style = {};
                    if (!Swell.Core.isUndefined(styles[1])) {
                        style[styles[0]] = styles[1];
                    } else {
                        style = styles[0];
                    }
                    
                    for (var _property in style) {
                        var _value = style[_property], _property = Swell.Core.camelize(_property);
                        switch (_property) {
                            case 'opacity':
                                if (Browser.isIE) {
                                    _value = 'alpha(opacity=' + style[_property]*100 + ')';
                                    _property = 'filter';
                                } else if (Browser.isGecko) {
                                    _property = 'MozOpacity';
                                } else if (Browser.isWebkit) {
                                    _property = 'WebkitOpacity';
                                } else {
                                    _property = 'opacity';
                                }
                            default:
                                this._domEl.style[_property] = _value;
                        }
                    }
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Sets the given element attribute
             *
             * @function setAttribute
             * @param {Object} o attributes associative object (attribute : value)
            */
            setAttribute : function() {
                var _fn = function(o) {
                    o = o[0];
                    if (!Swell.Core.isObject(o)) {
                        return;
                    }
                    for (var _n in o) {
                        if (this._domEl.attributes[_n]) {
                            this._domEl.attributes[_n].value = o[_n];
                        } else {
                            // we won't allow nasty things such as cssText or appending a class
                            // they've got setStyle/addClass especially for that
                            this._domEl.setAttribute(_n, o[_n]);
                        }
                    }
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Returns the given element attribute value
             *
             * @function getAttribute
             * @param {String} attr attribute name
             * @return {Mixed}
            */
            getAttribute : function() {
                var _fn = function(attr) {
                    if (this._domEl.nodeType !== 1) {
                        return false;
                    }
                    return this._domEl.getAttribute(attr[0]);
                }
                return this._delegate(_fn, arguments, false);
            },
            
            /**
             * Removes the given attribute
             *
             * @function removeAttribute
             * @param {String} attr attribute name
             * @return {Mixed}
            */
            removeAttribute : function() {
                var _fn = function(attr) {
                    var attr = attr[0], _node = this._domEl.attributes;
                    if (_node[attr]) {
                        return this._domEl.removeAttribute(attr);
                    }
                    return false;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Clones the current node
             *
             * @function clone
             * @param {Boolean} deep
             * @return {Object} Swell Element
            */
            clone : function() {
                var _fn = function(attr) {
                    var deep = attr[0] || true;
                    return this._domEl.cloneNode(deep);
                }
                return this._delegate(_fn, arguments, false, true);
            },
                   
            /**
             * Returns children nodes of the given element
             *
             * @function getChildren
             * @param {Boolean} elementNodes return only element nodes
             * @return {Array} HTMLElements
            */
            getChildren : function() {
                var _fn = function(elementNodes) {
                    elementNodes = elementNodes[0] || false;
                    
                    // DOM3 element traversal
                    if (elementNodes && this._domEl.children) {
                        return this._domEl.children;
                    }
                
                    // if the element hasn't at least one child
                    if (this._domEl.childNodes.length < 1) {
                        return;
                    }
                    
                    var _elementsClosure = function(node) {
                        if (!elementNodes || node.nodeType === 1) {
                            return true;
                        }
                        return false;
                    },  _childNodes = [], node, _i = this._domEl.childNodes.length;
                    while (_i--) {
                        node = this._domEl.childNodes[_i];
                        if (!_isEmptyNode(node.nodeValue) && _elementsClosure(node)) {
                            _childNodes.push(node);
                        }
                    }
                    
                    return _childNodes;
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns element's parentNode
             *
             * @function getParentNode
             * @return {Object} Swell Element
            */
            getParentNode : function() {
                var _fn = function() {
                    return this._domEl.parentNode;
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns element's parentNode
             *
             * @function getParentBy
             * @return {Object} Swell Element
            */
            getParentBy : function() {
                var _fn = function(args) {
                    var _fn = args[0], _top = Swell.Core.getEl(args[1] || document.body), _el = this._domEl;
                    while (_node = _el.parentNode) {
                        if (_node === _top) {
                            return false;
                        }
                        if (_fn(_node)) {
                            return _node;
                        }
                        _el = _node;
                    }
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns element's firstChild
             *
             * @function getFirstChild
             * @return {Object} Swell Element
            */
            getFirstChild : function() {
                var _fn = function() {
                    // DOM3 element traversal
                    if (this._domEl.firstElementChild) {
                        return this._domEl.firstElementChild;
                    }
                    
                    for (var _i = 0, _child; _child = this._domEl.childNodes[_i++];) {
                        if (_child.nodeType === 1) {
                            return _child;
                        }
                    }
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns element's lastChild
             *
             * @function getLastChild
             * @return {Object} Swell Element
            */
            getLastChild : function() {
                var _fn = function() {
                    // DOM3 element traversal
                    if (this._domEl.lastElementChild) {
                        return this._domEl.lastElementChild;
                    }
                    
                    var _i = this._domEl.childNodes.length;
                    while (_i--) {
                        if (this._domEl.childNodes[_i].nodeType === 1) {
                            return this._domEl.childNodes[_i];
                        }
                    }
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns element's previous sibling
             *
             * @function getPreviousSibling
             * @return {Object} Swell Element
            */
            getPreviousSibling : function() {
                var _fn = function() {
                    // DOM3 element traversal
                    if (this._domEl.previousElementSibling) {
                        return this._domEl.previousElementSibling;
                    }
                    
                    var _elSibling = this._domEl;
                    while (_elSibling.nodeType !== 1) {
                        _elSibling = _elSibling.previousSibling;
                    }
                    return _elSibling.previousSibling;
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns element's next sibling
             *
             * @function getNextSibling
             * @return {Object} Swell Element
            */
            getNextSibling : function() {
                var _fn = function() {
                    // DOM3 element traversal
                    if (this._domEl.nextElementSibling) {
                        return this._domEl.nextElementSibling;
                    }
                    
                    var _elSibling = this._domEl;
                    while (_elSibling.nodeType !== 1) {
                        _elSibling = _elSibling.nextSibling;
                    }
                    return _elSibling.nextSibling;
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Returns elements containing the given class name
             * (will probably disappear once Marlin done)
             *
             * @function getByClassName
             * @param {String} className
             * @param {String} tagName
             * @return {HTMLElement}
            */
            getByClassName : function() {
                var _fn = function(args) {
                    var _result, _root = this._domEl, _className = args[0], _tagName = args[1];
                        
                    // for native implementations
                    if (document.getElementsByClassName) {
                        return _root.getElementsByClassName(_className);
                    }
                    
                    // at least try with querySelector (IE8 standards mode)
                    // about 5x quicker than below
                    if (Swell.Core.Browser.supports.querySelector) {
                        _tagName = _tagName || '';
                        return _root.querySelectorAll(_tagName + '.' + _className);
                    }
                    
                    // and for others... IE7-, IE8 (quirks mode), Firefox 2-, Safari 3.1-, Opera 9-
                    var _tagName = _tagName || '*', _tags = _root.getElementsByTagName(_tagName), _nodeList = [];
                    for (var i = 0, _tag; _tag = _tags[i++];) {
                        if (_expr(_className).test(_tag.className)) {
                            _nodeList.push(_tag);
                        }
                    }
                    return _nodeList;
                }
                return this._delegate(_fn, arguments, false, true);
            },
            
            /**
             * Checks if the element is a child of the given parent
             *
             * @function isChild
             * @param {String|HTMLElement} parent
             * @param {Boolean} deep recursive iteration, defaults to false
             * @return {Boolean}
            */
            isChild : function() {
                var _fn = function(args) {
                    var parent = Swell.Core.getEl(args[0]), deep = args[1] || false;
                    if (!parent.hasChildNodes()) {
                        return false;
                    }
                    return _isChild.call(this, parent, deep);
                }
                return this._delegate(_fn, arguments, true);
            },

            /**
             * Sets/Gets element inner HTML
             *
             * @function html
             * @param {String} html
             * @return {String|Swell.Core.Element}
            */
            html : function() {
                var _fn = function(args) {
                    if(!!args[0]) { 
                        this._domEl.innerHTML = args[0];
                    }
                    return this._domEl.innerHTML;
                }
                return this._delegate(_fn, arguments, !!arguments[0] ? true : null);
            },
            
            /**
             * Sets/Gets element inner text
             *
             * @function text
             * @param {String} text
             * @return {String|Swell.Core.Element}
            */
            text : function() {
                var _fn = function(args) {
                    if(!!args[0]) { 
                        if(!!this._domEl.innerText) {
                            this._domEl.innerText = args[0];
                        } else {
                            this._domEl.textContent = args[0];
                        }
                    }
                    return this._domEl.innerText || this._domEl.textContent;
                }
                return this._delegate(_fn, arguments, !!arguments[0] ? true : null);
            },
            
            /**
             * Prepends an element or plain HTML markup
             *
             * @function prepend
             * @param {Mixed} el
             * @return {Boolean}
            */
            prepend : function() {
                var _fn = function(args) {
                    if (Swell.Core.getEl(args[0]) !== null) {
                        return this.prependChild(args[0]);
                    }
                    return this.prependHTML(args[0]);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Appends an element or plain HTML markup
             *
             * @function prepend
             * @param {Mixed} el
             * @return {Boolean}
            */
            append : function() {
                var _fn = function(args) {
                    if (Swell.Core.getEl(args[0]) !== null) {
                        return this.appendChild(args[0]);
                    }
                    return this.appendHTML(args[0]);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Prepends HTML
             *
             * @function prependHTML
             * @param {String} html
             * @return {Boolean}
            */
            prependHTML : function() {
                var _fn = function(args) {
                    return this._domEl.innerHTML = args[0] + this._domEl.innerHTML;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Appends HTML
             *
             * @function appendHTML
             * @param {String} html
             * @return {Boolean}
            */
            appendHTML : function() {
                var _fn = function(args) {
                    return this._domEl.innerHTML = this._domEl.innerHTML + args[0];
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Append the current element
             *
             * @function appendTo
             * @param {Mixed} parent
             * @return {HTMLElement} appended element
            */
            appendTo : function() {
                var _fn = function(args) {
                    var parent = Swell.Core.getEl(args[0]);
                    return parent.appendChild(this._domEl);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Prepend the passed element to the current element
             *
             * @function prependChild
             * @param {Mixed} child
             * @return {HTMLElement} prepended element
            */
            prependChild : function() {
                var _fn = function(args) {
                    var child = Swell.Core.getEl(args[0]);
                    return this._domEl.insertBefore(child, this._domEl.firstChild);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Append the passed element to the current element
             *
             * @function appendChild
             * @param {Mixed} child
             * @return {HTMLElement} appended element
            */
            appendChild : function() {
                var _fn = function(args) {
                    var child = Swell.Core.getEl(args[0]);
                    return this._domEl.appendChild(child);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Replaces two childs
             *
             * @function replaceChild
             * @param {Mixed} new child
             * @param {Mixed} child element to replace
             * @return {HTMLElement} replaced element
            */
            replaceChild : function() {
                var _fn = function(args) {
                    var newChild = Swell.Core.getEl(args[0]),
                        oldChild = Swell.Core.getEl(args[1]);
                    return this._domEl.replaceChild(newChild, oldChild);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Insert the current element before the given one
             *
             * @function insertBefore
             * @param {String|HTMLElement} sibling
             * @return {HTMLElement} inserted element
            */
            insertBefore : function() {
                var _fn = function(args) {
                    var sibling = Swell.Core.getEl(args[0]);
                    return sibling.parentNode.insertBefore(this._domEl, sibling);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Insert the current element after the given one
             *
             * @function insertAfter
             * @param {String|HTMLElement} sibling
             * @return {HTMLElement} inserted element
            */
            insertAfter : function() {
                var _fn = function(args) {
                    var sibling = Swell.Core.getEl(args[0]);
                    return sibling.parentNode.insertBefore(this._domEl, sibling.nextSibling);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Removes every child node
             *
             * @function empty
            */
            empty : function() {
                var _fn = function() {
                    // avoid pseudo-leaks in IE
                    if (Swell.Core.Browser.isIE) {
                        this._domEl.innerHTML = '';
                        return this._domEl;
                    }
                    
                    while (this._domEl.firstChild) {
                        this._domEl.removeChild(this._domEl.firstChild);
                    }
                    return this._domEl;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Shows the current element
             *
             * @function show
            */
            show : function() {
                var _fn = function() {
                    return this.setStyle({'display' : 'block'});
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Hides the current element
             *
             * @function hide
            */
            hide : function() {
                var _fn = function() {
                    return this.setStyle({'display' : 'none'});
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Removes the current element from the DOM
             *
             * @function remove
             * @return {HTMLElement} removed element
            */
            remove : function() {
                var _fn = function() {
                    return this._domEl.parentNode.removeChild(this._domEl);
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Filters elements stack
             *
             * @function filter
             * @param {Function} fn
             * @return {Array} HTMLElements
            */
            filter : function(fn) {
                if (!Swell.Core.isFunction(fn)) {
                    return;
                }
            
                var _stack = [];
                for (var _i = 0, el; el = this.elements[_i++];) {
                    _stack = fn.call(this, el) ? _stack.concat([el]) : _stack;
                }
                this.elements = this.returnValue = _stack;
                return this;
            },
            
            /**
             * Iterates over elements stack
             *
             * @function each
             * @param {Function} the function to apply to the elements stack; the first arguments corresponds to a swell element while the second is a dom element
            */
            each : function(fn) {
                if (!Swell.Core.isFunction(fn)) {
                    return;
                }
                for (var _i = 0, el, sel; el = this.elements[_i++];) {
                    sel = Swell.Core.Element.get(el);
                    fn.call(this, sel, el);
                }
                return this;
            },
            
            /**
             * Iterates over elements stack
             * Alias of the each method
             *
             * @function map
             * @param {Function} the function to apply to the elements stack; the first arguments corresponds to a swell element while the second is a dom element
            */
            map : function(fn) {
                this.each(fn);
            },
            
            /**
             * Send the requested form through XHR
             *
             * @function xhr
             * @param {Function} callback onComplete callback
             * @param {String} method overrides default form method
             * @param {String} action overrides default form action
             * @param {Boolean} merge merge forms and concatenate form fields to produce a single querystring
             * @return {Object} Swell.Lib.IO.Ajax instance
            */
            xhr : function(callback, method, action, merge) {
                // merge forms data instead of throwing a request per form
                if (this.elements.length > 1 && method && action !== null && merge) {
                    var xhr = new Swell.Lib.IO.Ajax(), _i = this.elements.length, callback = callback || null;
                    while (_i--) {
                        if (this.elements[_i].tagName !== 'FORM') {
                            continue;
                        }
                        xhr.serializeForm(this.elements[_i]);
                    }
                    xhr.request({method : method, url : action, fn : callback});
                    return xhr;
                }
                
                // common behavior
                var _fn = function(args) {
                    if (this._domEl.tagName !== 'FORM') {
                        return false;
                    }
                    var _callback = args[0] || null,
                        _method   = args[1] || this._domEl.method || null,
                        _action   = args[2] || this._domEl.action || null;

                    var xhr = new Swell.Lib.IO.Ajax();
                    xhr.serializeForm(this._domEl.id);
                    xhr.request({method : _method, url : _action, fn : _callback});
                    return xhr;
                }
                return this._delegate(_fn, arguments);
            },
            
            /**
             * Gets the current DOM element being processed or null if the element cannot be reached
             *
             * @function current
             * @return {HTMLElement|NULL}
            */
            current : function() {
                return this._domEl || this.elements[0] || null;
            }
        
        }
    }()
    
});

/**
 * @class Builder
 * @namespace Swell.Core.Element
*/
Swell.Core.Element.Builder = {
    /**
     * Creates the given tag
     *
     * @function makeTag
     * @param {String} tag
     * @return {Void}
    */
    makeTag : function(tag) {
        var flattenArray = function(haystack) {
            var _results = [];
            for (var _i = 0, len = haystack.length; _i < len; _i++) {
                if (Swell.Core.isArray(haystack[_i]))  {
                    _results = _results.concat(flattenArray(haystack[_i]));
                } else {
                    _results.push(haystack[_i]);
                }
            }
            return _results;
        }
        
        return function() {
            var _attrs, _children;
            if (arguments.length > 0) {
                if (Swell.Core.isObject(arguments[0])) {
                    _attrs = arguments[0];
                    _children = [].slice.call(arguments, 1);
                } else {
                    _children = arguments;
                }
                _children = flattenArray(_children);
            }
            return Swell.Core.Element.Builder.create(tag, _attrs, _children);
        };
    },
    
    /**
     * IE Workaround for creating form elements dynamically
     *
     * @function createFormElement
     * @param {String} tag
     * @param {Object} attrs
     * @return {HTMLElement}
     * @see http://www.thunderguy.com/semicolon/2005/05/23/setting-the-name-attribute-in-internet-explorer/
    */
    createFormElement : function(tag, attrs) {
        // Try the IE way; this fails on standards-compliant browsers
        var _element = null, _attributes = [];
        for (var attr in attrs) {
           _attributes.push(attr + '="' + attrs[attr] + '"');
        }
        _element = document.createElement('<' + tag + ' ' + _attributes.join(' ') + '>');
        return _element;
    },
    
    /**
     * Builds the tag by attaching events/classNames/styles/attributes
     *
     * @function create
     * @param {String} tag
     * @param {Object} attrs
     * @param {Object} children
     * @return {Object} Swell Element
    */
    create : function(tag, attrs, children) {
        var attrs = attrs || {}, children = children || [], tag = tag.toLowerCase(),
            _isIEFormElement = false;
        
        // If element has a type attribute, defer creation to the createFormElement method
        if (Swell.Core.Browser.isIE) {
            if ((tag === 'input' || tag === 'button') && attrs.hasOwnProperty('type')) {
                _isIEFormElement = true;
                var el = this.createFormElement(tag, attrs); 
            }
        }
        
        if (attrs.namespace && !_isIEFormElement) {
            var el = document.createElement(tag + ':' + attrs.namespace);
            delete attrs.namespace;
        } else {
            if (!_isIEFormElement) {
                var el = document.createElement(tag);
            }
        }
        
        // summon a Swell Element
        el = Swell.Core.Element.get(el);
        
        // set inline style
        if (attrs.style) {
            el.setStyle(attrs.style);
            delete attrs.style;
        }
        
        // add css class names
        if (attrs.className && Swell.Core.isString(attrs.className)) {
            el.addClass(attrs.className);
            delete attrs.className;
        }
        if (attrs.cls && Swell.Core.isString(attrs.cls)) {
            el.addClass(attrs.cls);
            delete attrs.cls;
        }
        
        // attach events
        if (Swell.Core.Event && attrs.events) {
            for (var ev in attrs.events) {
                var _args = null, _scope = null;
                
                if(attrs.events[ev].hasOwnProperty('args')) {
                    _args = attrs.events[ev]['args'];
                }
                if(attrs.events[ev].hasOwnProperty('scope')) {
                    _scope = attrs.events[ev]['scope'];
                }

                el.addEvent(ev, attrs.events[ev].fn, _scope, _args);
                delete attrs.events[ev];
            }
            delete attrs.events;
        }
        
        // add attributes
        if (attrs.custom) {
            for (var attr in attrs.custom) {
                el.setAttribute(attr, attrs.custom[attr]);
                delete attrs.custom[attr];
            }
        }
        if (!_isIEFormElement) {
            if (attrs.hasOwnProperty('innerHTML')) {
                el.html(attrs['innerHTML']);
                delete attrs['innerHTML'];
            }
            el.setAttribute(attrs);
        }
        // append children
        for (var _i = 0; _i < children.length; _i++) {
            if (children[_i] === null) {
                continue;
            }
            if (Swell.Core.isString(children[_i])) {
                children[_i] = document.createTextNode(children[_i]);
            }
            el.appendChild(children[_i]);
        }
        
        return el;
    },
    
    /**
     * Checks if the given tag is valid and eventually returns a Swell Element
     *
     * @function apply
     * @param {Object} tag
     * @return {Object} Swell Element
    */
    load : function(o) {
        o = o || {};
        var _els = ['p','div','span','strong','em','img','table','tr','td','th','thead','tbody','tfoot','pre','code',
                   'h1','h2','h3','h4','h5','h6','ul','ol','li','form','input','textarea','legend','fieldset', 
                   'select','option','blockquote','cite','br','hr','dd','dl','dt','address','a','button','abbr','acronym',
                   'script','link','style','bdo','ins','del','object','param', 'embed','col','colgroup','optgroup','caption',
                   'label','dfn','kbd','samp','var','vml'], _el, _i = 0;

        while (_el = _els[_i++]) {
            o[_el] = Swell.Core.Element.Builder.makeTag(_el);
        }
        
        return o;
    }
    
};

Swell.Core.Element.get = function(){
    return new Swell.Core.Element(arguments);
};

// Set some shorthands for the class
Swell.alias(Swell.Core.Element, 'Element');
// Alias $ on Element.get that will reduce the gap between prototype/mootools and swell users
Swell.alias(Swell.Core.Element.get, '$');
Swell.alias(Swell.Core.Element.Builder.load(), 'html');

