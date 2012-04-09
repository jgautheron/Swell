/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias Ajax
 * @requires BrowserSupports CustomEvent JSON
*/

/**
 * @class Ajax
 * @namespace Swell.Lib.IO
 * @inherits Swell.Core.CustomEventModel
*/
Swell.Core.Class({
    
    name      : 'Ajax',
    namespace : 'Lib.IO',
    inherits  : Swell.Core.CustomEventModel,
    functions : function() {
        /**
         * @private
         * @static
         * @function _getXhrObject
        */
        var _getXhrObject = function() {
            var _xmlHttp = null;
            // Testing if XMLHttpRequest is native (that should be the case for every modern browser)
            if(window.XMLHttpRequest) {
                _xmlHttp = new XMLHttpRequest();
            } else {
                // Wrap variable assignement into a try/catch block so it will prevent
                // javascript errors if the user has disabled ActiveX Controls
                try {
                    // This is IE Browsers < 7 > 5.0
                    _xmlHttp = new ActiveXObject('MSXML2.XMLHTTP.3.0'); // Use the latest and greatest one :D
                } catch (e) {
                    _xmlHttp = null;
                }
            }
            return _xmlHttp;
        };
        
        /**
         * Build header definition before request
         * @private
         * @static
         * @function _processHeaders
        */
        var _processHeaders = function() {
            for(var h in this.headers) {
                this.xhr.setRequestHeader(h, this.headers[h]);
            }
        };
        
        /**
         * Checks form value
         * @private
         * @static
         * @function _checkFormValue
         * @param {String} str
        */
        var _checkFormValue = function(str) {
            return escape(str);
        };
        
        /**
         * Throbber manager
         * @private
         * @static
         * @function _getThrobber
         * @param {String} el
         * @param {String} url
        */
        var _getThrobber = function(el, url) {
            return {
                show : function() {
                    el.style.background = 'transparent url(' + url + ') no-repeat center center';
                },
                hide : function() {
                    el.style.backgroundImage = 'none';
                }
            };
        };
        
        var _setContent = function(el, content) {
            el.innerHTML = content;
        };
        
        /**
         * Sends an X-Requested-With header to tell server that request is an XMLHttp request
         * @property _xRequestedWith
         * @private
         * @static
         * @see http://trac.dojotoolkit.org/ticket/5801
        */
        var _xRequestedWith = {'X-Requested-With' : 'XMLHttpRequest'};
        
        return {
            /**
             * @property serializedForms
             * @description contains every serialized form
            */
            serializedForms : {},
            /**
             * @property fileInput
             * @description any file input serialized?
            */
            fileInput : false,
            /**
             * @property options
             * @description stores options passed to the constructor
            */
            options : {},
            /**
             * @property XJSON
             * @description JSON header name
            */
            XJSON         : 'X-JSON',
            /**
             * @property LOADING
             * @description used internally for checking if readyState is equal to 1 (loading)
            */
            LOADING       : 1,
            /**
             * @property COMPLETED
             * @description used internally for checking if readyState is equal to 4 (completed)
            */
            COMPLETED     : 4,
            /** 
             * @constructs
             * @augments Swell.Core.CustomEventModel
            */
            construct : function() {
                
                // Testing if there are options
                if(arguments[0] && typeof arguments[0] === 'object') {
                    this.options = arguments[0];
                }
                
                var _xhr  = _getXhrObject.call(this);
                // Exit nicely if XHR object detection failed
                if(!_xhr) {
                    return false;
                }
                // Assign a pointer to the current XHR object, this will help us later in the script
                this.xhr = _xhr;
                
                // Maintain a stack of headers to process
                this.headers = {};
                
                // Initialize events
                this.createEvents();
            },
            
            /**
             * Initiates an XML HTTP Request
             * Note : This implementation provides only asynchronous XMLHttpRequests because, 
             *        due to the inherently asynchronous nature of networking, 
             *        there are various ways memory and events can leak when using synchronous requests.
             *
             * @param {Object} o method, url, fn, scope, args, throbber : { url, el }, update
             * @see http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html
            */
            request : function(o) {
                var _method     = o.method.toUpperCase() || 'POST',
                    _url        = o.url   || '',
                    _fn         = o.fn    || Function(),
                    _args       = o.args  || null,
                    _scope      = o.scope || null,
                    _qs         = [], that = this,
                    
                    _throbber,
                    _throbberEnabled = o.throbber && o.throbber.url !== '' && o.throbber.el !== '',
                    _update = o.update ? Swell.Core.getEl(o.update) : false;
                
                if (_throbberEnabled) {
                    _throbber = _getThrobber(Swell.Core.getEl(o.throbber.el), o.throbber.url);
                }
                
                var _processXhr = function(e) {
                    if(that.xhr.readyState === that.LOADING) {
                        that.fireEvent('onProgress');
                    }
                    else if(that.xhr.readyState === that.COMPLETED) {
                        // Detach all subscribers of progress event
                        that.unsubscribe('onProgress');
                        
                        that.status       = (that.xhr.status == 1223) ? 204 : that.xhr.status;
                        that.statusText   = (that.xhr.status == 1223) ? 'No Content' : that.xhr.statusText;
                        
                        // Map properties/methods of the wrapped native
                        that.responseText = that.xhr.responseText;
                        that.responseXML  = that.xhr.responseXML;
                        that.responseJSON = {};
                        
                        // updates the specified element contents if enabled
                        if(_update !== false) {
                            _setContent(_update, that.responseText);
                        }
                        
                        // the server sents a JSON header, try to parse natively the JSON
                        // response
                        if(that.getResponseHeader(that.XJSON)) {
                            var _json = that.responseText;
                            
                            // We have the native object
                            // or it'll fallback to Crockford's json2.js
                            _json = JSON.parse(_json);
                            that.responseJSON = _json;
                        }
                        
                        // hide the ajax loader if enabled
                        if(_throbberEnabled) {
                            _throbber.hide();
                        }
                        
                        // Fire complete event
                        that.fireEvent('onComplete');
                        // Execute callback function with the given scope and args
                        _fn.call(_scope, that, _args);
                        that.xhr = null;
                    }
                }
                
                // Special case for firefox 3.5 >
                if (Swell.Core.Browser.isGecko && Swell.Core.Browser.supports.webWorkers) {
                    this.xhr.onload = this.xhr.onerror = this.xhr.onabort = _processXhr;
                }
                else {
                    this.xhr.onreadystatechange = _processXhr;
                }
                
                // Fire onInitiate event
                this.fireEvent('onInitiate');
                
                // show the ajax loader if enabled
                if(_throbberEnabled) {
                    _throbber.show();
                }
                
                // add serialized forms if any
                var _defaultArgs = _args;
                if (Swell.Core.hasProperties(this.serializedForms)) {
                    if (_args) {
                        _args['serialized'] = JSON.stringify(this.serializedForms);
                    } else {
                        _args = { serialized : JSON.stringify(this.serializedForms) };
                    }
                }
                
                if (this.fileInput !== false) {
                    this.callback = { fn : _fn, scope : _scope, args : _defaultArgs };
                    this.sendFile(_args, _method, _url);
                    return;
                }
                
                // Prepare arguments
                if (Swell.Core.isObject(_args)) {
                    _args = Swell.Core.toQueryString(_args);
                }
                
                if (_method === 'GET') {
                    _args = _url.lastIndexOf('?') === _url.length - 1 ? '&' + _args : '?' + _args;
                    _url += _args;
                } else {
                    this.setHeader('Content-type', 'application/x-www-form-urlencoded');
                    this.setHeader('Content-length', _url.length);
                    this.setHeader('Connection', 'close');
                }
                
                // Open connection
                this.xhr.open(_method, _url, true);
                this.setHeaders(_xRequestedWith);
                
                // Process headers, the function is private as no one should be able to access
                // raw xmlhttp headers
                _processHeaders.call(this);
                
                // Then call...
                this.xhr.send(_method === 'GET' ? null : _args);
            },
            
            sendFile : function(args, method, action) {
                var _hiddenField;
                for (var _arg in args) {
                    _hiddenField = document.createElement('input');
                    _hiddenField.type = 'hidden';
                    _hiddenField.name = _arg;
                    _hiddenField.value = args[_arg];
                    this.fileInput.appendChild(_hiddenField);
                }
                
                var _div = document.createElement('div'), _uniqId = Swell.uniqueId();
                _div.innerHTML = '<iframe id="' + _uniqId + '" name="' + _uniqId + '" src="about:blank" style="width:0;height:0;border:0;"></iframe>';
                document.body.appendChild(_div);
                
                Swell.Core.Event.add(_uniqId, Swell.Core.Event.Type.LOAD, function(e, that) {
                    that.responseText = that.responseXML = this.contentWindow.document.body.innerHTML;
                    that.callback.fn.call(that.callback.scope, that, that.callback.args);
                    that.fireEvent('onComplete');
                    document.body.removeChild(this.parentNode);
                }, null, this);
                
                this.fileInput.method  = method;
                this.fileInput.action  = action;
                this.fileInput.enctype = this.fileInput.encoding = 'multipart/form-data';
                this.fileInput.target  = _uniqId;
                this.fileInput.submit();
            },
            
            getResponseHeader : function(name) {
                var _val = false;
                if(this.xhr && this.xhr.readyState === this.COMPLETED) {
                    if((_val = this.xhr.getResponseHeader(name))) {
                        return _val;
                    }
                }
                return false;
            },

            setHeader : function(name, value) {
                if(!this.xhr) {
                    return false;
                }
                // Header has not yet been attached to XmlHttp Request object
                if(!this.headers.hasOwnProperty(name)) {
                    this.headers[name] = value;
                }
            },
            
            setHeaders : function(o) {
                if(!this.xhr) {
                    return false;
                }
                if(!Swell.Core.isUndefined(o) && Swell.Core.isObject(o)) {
                    for(var prop in o) {
                        this.setHeader(prop, o[prop]);
                    }
                }
            },
            
            serializeForm : function(form) {
                if (Swell.Core.isString(form)) {
                    form = document.forms[form] || Swell.Core.Element.get(form).elements[0];
                }
                
                if (form.tagName !== 'FORM') {
                    throw new Error('The passed element should be a FORM');
                }
                
                var _formName = form.name || form.id || Swell.uniqueId(),
                    _formElements = {}, _inputs = form.getElementsByTagName('INPUT');
                for (var _i = 0, _input; _input = _inputs[_i++];) {
                    switch (_input.type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                            _formElements[_input.name] = _checkFormValue(_input.value);
                            break;
                        case 'file':
                            this.fileInput = form;
                            break;
                        case 'checkbox':
                            var _checkboxValue = _checkFormValue(_input.value);
                            if (_input.checked) {
                                if (_input.name.indexOf('[]') === -1) {
                                    // usual unique checkboxes
                                    _formElements[_input.name] = _checkboxValue;
                                } else {
                                    // checkboxes with several values
                                    _formElements[_input.name] = Swell.Core.isArray(_formElements[_input.name]) ? _formElements[_input.name].concat([_checkboxValue]) : [_checkboxValue];
                                }
                            }
                            break;
                        case 'radio':
                            if (_input.checked) {
                                _formElements[_input.name] = _checkFormValue(_input.value);
                            }
                            break;
                    }
                }
                
                var _textareas = form.getElementsByTagName('TEXTAREA');
                for (var _j = 0, _textarea; _textarea = _textareas[_j++];) {
                    _formElements[_textarea.name] = _checkFormValue(_textarea.value);
                }
                
                var _selects = form.getElementsByTagName('SELECT');
                for (var _n = 0, _select; _select = _selects[_n++];) {
                    if (_select.multiple) {
                        // multiple selects
                        for (var _l = 0, _m = _select.options.length; _l < _m; _l++) {
                            if (_select.options[_l].selected) {
                                var _selectValue = _checkFormValue(_select.options[_l].value);
                                _formElements[_select.name] = Swell.Core.isArray(_formElements[_select.name]) ? _formElements[_select.name].concat([_selectValue]) : [_selectValue];
                            }
                        }
                    } else {
                        // common selects
                        _formElements[_select.name] = _checkFormValue(_select.options[_select.selectedIndex].value);
                    }
                }
                
                // add the serialized form in the main object
                this.serializedForms[_formName] = _formElements;
            },
            
            /**
             * Initialize events of the class
            */
            createEvents : function() {
                this.onInitiate();
                this.onProgress();
                this.onComplete();
            },
            
            /**
             * @event onInitiate
             * @description Fires when XmlHttpRequest is initiated
            */
            onInitiate : function() {
                this.createEvent('onInitiate');
            },
            /**
             * @event onProgress
             * @description Fires when XmlHttpRequest is currently processed
            */
            onProgress : function() {
                this.createEvent('onProgress');
            },
            /**
             * @event onComplete
             * @description Fires when XmlHttpRequest is completed
            */
            onComplete : function() {
                this.createEvent('onComplete');
            }
        };
    }()
});

// Set some shorthands for the class
Swell.alias(Swell.Lib.IO.Ajax, 'Ajax');