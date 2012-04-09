/**
 * Copyright (c) 2009, Swell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
 *
 * @alias KeyListener
 * @requires Event
 * @crossdep Element ElementKeyListener
*/

/**
 * Adds keylistening methods to Event
 * @class KeyListener
 * @namespace Swell.Core
 * @augments Swell.Core.Event
*/
Swell.Core.Class.augment(Swell.Core.Event, {

    _modifiers   : {},
    _specialKey  : null,
    _keyCode     : null,
    _charCode    : null,

    /**
     * KeyListener is a utility that provides an easy interface for listening for
     * keydown/keyup events fired against DOM elements.
     *
     * @function addKeyListener
     * @static
     * @param {HTMLElement|String|String[]|HTMLElement[]} o The element on which the listener will be attached to 
     * @param {Object|String} keys
     * @param {Function} callback function to call when key is detected
     * 
    */
    addKeyListener : function(o, keys, callback, scope, args, stop) {
        var _hotkeys;
        
        if(!Swell.Core.isFunction(callback)) {
            return false;
        }
        // Keyboard events, fires in this order : (1) keydown, (2) keypress, (3) keyup
        // Attempting to detect keydown event
        
        var _onKeyPress = function(e, _keys) {

            //Execution scope is the object on which the keylistener has been attached
            scope = scope || e.getTarget();
            args  = args  || null; 

            var _charCode = (this._charCode) ? this._charCode : e.getCharCode(true);
            _charCode = _charCode.toLowerCase();

            // If String, it's a hotkey combination
            if(Swell.Core.isString(_keys)) {
                // Check if hotkey is not the universal selector *
                if(_keys !== '*') {
                    //Check if it's a valid hotkey (must match modifiers and keys)
                    if((_hotkeys = this.isValidHotKey(this._modifiers, (this._specialKey) ? this._specialKey : _charCode, _keys))) {
                        callback.call(
                            scope,
                            e, 
                            (this._specialKey) ? this._specialKey : _charCode,
                            (this._specialKey) ? this._keyCode    : _charCode,
                            this._modifiers,
                            args
                        );
                    }
                } else {
                    // This is the universal selector, try to map the keycode with the keymapper
                    callback.call(
                        scope, 
                        e, 
                        (this._specialKey) ? this._specialKey : _charCode,
                        (this._specialKey) ? this._keyCode    : e.getKeyCode(),
                        this._modifiers,
                        args
                    );
                }
            } else if(Swell.Core.isObject(_keys)) {
                
                var _match = false;
                
                _keys.shift = _keys.shift || false;
                _keys.alt   = _keys.alt   || false;
                _keys.ctrl  = _keys.ctrl  || false;
                
                if (e.modifiers.shift === _keys.shift && 
                    e.modifiers.alt   === _keys.alt &&
                    e.modifiers.ctrl  === _keys.ctrl) { 
                    // All Modifiers Match Either True or False
                    // Checking keys
                    if(_keys.hasOwnProperty('keys')) {
                        if(Swell.Core.isArray(_keys.keys)) {
                            if(Swell.Core.inArray(((this._keyCode) ? this._keyCode : e.getKeyCode()), _keys.keys)) {
                                _match = true;
                            }
                        } else {
                            if(_keys.keys === ((this._keyCode) ? this._keyCode : e.getKeyCode())) {
                                _match = true;
                            }
                        }
                        if(_match) {
                            callback.call(
                                scope,
                                e, 
                                (this._specialKey) ? this._specialKey : _charCode,
                                (this._specialKey) ? this._keyCode    : e.getKeyCode(),
                                this._modifiers,
                                args
                            );
                        }
                    }
                }
            }
            if(stop) {
                e.stop();
            }
        };
        
        var _onKeyDown = function(e, _keys) {
            
            // Reset special key
            this._specialKey = null;
            this._keyCode    = null;
            this._charCode   = null;
            var _specialKeyName;
            
            //Bind the modifiers
            this._modifiers = e.modifiers;
            
            // Check if keypressed is a special key
            _specialKeyName = this.getSpecialKeyName(e.getKeyCode());
            if(_specialKeyName) {
                this._specialKey = _specialKeyName;
                this._keyCode    =  e.getKeyCode();
                // This is a special key, we know that IE will not fire
                // keypress event for the keys below, we'll do it for him :D
                if( (Swell.Core.Browser.isIE)         && (
                    Swell.Core.Event.Key.DEL        ||
                    Swell.Core.Event.Key.END        ||
                    Swell.Core.Event.Key.ENTER      ||
                    Swell.Core.Event.Key.ESC        ||
                    Swell.Core.Event.Key.F1         ||
                    Swell.Core.Event.Key.F2         ||
                    Swell.Core.Event.Key.F3         ||
                    Swell.Core.Event.Key.F4         ||
                    Swell.Core.Event.Key.F5         ||
                    Swell.Core.Event.Key.F6         ||
                    Swell.Core.Event.Key.F7         ||
                    Swell.Core.Event.Key.F8         ||
                    Swell.Core.Event.Key.F9         ||
                    Swell.Core.Event.Key.F10        ||
                    Swell.Core.Event.Key.HOME       ||
                    Swell.Core.Event.Key.INS        ||
                    Swell.Core.Event.Key.PAGEUP     ||
                    Swell.Core.Event.Key.PAGEDOWN   ||
                    Swell.Core.Event.Key.TAB
                  )) {
                    this.simulate(o, 'keypress');
                } else if(Swell.Core.Browser.isWebkit && (
                    this._keyCode === Swell.Core.Event.Key.UP        ||
                    this._keyCode === Swell.Core.Event.Key.RIGHT     ||
                    this._keyCode === Swell.Core.Event.Key.DOWN      ||
                    this._keyCode === Swell.Core.Event.Key.LEFT      ||
                    this._keyCode === Swell.Core.Event.Key.PAGEUP    ||
                    this._keyCode === Swell.Core.Event.Key.PAGEDOWN
                )) {
                    this.simulate(o, 'keypress');
                }
            } else {
                if(this._modifiers.ctrl || this._modifiers.shift || this._modifiers.alt) {
                    // A modifier has been pressed with another combination
                    // Get the keycode
                    this._keyCode    =  e.getKeyCode();
                    this._charCode   =  e.getCharCode(true);
                    
                    // Webkit doesn't handle keypress events on special keys at all
                    // we'll simply call the handler on keydown event
                    if(Swell.Core.Browser.isWebkit) {
                        //this.remove(o, 'keypress');
                        _onKeyPress.call(this, e, _keys);
                        return;
                    }
                    this.simulate(o, 'keypress');
                }
            }
        };
        
        // Capture special keys only
        this.add(o, 'keydown', _onKeyDown, this, keys);
        
        // Capture modifiers only
        this.add(o, 'keypress', _onKeyPress, this, keys);
    },
    
    /**
     * Checks if a string representation of a key event, matches the current keydown sequence
     *
     * @function isValidHotKey
     * @static
     * @example ctrl+a, (for hotkey), esc|space (one handler multiple keys), or single key ex : enter, esc, space... (Look at the keymapper to have a complete reference)
     * @param {Object} modifiers object representing the current state of modifiers e.g. : shift : true, alt : true, ctrl : false
     * @param {String} charname returned by the keypress handler
     * @param {String} str hotkey combination to parse
     * @return {Boolean} true if the current event matches the hotkey
    */
    isValidHotKey : function(modifiers, charname, str) {
        var _combinations = [], _n, _keyCode, _hasModifier = false, _hotKeyModifier_ = {}, _p, _match = false, _kc, _hotkey = null;
        // Strip spaces
        str = str.replace(/\s/g, '');
        // At first detect if there's a combination operator
        if(str.indexOf('+') !== -1) {
            // There are multiple keys
            _combinations = str.split('+');
            // Ok we got the combination
            // Now we have to test
            for(_n=0; _n < _combinations.length; _n++) {
                // Capturing modifiers (multiple modifiers are supported)
                // Checking if modifier is supported
                if(modifiers.hasOwnProperty(_combinations[_n])) {
                    _hotKeyModifier_[_combinations[_n]] = false;
                    // Now checking if modifier is currently at the same state
                    if(modifiers[_combinations[_n]]) {
                        _hotKeyModifier_[_combinations[_n]] = true;
                    }
                } else {
                    // Capturing only one KeyCode (cannot detect more than one keystroke at once)
                    // capturing the first valid keycode
                    // Grab the keycode with the keymapper
                    _kc = (_combinations[_n] === charname) ? charname : false;

                    if(_kc) {
                        if(!_keyCode) {
                            _keyCode = _kc;
                            _hotkey = _combinations[_n];
                        }
                    }
                }
            }
        } else if(str.indexOf('|') !== -1) {
            _combinations = str.split('|');
            // Ok we got the combination
            // Now we have to test
            for(_n=0; _n < _combinations.length; _n++) {
                // Capturing only one KeyCode (cannot detect more than one keystroke at once)
                // capturing the first valid keycode
                // Grab the keycode with the keymapper
                if(!modifiers.shift && !modifiers.ctrl && !modifiers.alt) {
                    _kc = (_combinations[_n] === charname) ? charname : false;
                    if(_kc) {
                        if(!_keyCode) {
                            _keyCode = _kc;
                            _hotkey = _combinations[_n];
                        }
                    }
                }
            }
        } else {
            // Modifiers cannot be set
            if(!modifiers.shift && !modifiers.ctrl && !modifiers.alt) {
                _kc = (str === charname) ? charname : false;
                if(_kc) {
                    _match = true;
                    _keyCode = _kc;
                    _hotkey = str;
                }
            }
        }
        if(_keyCode) {
            _match = true;
            if(Swell.Core.hasProperties(_hotKeyModifier_)) {
                // We have to ensure that all properties of _hotKeyModifier_
                // matches the properties of eventObject
                for(_p in _hotKeyModifier_) {
                    // If Modifier is on and HotKey modifier is there as well
                    if(!modifiers[_p]) {
                        _match = false;
                        break;
                    }
                }
            }
        }
        return (_match) ? _hotkey : false;
    },
    
    /**
     * Obtain and check if keycode is a special key
     *
     * @function getSpecialKeyName
     * @static
     * @param {Int} keycode
     * @return {Int|Boolean}
    */
    getSpecialKeyName : function(keycode) {
        var _kc;
        _kc = ((_kc = Swell.Core.Event.Key.Map.Special[keycode]))       ||
              // Checking If combination is found in special keys
              ((_kc = Swell.Core.Event.Key.Map.Navigation[keycode]))    ||
              // Checking if combination is found in navigation keys
              ((_kc = Swell.Core.Event.Key.Map.Functions[keycode]))

        return _kc || false;
    }
});

