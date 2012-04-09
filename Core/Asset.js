/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 * 
 * @alias Asset
 * @requires CustomEvent Hashtable
 * @crossdep Element ElementAsset
*/

/**
 * The Asset flyweight provides asset management utilities
 * @class Asset
 * @namespace Swell.Core
*/
Swell.Core.Class({
    name      : 'Asset',
    namespace : 'Core',
    functions : function() {
    
        var _validTags    = ['script','css','img', 'jsonp'];
        /**
         * Attach the asset to the DOM and fires a custom event
         * when this one has finished to load
         *
         * @function _loadResource
         * @param {HTMLScriptElement|HTMLLinkElement} res Asset being loaded
         * @param {String} src uri of the asset
         * @param {String} type type of the asset script/css/img
         * @private
        */
        var _loadResource = function(res, src, type) {
            
            var _head       = document.getElementsByTagName('head')[0],
                _csLoaded   = this.onResourceLoaded,
                _assetStack = this._assetStack;
            
            if(type !== 'img') {
                _head.appendChild(res);
            }
            
            if(Swell.Core.Browser.isIE && type === 'script') {
                res.src = src;
                res.onreadystatechange = function() {
                    if(this.readyState === 'loaded' || this.readyState === 'complete') {
                        _assetStack.push(this);
                        _csLoaded.fire();
                    } else {
                        _csLoaded.fire();
                    }
                }
            } else {
                // We'll load the contents asynchronously in other browsers
                // Safari 1.2, Konqueror, or iCab will ignore the statement below
                // Apply event just for images and scripts
                if(type === 'script' || type === 'img') {
                    // Assign source
                    if(!res.complete) {
                        res.onload = function() {
                            _assetStack.push(this);
                            _csLoaded.fire();
                        }
                        res.onerror = function() {
                            _assetStack.push(this);
                            _csLoaded.fire();
                        }
                        res.src = src;
                    } else {
                        if(!Swell.Core.Browser.isIE) {
                            res.onload = function() {
                                _assetStack.push(this);
                                _csLoaded.fire();
                            }
                        } else {
                            _assetStack.push(res);
                            _csLoaded.fire();
                        }
                        res.src = src;
                    }
                    
                } else if(type === 'css') {
                    // As stylesheets doesn't have load events, just skip this part
                    _assetStack.push(res);
                    _csLoaded.fire();
                }
            }
            return false;
        };
        
        /**
         * Initialize a resource depending on the type
         * Creates a script element/css stylesheet or image placeholder
         * and assign a unique id based on asset location and type
         *
         * @function _initResource
         * @param {String} type type of the asset script/css/img
         * @param {String} src uri of the asset
         * @private
        */
        var _initResource = function(type, src) {
            var _asset;
            switch(type) {
                case 'script':
                    _asset = document.createElement('script');
                    // Setting content type
                    _asset.type = 'text/javascript';
                    // Assign a unique id
                    _asset.id = Swell.encrypt(type + '-' + src);
                    // Init item in the hashtable
                    this._loadedResources.put(_asset.id, _asset);
                    // Load the resource
                    _loadResource.call(this, _asset, src, type);
                    break;
                // Lazy load CSS
                case 'css':
                    _asset = document.createElement('link');
                    // Setting content type
                    _asset.type = 'text/css';
                    // Setting rel
                    _asset.rel = 'stylesheet';
                    // Setting source
                    _asset.href = src;
                    // Assign a unique id
                    _asset.id = Swell.encrypt(type + '-' + src);
                    // Init item in the hashtable
                    this._loadedResources.put(_asset.id, _asset);
                    // Load the resource
                    _loadResource.call(this, _asset, src, type);
                    break;
                // Lazy load image
                case 'img':
                    // Create image in memory
                    _asset = new Image();
                    // And load!
                    _loadResource.call(this, _asset, src, type);
                    break;
            }
        };
        
        return {

            // Define tags allowed to lazy load
            _loadedResources  : new Swell.Core.Hashtable(),
            _queue            : [],
            _current          : null,
            _callBack         : null,
            _assetStack       : [],
            _queueIndex       : 0,
            _type             : null,
            _scope            : null,
            _pendingCall      : false,

            /**
             * Lazy load a CSS, SCRIPT or IMAGE resource
             *
             * @function load
             * @param {String} type type of the asset script/css/img
             * @param {String[]} o url of resource
             * @param {Function} [fn] callback function to execute when all resources are done loaded (optional)
             * @param {Object} [scope] the obj passed in becomes the execution scope of the callback (optional)
             * @public
            */
            load : function(type, o, fn, scope) {

                var _script = null, _i, _l;
                
                this._assetStack = [];           // Reset asset stack
                this._queue = [];                // Reset queue
                this._queueIndex = 0;            // Reset queue index
                this._type = type;               // Reset current type
                this._scope =  scope  || this;     // Current scope of the callback function

                // Fires on Start event, so every subscriber will be notified of loading
                this.onStart.fire();
                
                this.onResourceLoaded.subscribe(function() {
                    var _i, _n;
                    if(this._queue.length === this._assetStack.length) {
                        // Stacks have the same size, queue integrity is respected
                        // Attach resources to the DOM
                        if(this._callBack) {
                            var _param = (this._type !== 'img') ? this._loadedResources : this._assetStack;
                            this._callBack.call(this._scope, _param);
                        }
                        //this.cleanup();
                    } else {
                        // Increment queueIndex
                        this._queueIndex++;
                        // If something went wrong, unload all previously loaded resources
                        if(this._assetStack.length < this._queue.length && this._queueIndex === this._queue.length) {
                            // Unexpected error happened
                            // Detach assets
                            for(var _n = 0, _l = this._assetStack.length; _n < _l; _n++) {
                                this.detach(this._type, this._assetStack[_n].src);
                            }
                            //this.cleanup();
                        }
                    }
     
                }, this);
                
                // Exit nicely when resource type is not supported
                if(!Swell.Core.inArray(type, _validTags)) {
                    return; // Cannot handle this type of resource
                }

                // Register callback
                if(Swell.Core.isFunction(fn)) {
                    this._callBack = fn;
                }
                // Check if o is an array
                if(Swell.Core.isArray(o)) {
                    this._queue = o;
                } else {
                    this._queue.push(o);
                }
                
                if(type !== 'jsonp') {
                    // Start processing the queue
                    for(var _i = 0, _l = this._queue.length; _i < _l; _i++) {
                        // Check if script is not already loaded
                        if(!this.isLoaded(type, this._queue[_i]) || type === 'img') {
                            _initResource.call(this, type, this._queue[_i]);
                        }
                    }
                } else {
                    // Handle JSONP differently
                    var _iframeElement = document.createElement('iframe');
                    // iframe will remain invisible
                    _iframeElement.style.display = 'none';
                    _iframeElement.src = 'javascript:false';
                    
                    // Append iframe to the dom
                    document.body.appendChild(_iframeElement);

                    var _iframeWindow =  _iframeElement.contentWindow;
                    
                    // And start the manipulation
                    if(Swell.Core.Browser.isIE) {
                        var _iframeContent = _iframeElement.contentWindow.document;
                    } else {
                        // Standards way baby
                        var _iframeContent = _iframeElement.contentDocument;
                    }
                    // at first open document to gain write access
                    _iframeContent.open();
                    // Create variables that will hold JSONP variables
                    var _script = [];
                        _script.push('<html><head><title>moo</title>');
                        _script.push('<scr' + 'ipt type="text/javascript">');
                        _script.push('var _JSONP_Stack = [];');
                        _script.push('var _JSONP_Callback = function(json) { _JSONP_Stack.push(json); }');
                        _script.push('<\/scr' + 'ipt>');
 
                    for(var _i = 0, _l = this._queue.length; _i < _l; _i++) {
                        if(/(callback|jsonp)=([^&]+)?/.test(this._queue[_i])) {
                            this._queue[_i] = this._queue[_i].replace(/(callback|jsonp)=([^&]+)?/i, '$1=_JSONP_Callback');
                            // Check if script is not already loaded
                            _script.push('<scr' + 'ipt type="text/javascript" src="'+this._queue[_i]+'"><\/scr' + 'ipt>');
                        }
                    }
                    _script.push('</head><body></body></html>');
                    
                    // Write the infamous
                    _iframeContent.write(_script.join("\n"));

                    var _that = this;
                    
                    _iframeWindow.onload = function() {
                        if(_that._callBack) {
                            //Notify callback function
                            _that._callBack.apply(_that._scope, this['_JSONP_Stack']);
                        }
                        
                        if(!Swell.Core.Browser.isIE) {
                            //_iframeElement.parentNode.removeChild(_iframeElement);
                        } else {
                            // @see http://outofhanwell.com/ieleak/index.php?title=Fixing_Leaks#Pseudo-Leaks
                            _dropIFrameEl(_iframeElement);
                        }
                    }
                    
                    var _dropIFrameEl = function(el) {
                        var garbageBin = document.getElementById('IELeakGarbageBin');
                        if (!garbageBin) {
                            garbageBin = document.createElement('DIV');
                            garbageBin.id = 'IELeakGarbageBin';
                            garbageBin.style.display = 'none';
                            document.body.appendChild(garbageBin);
                        }

                        // move the element to the garbage bin
                        garbageBin.appendChild(el);
                        garbageBin.innerHTML = '';
                        
                        _iframeElement =  _iframeContent = _iframeWindow = _dropIFrameEl = null
                    }
                    
                    // We are done writing into iframe close it
                    _iframeContent.close();
                }
            },
            
            /**
             * Detach subscribers of the current lazy loading scheme
             * happens when the lazyloader has finished loading or when something bad occurs
             * you can call it manually as well to prevent other scripts to be notified of the load
             *
             * @function cleanup
             * @public
            */
            cleanup : function() {
                // Remove events
                this.onResourceLoaded.unsubscribeAll();
                this.onStart.unsubscribeAll();
            },
            
            /**
             * Get a resource loaded with the lazyload component
             * Only available for scripts and css resources
             *
             * @function get
             * @param {String} type type of the asset script/css/img
             * @param {String[]} src url of resource
             * @return {HTMLScriptElement|HTMLLinkElement|null}
             * @public
            */
            get : function(type, src) {
                return this._loadedResources.get(Swell.encrypt(type + '-' + src));
            },
            
            /**
             * Checks if a resource has been loaded
             *
             * @function isLoaded
             * @param {String} type type of the asset script/css/img
             * @param {String[]} src url of resource
             * @return {Boolean}
             * @public
            */
            isLoaded : function(type, src) {
                if(type !== 'img') {
                    return this._loadedResources.exists(Swell.encrypt(type + '-' + src));
                } else {
                    // Search document images
                    var _im = new Image();
                    _im.src = src;
                    
                    if(_im.complete) {
                        return true;
                    }
                }
                return false;
            },
            
            /**
             * @borrows Swell.Core.Asset.attach as this.load
            */
            attach : function() {
                return this.load.apply(this, arguments);
            },
            
            /**
             * Detach a resource loaded with the lazyloader utility
             *
             * @function detach
             * @param {String} type type of the asset script/css/img
             * @param {String[]} src url of resource
             * @public
            */
            detach : function(type, src) {
                var _asset;
                if(this.isLoaded(type, src)) {
                    var _encryptedResource = Swell.encrypt(type + '-' + src);
                    _asset = this._loadedResources.get(_encryptedResource);
                    _asset.parentNode.removeChild(_asset);
                    this._loadedResources.remove(_encryptedResource);
                }
            },
            
            /**
             * Detach all resources loaded with the lazyloader utility
             *
             * @function detachAll
             * @public
            */
            detachAll : function() {
                this._loadedResources.walk(function(item, key) {
                    item.parentNode.removeChild(item);
                    this.remove(key);
                });
            },
            
            /**
            * @event onResourceLoaded fires when a file request is completed
            */
            onResourceLoaded : new Swell.Core.CustomEvent('onResourceLoaded', this),
            
            /**
            * @event onStart fires when a file request has started
            */
            onStart : new Swell.Core.CustomEvent('onStart', this)
        }
    }()
});

// Set some shorthands for the class
Swell.alias(Swell.Core.Asset, 'Asset');