/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 * 
 * @alias BrowserSupports
 * @requires Core Browser
*/

/**
 * This class checks if the browser supports these methods natively
 * @class BrowserSupports
 * @namespace Swell.Core
 * @static
*/
Swell.Core.Browser.supports = {
    'getBoundingClientRect'   : !!document.documentElement.getBoundingClientRect,
    'querySelector'           : !!document.querySelector,
    'firstElementChild'       : !!document.documentElement.firstElementChild,
    'webWorkers'              : (typeof Worker === 'function'),
    'XDomainRequest'          : (typeof XDomainRequest === 'function'),
    'registerProtocolHandler' : !!navigator.registerProtocolHandler
};