/**
 * Constants for key strokes.
 * @enum {string}
 * @static
 * @see http://www.quirksmode.org/js/keys.html
*/
Swell.Core.Event.Key ={

    // Most-used special keys
    ALT             : 18,
    CTRL            : 17,
    DEL             : 46,
    ENTER           : 13,
    END             : 35,
    ESC             : 27,
    BACKSPACE       : 8,
    HOME            : 36,
    SHIFT           : 16,
    TAB             : 9,
    INS             : 45,

    // Nav keys
    LEFT            : 37,
    UP              : 38,
    RIGHT           : 39,
    DOWN            : 40,
    PAGEUP          : 33,
    PAGEDOWN        : 34,
    
    // Lock Keys
    CAPSLOCK        : 20,
    NUMLOCK         : 144,
    
    // Function Keys (F1 - F12)
    F1              : 112,
    F2              : 113,
    F3              : 114,
    F4              : 115,
    F5              : 116,
    F6              : 117,
    F7              : 118,
    F8              : 119,
    F9              : 120,
    F10             : 121,
    F11             : 122,
    F12             : 123
}

/**
 * Provides a comprehensive, and reliable way to map alphabetical and numeric characters
 * based on keyCode, this map will help us to implement hot-key combinations such as ctrl+v etc.
 * The Most annoying thing is that 
 *
 * For keydown and keyup events, you can identify most common keys (letters, numbers, and a few others) 
 * by just looking at the event.keyCode and more or less pretending that it is an ASCII code. However, it isn't really, 
 * and the many Javascript manuals that say it can be converted to a character by doing "String.fromCharCode(event.keyCode)" 
 * are wrong
 *
 * We will just provide an almost "reliable" keymap for keydown event
 *
 * @static
*/ 
Swell.Core.Event.Key.Map ={
    Special : {
        46    : 'del',
        13    : 'enter',
        35    : 'end',
        27    : 'esc',
        9     : 'tab',
        32    : 'space',
        19    : 'pause',
        20    : 'capslock',
        145   : 'scrolllock',
        144   : 'numlock',
        45    : 'insert',
        18    : 'altgr',
        188   : 'comma',
        54    : 'dash',
        219   : 'openbracket',
        221   : 'closebracket',
        191   : 'slash',
        220   : 'backslash',
        222   : 'singlequote',
        51    : 'dblquote',
        49    : 'ampersand',
        8     : 'backspace',
        53    : 'openparenthesis',
        219   : 'closeparenthesis',
        220   : 'asterisk',
        190   : 'semicolon',
        187   : 'equalsign',
        186   : 'dollar',
        56    : 'underscore',
        17    : 'ctrl',
        16    : 'shift',
        91    : 'win-left',
        92    : 'win-right',
        52    : 'quote'
    },
    
    Navigation : {
        '37' : 'left',
        '39' : 'right',
        '38' : 'up',
        '40' : 'down',
        '33' : 'pgup',
        '34' : 'pgdown',
        '36' : 'home'
    },
    
    Functions : {
        '112' : 'F1',
        '113' : 'F2',
        '114' : 'F3',
        '115' : 'F4',
        '116' : 'F5',
        '117' : 'F6',
        '118' : 'F7',
        '119' : 'F8',
        '120' : 'F9',
        '121' : 'F10',
        '122' : 'F11',
        '123' : 'F12'
    }
}