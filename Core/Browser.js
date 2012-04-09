/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 * 
 * @alias Browser
 * @requires Core
*/

/**
 * The Browser Class provides tools for browser detection
 * @class Browser
 * @namespace Swell.Core
 * @static
*/
Swell.Core.Browser = new function(){

    this.IE        = 'IE';
    this.OPERA     = 'OPERA';
    this.SAFARI    = 'SAFARI';
    this.AIR       = 'AIR';
    this.WEBKIT    = 'WEBKIT';
    this.GECKO     = 'GECKO';
    this.CHROMIUM  = 'CHROMIUM';
    this.CHROME    = 'CHROME';
    this.IPHONE    = 'IPHONE';
    
    var _browserInfo ={
        vendor          : navigator.vendor,
        ua              : navigator.userAgent,
        name            : null,
        additionalName  : null,
        version         : {},
        options         : {},
        isMobile        : false,
        isOnline        : (!!navigator.onLine) ? navigator.onLine : false,
        mode            : (document.compatMode === 'CSS1Compat' || document.compatMode === 'Almost_Standards') ? 'standards' : 'quirks'
    }

    // Check if Browser is Chrome or Chromium
    if(!!window.chrome || !!window.chromium) {
        _browserInfo.name    = (!!window.chrome) ? this.CHROME : this.CHROMIUM;
        _browserInfo.version = {
            'browser' : /Chrome\/([0-9\.]+)\s/.exec(_browserInfo.ua)[1],
            'engine'  : /AppleWebKit\/([0-9\.\+]+)\s/.exec(_browserInfo.ua)[1]
        }
    } else if(!!window.devicePixelRatio && !!window.getMatchedCSSRules && !window.Opera) {
        // Another webkit-based browser
        _browserInfo.name = this.SAFARI;
        _browserInfo.version = {
            'browser' : /Version\/([0-9\.]+)\s/.exec(_browserInfo.ua)[1],
            'engine'  : /AppleWebKit\/([0-9\.\+]+)\s/.exec(_browserInfo.ua)[1]
        }
        // Testing if Webkit engine is embedded into Adobe AIR
        if(/AdobeAIR\/([0-9\.]+)$/.test(_browserInfo.ua)) {
            _browserInfo.name = this.AIR;
            _browserInfo.version = {
                'browser' : /AdobeAIR\/([0-9\.]+)$/.exec(_browserInfo.ua)[1],
                'engine'  : /AppleWebKit\/([0-9\.\+]+)\s/.exec(_browserInfo.ua)[1]
            }
        }
        if(!!window.orientation) {
            _browserInfo.name = this.IPHONE;
            _browserInfo.version = {
                'browser' : /Version\/([0-9\.]+)\s/.exec(_browserInfo.ua)[1],
                'engine'  : /AppleWebKit\/([0-9\.\+]+)\s/.exec(_browserInfo.ua)[1]
            }
        }
    }
    // Check if browser is IE
    if(/*@cc_on!@*/false) {
        _browserInfo.name = this.IE;
        _browserInfo.version.browser = /MSIE\s([0-9\.]+);/.exec(_browserInfo.ua)[1];
        _browserInfo.version.engine = /Trident\/([0-9\.]+);/.exec(_browserInfo.ua);
        if(_browserInfo.version.engine !== null) {
            _browserInfo.version.engine = _browserInfo.version.engine[1];
        }
        // Detecting IE Mobile
        if(/IEMobile/.test(_browserInfo.ua)) {
            _browserInfo.isMobile = true;
        }
    }
    // Check if browser is Gecko
    if(navigator.product === 'Gecko' && !_browserInfo.name) {
        // Detect browser
        var _re = /Gecko\/[0-9]+ (\S+)\/(\S+)(?:\s|$)/.exec(_browserInfo.ua);
        // Checking version
        _browserInfo.name            = this.GECKO;
        _browserInfo.additionalName = _re[1];
        _browserInfo.version = {
            'browser'    : _re[2],
            'engine'     : /rv\:([^\);]+)(\)|;)/.exec(_browserInfo.ua)[1]
        }
    }
    
    // Detect Opera
    if(!!window.opera) {
        _browserInfo.name  = this.OPERA;
        _browserInfo.version = {
            'browser'    : opera.version(),
            'engine'     : /Presto\/([0-9\.]+)$/.exec(_browserInfo.ua)[1]
        }
    }
    
    var platform = navigator.platform;
    
    this.isMac   = platform.indexOf('Mac')   !== -1;
    this.isWin   = platform.indexOf('Win')   !== -1;
    this.isLinux = platform.indexOf('Linux') !== -1;
    this.isNix   = this.isMac || this.isLinux || false;
    
    // Shortcuts to use in conditional statements
    this.isIE     = _browserInfo.name === this.IE;
    this.isGecko  = _browserInfo.name === this.GECKO;
    this.isWebkit = _browserInfo.name === this.WEBKIT || _browserInfo.name === this.CHROME || _browserInfo.name === this.CHROMIUM || _browserInfo.name === this.SAFARI;
    this.isOpera  = _browserInfo.name === this.OPERA;
    
    this.info = _browserInfo;
    this.version = _browserInfo.version;
    _browserInfo = null;
}();

// Set some shorthands for the class
Swell.alias(Swell.Core.Browser, 'Browser');