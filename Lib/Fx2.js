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

            el : null,
            /**
             * @constructs
             * @param {Mixed[]} this.el the this.element ID to grab, or an array of several IDs
             */
            construct : function(el, css, options) {
                //Grab the DOM this.el if the passed argument is a string
                this.el = (typeof el === 'string') ? document.getElementById(el) : el;

                if(!this.el) {
                    return false;
                }
                this.run(css, options);
            },

            wait : function(time) {
                this.stack.push({wait: time});
            },

            after : function(css) {
                this.stack.push({css : css});
            }

            run : function(css, options) {
                options = options || {};
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
                    current[prop] = this.parse(comp[prop]);
                }
                
                var _that = this;
                interval = setInterval(function () {
                    var time = new Date().getTime(), pos = time > finish ? 1 : (time - start) / dur;
                    for (prop in target) {
                        _that.el.style[prop] = (current[prop].value + (target[prop].value - current[prop].value) * easing(pos)).toFixed(3) + target[prop].unit;
                    }
                    if (time > finish) {
                        clearInterval(interval);
                        if(options.after) {
                            setTimeout(function() {
                            _that.run(options.after.css)
                            }, 10);
                        }
                    }
                }, 10);
            },

            apply : function(rules) {
                _rules = {};
                for(var i in rules) {
                    _rules[Swell.Core.camelize(i)] = this.parse(rules[i]);
                };
                return _rules;
            },

            parse : function(value) {
                var v = parseFloat(value),
                    u = value.replace(/^-?[\d\.]+/,'');
                    
                return {
                    value: isNaN(v) ? u : v,
                    unit: isNaN(v) ? 'color' : u
                };
            }
        }
    }()
});