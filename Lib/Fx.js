/**
 * Copyright (c) 2009, Swthis.ell All rights reserved.
 * Code licensed under the BSD License:
 * http://www.justswthis.ell.org/license.txt
 * version: 1.0 beta
 *
 * @author <christopheeble@gmail.com> Christophe Eble
 * @author <alpherz@gmail.com> Jonathan Gautheron
*/

/**
 * @class Fx
 * @namespace Swthis.ell.Lib
*/
Swell.namespace('Lib.Fx');

Swell.Core.Class({
    
    name      : 'Fx',
    namespace : 'Lib',
    functions : function() {
        
        return {
            
            stack : [],
            oldstack : [],

            onComplete : null,

            el : null,

            firstRun : false,
            
            /**
             * @constructs
             * @param {Mixed[]} this.el the this.element ID to grab, or an array of several IDs
             */
            construct : function(el, css, options) {

                if(Swell.Core.isArray(el)) {
                    for(var i=0; i < el.length; i++) new this(el, css, options);
                    return false;
                }

                this.options = options || {};

                //Grab the DOM this.el if the passed argument is a string
                this.el = (typeof el === 'string') ? document.getElementById(el) : el;
                this.currentStyle ? this.el.currentStyle : getComputedStyle(this.el, null);

                if(!this.el) {
                    return false;
                }
                if(css) {
                    this.stack.push({css : css});
                }
                
                this.onComplete = function() {
                    if(this.options) {
                        
                        if(this.options.repeat) {
                            this.stack = this.oldstack;
                            this.run();
                        }
                    }
                };
            },

            revert : function() {
                this.stack = [];
                this.el.style = this.currentStyle;
                return this;
            },

            wait : function(time) {
                this.stack.push({wait: time});
                return this;
            },

            chain : function(css) {
                this.stack.push({css : css});
                return this;
            },

            process : function(css, options, idx)
            {
                var options = options || {};
                var target = this.apply(css),
                    comp = this.el.currentStyle ? this.el.currentStyle : getComputedStyle(this.el, null),
                    prop,
                    current = {},
                    start = new Date().getTime(),
                    dur = options.duration || 200,
                    finish = start + dur,
                    interval,
                    easing = options.easing || function (pos) { return (-Math.cos(pos * Math.PI) / 2) + 0.5; }; //Default easing :)

                for (prop in target) {
                    current[prop] = this.parse(comp[prop], prop);
                    if(current[prop]['prop'] !== prop) {
                        target[current[prop]['prop']] = target[prop];
                        current[current[prop]['prop']] = current[prop];
                        delete target[prop];
                        delete current[prop];
                    }
                }
                
                var _that = this;
                interval = setInterval(function () {
                    var time = new Date().getTime(), pos = time > finish ? 1 : (time - start) / dur;
                    for (prop in target) {
                        _that.el.style[prop] = current[prop].wrap[0] + (current[prop].value + (target[prop].value - current[prop].value) * easing(pos)).toFixed(3) + target[prop].unit + current[prop].wrap[1];
                    }
                    if (time > finish) {
                        clearInterval(interval);
                        if(idx == _that.lastStackIndex) {
                            _that.firstRun = false;
                            _that.onComplete.call(_that);
                            //_that.onComplete.unsubscribeAll();
                        }
                    }
                }, 10);
            },

            fadeOut : function() {
                this.stack.push({css : {'opacity' : '0'}});
                return this;
            },

            fadeIn : function() {
                this.stack.push({css : {'opacity' : '1'}});
                return this;
            },

            dispose : function() {
                this.stack.push({dispose : true});
                return this;
            },

            run : function() {

                if(!this.firstRun) {
                    this.firstRun = true;
                    this.lastStackIndex = this.stack.length -1;
                    this.oldstack = [].concat(this.stack);
                } else {
                    this.comp = this.el.currentStyle ? this.el.currentStyle : getComputedStyle(this.el, null);
                }
                
                for(var item in this.stack) {
                    var effect  = this.stack[item],
                        that    = this;

                    if(effect.css) {
                        delete this.stack[item];
                        this.process(effect.css, {}, item);
                        continue;
                    }
                    else if(effect.comp) {
                        delete this.stack[item];
                        this.process(this.comp, {}, item);
                        continue;
                    }
                    else if(effect.wait) {
                        delete this.stack[item];
                        if(item == this.lastStackIndex) {
                            this.onComplete.call(this);
                        }
                        setTimeout(function() {
                            that.run.call(that);
                        }, effect.wait);
                        break;
                    }
                    else if(effect.dispose) {
                        delete this.stack[item];
                        if(item == this.lastStackIndex) {
                            this.onComplete.call(this);
                        }
                        this.el.parentNode.removeChild(this.el);
                        break;
                    }
                }

                return this;
            },

            apply : function(rules) {
                _rules = {};
                for(var i in rules) {
                    _rules[Swell.Core.camelize(i)] = this.parse(rules[i]);
                };
                return _rules;
            },

            parse : function(value, prop) {

                if(!!!value) {
                    value = '0';
                }
                
                var v    = parseFloat(value),
                    u    = value.replace(/^-?[\d\.]+/,''),
                    wrap = ['',''],
                    transform;

                if(prop === 'rotate') {
                    if(Browser.isWebkit) {
                        transform = 'webkitTransform';
                    } else if(Browser.isGecko) {
                        transform = 'MozTransform';
                    }
                    prop = transform;
                    wrap = ['rotate(',')'];
                }
                    
                return {
                    value: isNaN(v) ? u : v,
                    unit: isNaN(v) ? 'color' : u,
                    prop: prop,
                    wrap : wrap
                };
            }
        }
    }()
});