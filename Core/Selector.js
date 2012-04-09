/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Selector
*/

/**
 * Enables cross-browser CSS3 selection
 * @class Marlin
 * @static
*/
var Marlin = Marlin || {};
Marlin = (function(expr) {
    /**
     * Cache DOM Nodes by type (only occurs when we traverse the DOM
     * This is dope as we can associate the query as a key in the cache
     * @private
     * @static
    */
    var _cache = {};
    /**
     * @private holds the tokenized queries
     * @static
    */
    var _query = [];
    /**
     * Does the browser support the native querySelector implementation?
     * Used so far only for IE8
     * @private
     * @static
    */
    var _native = !!document.querySelectorAll || false;
    /**
     * Tokenizer that powers Marlin
     * Splits CSS query into tokens that will speed up the parsing process
     * @private
     * @static
    */
    var _tokenizer   = /(?:(?:(?:\s|^|.))([^\: \[\(>+\|]+)?(\:(?:(?:[a-z\-\:]+))(?:\((?:\([^()]+?\)|[^()]+?)+\)+?)?)?)((?:\[([a-z\-\_\|]+?)(?:([$|*\^~]?[=])(?:['"]?([^\[\]'"]+?)['"]?)?)?\]))?(?:([>+|,]))?/gi; 
    /**
     * Regular expression that match if the query is CSS3-specific
     * Used so far only for IE8
     * @private
     * @static
    */
    var _css3Tokens = /(?:\:(?:root|nth-|last-child|of-type|only-child|target|enabled|disabled|checked|indeterminate|contains|selection|not|empty)|\s~\s|[\^$*]=|\|(?!\=))/i;
    
    var _lastContext    = null;
    var _currentContext = null;
    var _nodes          = null;
    
    var _getElementsByClassName = function(cls, root) {
        var _els = [], root = root || document;

        if(document.getElementsByClassName) {
            cls = cls.substr(1).replace(/\./g,' ');
            return root.getElementsByClassName(cls);
        }
    
        // at least try with querySelector (IE8 standards mode)
        // about 5x quicker than below
        if (root.querySelectorAll) {
            _tagName = _tagName || '';
            _els = root.querySelectorAll(_tagName + '.' + cls);
            return _els;
        }
        
        // and for others... IE7-, IE8 (quirks mode), Firefox 2-, Safari 3.1-, Opera 9-
        var _tagName = _tagName || '*', _tags = root.getElementsByTagName(_tagName), _expr = new RegExp('\\b' + cls + '\\b'), cls = cls.substr(1).replace(/\./g,' ');
        for (var i = 0, _tag; _tag = _tags[i++];) {
            if (_expr.test(_tag.className)) {
                _els.push(_tag);
            }
        }
        return _els;
    }
    
    var _processInstruction = function(context, lastcontext, expression) {
        context = context || document;
        switch(expression.element.charAt(0)) {
            case '.':
                // Retrieve elements by classname
                 _currentContext = _getElementsByClassName(expression.element, _lastContext);
                break;
            case '#':
                _currentContext = document.getElementById(expression.element.substr(1));
                //@todo handle classNames
                break;
            default:
                // expect a tag
               _currentContext = (_lastContext) ? _lastContext[0].getElementsByTagName(expression.element) : context.getElementsByTagName(expression.element);
        }
        _lastContext = _currentContext;
        return _currentContext;
    }
    
    var _process = function() {
        
        // Check if there's at least one query to execute
        if(typeof _query[0] !== 'object') {
            return;
        }
        for(var i=0, query; query = _query[i++];) {
            _nodes = _processInstruction(_currentContext, _lastContext, query);
        }
        return _nodes;
    }
    
    return {
        
        /**
         * @function find Process a CSS query
         * .foo ul[label~="Soft FR"] div::first-child span.bar:insensitive(:not(:contains("bad"))) + div * span
         * @public
        */
        find : function(cmd) {
            _currentContext = _lastContext = null;
            
            if(_native) {
                // Detect chunks that will fail to run on IE -> CSS 2.1 selectors only
                if(!_css3Tokens.test(cmd)) {
                    return document.querySelectorAll(cmd);
                }
            }
            // Reset _query
            _query = [];
            while(_expr = _tokenizer.exec(cmd)) {
                _query.push({
                    'rawquery' : _expr[0],                  //Raw CSS query
                    'element'  : _expr[1],                  //Contains the element to search for (including dot or sharp symbol) e.g.: .foo #bar or span
                    'pseudo'   : _expr[2] || null,          //Pseudo elements or pseudo classes e.g.: :first-child :link :visited or either functions like contains
                    'attr'     : (_expr[3]) ? {
                        'raw'       : _expr[3] || null,     //Raw Attribute selector e.g.: [att=val] [att~=val] and so on and so forth :D
                        'name'      : _expr[4] || null,     //Attribute name
                        'operator'  : _expr[5] || null,     //Attribute operator e.g.: ~= |= *=
                        'value'     : _expr[6] || null      //Value to match
                    } : null, 
                    'selector' : _expr[7] || null           //Child or adjacent sibling selector
                });
            }
            return _process();
        }
    }

})();

// Completely substitutes Marlin with native browser implementation when available
if(document.querySelectorAll && !XDomainRequest) {
    Marlin.find = document.body.querySelectorAll;
}
