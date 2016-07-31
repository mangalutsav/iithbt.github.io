/*!
 * jQuery++ - 2.0.0
 * http://jquerypp.com
 * Copyright (c) 2016 Bitovi
 * Sun, 31 Jul 2016 15:14:54 GMT
 * Licensed MIT

 * Includes: jquerypp/event/swipe/swipe
 * Download from: http://bitbuilder.herokuapp.com/jquerypp.custom.js?plugins=jquerypp%2Fevent%2Fswipe%2Fswipe
 */
/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({"jquery":"jQuery","zepto":"Zepto"},window)
/*jquerypp@2.0.0#event/livehack/livehack*/
define('jquerypp/event/livehack/livehack', ['jquery'], function ($) {
    var event = $.event, findHelper = function (events, types, callback, selector) {
            var t, type, typeHandlers, all, h, handle, namespaces, namespace, match;
            for (t = 0; t < types.length; t++) {
                type = types[t];
                all = type.indexOf('.') < 0;
                if (!all) {
                    namespaces = type.split('.');
                    type = namespaces.shift();
                    namespace = new RegExp('(^|\\.)' + namespaces.slice(0).sort().join('\\.(?:.*\\.)?') + '(\\.|$)');
                }
                typeHandlers = (events[type] || []).slice(0);
                for (h = 0; h < typeHandlers.length; h++) {
                    handle = typeHandlers[h];
                    match = all || namespace.test(handle.namespace);
                    if (match) {
                        if (selector) {
                            if (handle.selector === selector) {
                                callback(type, handle.origHandler || handle.handler);
                            }
                        } else if (selector === null) {
                            callback(type, handle.origHandler || handle.handler, handle.selector);
                        } else if (!handle.selector) {
                            callback(type, handle.origHandler || handle.handler);
                        }
                    }
                }
            }
        };
    event.find = function (el, types, selector) {
        var events = ($._data(el) || {}).events, handlers = [], t, liver, live;
        if (!events) {
            return handlers;
        }
        findHelper(events, types, function (type, handler) {
            handlers.push(handler);
        }, selector);
        return handlers;
    };
    event.findBySelector = function (el, types) {
        var events = $._data(el).events, selectors = {}, add = function (selector, event, handler) {
                var select = selectors[selector] || (selectors[selector] = {}), events = select[event] || (select[event] = []);
                events.push(handler);
            };
        if (!events) {
            return selectors;
        }
        findHelper(events, types, function (type, handler, selector) {
            add(selector || '', type, handler);
        }, null);
        return selectors;
    };
    event.supportTouch = 'ontouchend' in document;
    $.fn.respondsTo = function (events) {
        if (!this.length) {
            return false;
        } else {
            return event.find(this[0], $.isArray(events) ? events : [events]).length > 0;
        }
    };
    $.fn.triggerHandled = function (event, data) {
        event = typeof event == 'string' ? $.Event(event) : event;
        this.trigger(event, data);
        return event.handled;
    };
    event.setupHelper = function (types, startingEvent, onFirst) {
        if (!onFirst) {
            onFirst = startingEvent;
            startingEvent = null;
        }
        var add = function (handleObj) {
                var bySelector, selector = handleObj.selector || '', namespace = handleObj.namespace ? '.' + handleObj.namespace : '';
                if (selector) {
                    bySelector = event.find(this, types, selector);
                    if (!bySelector.length) {
                        $(this).delegate(selector, startingEvent + namespace, onFirst);
                    }
                } else {
                    if (!event.find(this, types, selector).length) {
                        event.add(this, startingEvent + namespace, onFirst, {
                            selector: selector,
                            delegate: this
                        });
                    }
                }
            }, remove = function (handleObj) {
                var bySelector, selector = handleObj.selector || '';
                if (selector) {
                    bySelector = event.find(this, types, selector);
                    if (!bySelector.length) {
                        $(this).undelegate(selector, startingEvent, onFirst);
                    }
                } else {
                    if (!event.find(this, types, selector).length) {
                        event.remove(this, startingEvent, onFirst, {
                            selector: selector,
                            delegate: this
                        });
                    }
                }
            };
        $.each(types, function () {
            event.special[this] = {
                add: add,
                remove: remove,
                setup: function () {
                },
                teardown: function () {
                }
            };
        });
    };
    return $;
});
/*jquerypp@2.0.0#event/swipe/swipe*/
define('jquerypp/event/swipe/swipe', [
    'jquery',
    'jquerypp/event/livehack/livehack'
], function ($) {
    var isPhantom = /Phantom/.test(navigator.userAgent), supportTouch = !isPhantom && 'ontouchend' in document, scrollEvent = 'touchmove scroll', touchStartEvent = supportTouch ? 'touchstart' : 'mousedown', touchStopEvent = supportTouch ? 'touchend' : 'mouseup', touchMoveEvent = supportTouch ? 'touchmove' : 'mousemove', data = function (event) {
            var d = event.originalEvent.touches ? event.originalEvent.touches[0] : event;
            return {
                time: new Date().getTime(),
                coords: [
                    d.clientX,
                    d.clientY
                ],
                origin: $(event.target)
            };
        };
    var swipe = $.event.swipe = {
        delay: 500,
        max: 320,
        min: 30
    };
    $.event.setupHelper([
        'swipe',
        'swipeleft',
        'swiperight',
        'swipeup',
        'swipedown'
    ], touchStartEvent, function (ev) {
        var start = data(ev), stop, delegate = ev.delegateTarget || ev.currentTarget, selector = ev.handleObj.selector, entered = this;
        function moveHandler(event) {
            if (!start) {
                return;
            }
            stop = data(event);
            if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
                event.preventDefault();
            }
        }
        ;
        $(document.documentElement).bind(touchMoveEvent, moveHandler).one(touchStopEvent, function (event) {
            $(this).unbind(touchMoveEvent, moveHandler);
            if (start && stop) {
                var deltaX = Math.abs(start.coords[0] - stop.coords[0]), deltaY = Math.abs(start.coords[1] - stop.coords[1]), distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (stop.time - start.time < swipe.delay && distance >= swipe.min && distance <= swipe.max) {
                    var events = ['swipe'];
                    if (deltaX >= swipe.min && deltaY < swipe.min) {
                        events.push(start.coords[0] > stop.coords[0] ? 'swipeleft' : 'swiperight');
                    } else if (deltaY >= swipe.min && deltaX < swipe.min) {
                        events.push(start.coords[1] < stop.coords[1] ? 'swipedown' : 'swipeup');
                    }
                    $.each($.event.find(delegate, events, selector), function () {
                        this.call(entered, ev, {
                            start: start,
                            end: stop
                        });
                    });
                }
            }
            start = stop = undefined;
        });
    });
    return $;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();