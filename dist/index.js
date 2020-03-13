'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var reactDom = require('react-dom');

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _extends_1 = createCommonjsModule(function (module) {
  function _extends() {
    module.exports = _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  module.exports = _extends;
});

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;

function useEvent(element, event, callback, enabled, capture) {
  if (enabled === void 0) {
    enabled = true;
  }

  if (capture === void 0) {
    capture = false;
  }

  return React.useEffect(function () {
    if (!enabled || !element) {
      return;
    }

    var cb = callback;
    var el = Array.isArray(element) ? element : [element];
    var ev = Array.isArray(event) ? event : [event];
    el.forEach(function (e) {
      ev.forEach(function (event) {
        e.addEventListener(event, cb, capture);
      });
    });
    return function () {
      el.forEach(function (e) {
        ev.forEach(function (event) {
          e.removeEventListener(event, cb, capture);
        });
      });
    };
  }, [callback, element, enabled, event, capture]);
}

var OutsideClickContext = React__default.createContext({});

function isChildOf(parent, target) {
  if (parent === target) {
    return true;
  }

  var hasChildren = parent.children && parent.children.length > 0;

  if (hasChildren) {
    // tslint:disable-next-line
    for (var i = 0; i < parent.children.length; i++) {
      var child = parent.children[i];

      if (child && isChildOf(child, target)) {
        return true;
      }
    }
  }

  return false;
}

function OutsideClickGroupProvider(_ref) {
  var refs = _ref.refs,
      children = _ref.children;
  var isPartOfGroup = typeof React__default.useContext(OutsideClickContext) === "function";

  if (isPartOfGroup) {
    return children;
  }

  return React__default.createElement(OutsideClickContext.Provider, {
    value: React__default.useCallback(function (layerRef) {
      refs.current.add(layerRef);
    }, [])
  }, children);
}

function useRegisterGroup(refs) {
  var registerRefToGroup = React__default.useContext(OutsideClickContext);
  React__default.useEffect(function () {
    var _refs$current$values = refs.current.values(),
        layerRef = _refs$current$values[0];

    if (typeof registerRefToGroup === "function" && layerRef) {
      registerRefToGroup(layerRef);
    }
  }, [registerRefToGroup, refs]);
}

function useOutsideClick(refs, callback) {
  var _React$useState = React__default.useState(["click"]),
      events = _React$useState[0];

  useRegisterGroup(refs);
  useEvent(typeof document !== "undefined" ? document : null, events, React__default.useCallback(function (evt) {
    for (var _iterator = refs.current, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var ref = _ref2;

      if (!ref.current) {
        continue;
      }

      if (isChildOf(ref.current, evt.target)) {
        return;
      }
    }

    callback();
  }, [callback]), true, true);
}

function useOnScroll(elements, onScroll, environment, trackScroll) {
  if (trackScroll === void 0) {
    trackScroll = true;
  }

  var memoElements = React.useMemo(function () {
    return typeof environment !== "undefined" ? [environment].concat(elements) : [];
  }, [elements]);
  useEvent(memoElements, "scroll", onScroll, trackScroll);
}

function useOnWindowResize(onResize, environment, trackResize) {
  if (trackResize === void 0) {
    trackResize = true;
  }

  useEvent(typeof environment !== "undefined" ? environment : null, "resize", onResize, trackResize);
}

var useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useTrackElementResize(injectedResizeObserver, layerRef, triggerElement, isOpen, callback, environment) {
  var callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  var ResizeObserver = injectedResizeObserver || (typeof environment === "undefined" ? function ResizeObserver() {} : environment.ResizeObserver);

  if (!ResizeObserver) {
    throw new Error("This browser does not support `ResizeObserver` out of the box. Please provide a polyfill as a prop.");
  }

  var resizeObserver = React.useRef(new ResizeObserver(function () {
    if (layerRef.current) {
      callbackRef.current();
    }
  }));
  useIsomorphicLayoutEffect(function () {
    if (isOpen) {
      if (triggerElement) {
        resizeObserver.current.observe(triggerElement);
      }
    } else {
      if (triggerElement) {
        resizeObserver.current.unobserve(triggerElement);
      }

      if (layerRef.current) {
        resizeObserver.current.unobserve(layerRef.current);
      }
    }
  }, [isOpen, triggerElement]);
  React.useEffect(function () {
    return function () {
      resizeObserver.current.disconnect();
    };
  }, []);
  return resizeObserver.current;
}

var EMPTY_STYLE = {};
function isSet(value) {
  return value !== undefined && value !== null;
}

function areStylesTheSame(a, b) {
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (var i = 0; i < Math.max(aKeys.length, bKeys.length); i++) {
    var key = aKeys[i] || bKeys[i];

    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

function shouldUpdateStyles(prev, next) {
  if (areStylesTheSame(prev.layer, next.layer) && areStylesTheSame(prev.arrow, next.arrow)) {
    return false;
  }

  return true;
} // creates a ClientRect-like object from the viewport's dimensions

function getWindowClientRect(environment) {
  return {
    top: 0,
    left: 0,
    right: environment ? environment.innerWidth : 0,
    bottom: environment ? environment.innerHeight : 0,
    height: environment ? environment.innerHeight : 0,
    width: environment ? environment.innerWidth : 0
  };
}

var convertFloat = function convertFloat(value) {
  return parseFloat(value.replace("px", ""));
}; // get the outer width / height of an element
// We effectively want the same width / height that `getBoundingClientRect()`
// gives, minus optional `scale` transforms


function getContentBox(element, environment) {
  if (!environment) {
    return {
      width: 0,
      height: 0
    };
  }

  var _environment$getCompu = environment.getComputedStyle(element),
      width = _environment$getCompu.width,
      height = _environment$getCompu.height,
      boxSizing = _environment$getCompu.boxSizing,
      borderLeft = _environment$getCompu.borderLeft,
      borderRight = _environment$getCompu.borderRight,
      borderTop = _environment$getCompu.borderTop,
      borderBottom = _environment$getCompu.borderBottom,
      paddingLeft = _environment$getCompu.paddingLeft,
      paddingRight = _environment$getCompu.paddingRight,
      paddingTop = _environment$getCompu.paddingTop,
      paddingBottom = _environment$getCompu.paddingBottom;

  return {
    width: boxSizing === "border-box" ? convertFloat(width) : [width, borderLeft, borderRight, paddingLeft, paddingRight].reduce(function (total, value) {
      return total + (value ? convertFloat(value) : 0);
    }, 0),
    height: boxSizing === "border-box" ? convertFloat(height) : [height, borderTop, borderBottom, paddingTop, paddingBottom].reduce(function (total, value) {
      return total + (value ? convertFloat(value) : 0);
    }, 0)
  };
} // converts a ClientRect (or DOMRect) to a plain js-object
// usefull for destructuring for instance

function clientRectToObject(clientRect) {
  return {
    top: clientRect.top,
    left: clientRect.left,
    right: clientRect.right,
    bottom: clientRect.bottom,
    width: clientRect.width,
    height: clientRect.height
  };
}
function getElementFromAnchorNode(anchorNode) {
  var currentElement = anchorNode;

  while (!currentElement.getBoundingClientRect) {
    if (!currentElement.parentElement) {
      return null;
    }

    currentElement = currentElement.parentElement;
  }

  return currentElement;
}
function minMax(value, _ref) {
  var min = _ref.min,
      max = _ref.max;
  return value < min ? min : value > max ? max : value;
}

function useStyleState(anchor) {
  var _React$useState = React.useState({
    layer: EMPTY_STYLE,
    arrow: EMPTY_STYLE,
    layerSide: anchor.split("_")[0].toLowerCase()
  }),
      INITIAL_STYLES = _React$useState[0];

  var _React$useState2 = React.useState(INITIAL_STYLES),
      styles = _React$useState2[0],
      setStyles = _React$useState2[1];

  var lastStyles = React.useRef(styles);
  return {
    styles: styles,
    lastStyles: lastStyles,
    setStyles: setStyles,
    resetLastStyles: function resetLastStyles() {
      lastStyles.current = INITIAL_STYLES;
    }
  };
}

var Anchor = {
  BOTTOM_LEFT: "BOTTOM_LEFT",
  BOTTOM_RIGHT: "BOTTOM_RIGHT",
  BOTTOM_CENTER: "BOTTOM_CENTER",
  TOP_LEFT: "TOP_LEFT",
  TOP_CENTER: "TOP_CENTER",
  TOP_RIGHT: "TOP_RIGHT",
  LEFT_BOTTOM: "LEFT_BOTTOM",
  LEFT_CENTER: "LEFT_CENTER",
  LEFT_TOP: "LEFT_TOP",
  RIGHT_BOTTOM: "RIGHT_BOTTOM",
  RIGHT_CENTER: "RIGHT_CENTER",
  RIGHT_TOP: "RIGHT_TOP"
};
var POSSIBLE_ANCHORS = Object.keys(Anchor);
function getPrimaryDirection(anchor) {
  return anchor.startsWith("TOP_") || anchor.startsWith("BOTTOM_") ? "Y" : "X";
}

function primaryIsY(primary) {
  return primary === "TOP" || primary === "BOTTOM";
}

function getPrimaryByIndex(index, preferedPrimary, preferedX, preferedY) {
  var prefferedIsY = primaryIsY(preferedPrimary);

  if (index < 3) {
    return preferedPrimary;
  }

  if (index < 6) {
    return prefferedIsY ? preferedX : preferedY;
  }

  if (index < 9) {
    if (prefferedIsY) {
      return ["LEFT", "RIGHT"].filter(function (x) {
        return x !== preferedX;
      })[0];
    } else {
      return ["TOP", "BOTTOM"].filter(function (x) {
        return x !== preferedY;
      })[0];
    }
  }

  if (prefferedIsY) {
    return ["TOP", "BOTTOM"].filter(function (x) {
      return x !== preferedPrimary;
    })[0];
  } else {
    return ["LEFT", "RIGHT"].filter(function (x) {
      return x !== preferedPrimary;
    })[0];
  }
}

function getSecondaryByIndex(index, preferedPrimary, preferedSecondary, rects) {
  var prefferedIsY = primaryIsY(preferedPrimary);
  var triggerHasBiggerHeight = rects.trigger.height > rects.layer.height;
  var triggerHasBiggerWidth = rects.trigger.width > rects.layer.width;

  switch (index) {
    case 9:
    case 0:
      return preferedSecondary;

    case 1:
    case 10:
      {
        if (preferedSecondary === "CENTER") {
          return prefferedIsY ? "RIGHT" : "BOTTOM";
        }

        return "CENTER";
      }

    case 4:
    case 7:
      return "CENTER";

    case 2:
    case 11:
      {
        if (prefferedIsY) {
          return ["LEFT", "RIGHT"].filter(function (x) {
            return x !== preferedSecondary;
          })[0];
        } else {
          return ["TOP", "BOTTOM"].filter(function (x) {
            return x !== preferedSecondary;
          })[0];
        }
      }

    case 3:
    case 6:
      {
        if (prefferedIsY) {
          return preferedPrimary === "BOTTOM" ? triggerHasBiggerHeight ? "BOTTOM" : "TOP" : triggerHasBiggerHeight ? "TOP" : "BOTTOM";
        }

        return preferedPrimary === "LEFT" ? triggerHasBiggerWidth ? "LEFT" : "RIGHT" : triggerHasBiggerWidth ? "RIGHT" : "LEFT";
      }

    case 5:
    case 8:
      {
        if (prefferedIsY) {
          return preferedPrimary === "BOTTOM" ? triggerHasBiggerHeight ? "TOP" : "BOTTOM" : triggerHasBiggerHeight ? "BOTTOM" : "TOP";
        }

        return preferedPrimary === "LEFT" ? triggerHasBiggerWidth ? "RIGHT" : "LEFT" : triggerHasBiggerWidth ? "LEFT" : "RIGHT";
      }
  }
  /* istanbul ignore next */


  return "LEFT";
}

function getSecondaryAnchorOptionsByPrimary(primary, anchorOptions) {
  return anchorOptions.filter(function (anchor) {
    return anchor.startsWith(primary);
  });
}
function splitAnchor(anchor) {
  var _ref = anchor.split("_"),
      primary = _ref[0],
      secondary = _ref[1];

  return {
    primary: primary,
    secondary: secondary
  };
}
function getLayerSideByAnchor(anchor) {
  if (anchor === "CENTER") {
    return "center";
  }

  return splitAnchor(anchor).primary.toLowerCase();
}
function getAnchorPriority(preferedAnchor, possibleAnchors, preferedX, preferedY, rects) {
  var _ref2 = preferedAnchor !== "CENTER" ? splitAnchor(preferedAnchor) : {
    primary: preferedY,
    secondary: "CENTER"
  },
      primary = _ref2.primary,
      secondary = _ref2.secondary;

  var anchors = POSSIBLE_ANCHORS.map(function (_, index) {
    return getPrimaryByIndex(index, primary, preferedX, preferedY) + "_" + getSecondaryByIndex(index, primary, secondary, rects);
  }).filter(function (anchor) {
    return possibleAnchors.indexOf(anchor) > -1;
  }); // include prefered anchor if not included in possibleAnchors

  if (anchors.indexOf(preferedAnchor) === -1) {
    /* istanbul ignore next */
    anchors = [preferedAnchor].concat(anchors);
  }

  return anchors;
}

function getPrimaryStyle(primary, rects, scroll, triggerOffset) {
  var _ref2;

  var prop = primary === "TOP" || primary === "BOTTOM" ? "top" : "left";
  var size = primary === "TOP" || primary === "BOTTOM" ? "height" : "width";

  if (primary === "TOP" || primary === "LEFT") {
    var _ref;

    return _ref = {}, _ref[prop] = rects.trigger[prop] - rects.layer[size] - (rects.relativeParent[prop] - scroll[prop]) - triggerOffset, _ref;
  }

  return _ref2 = {}, _ref2[prop] = rects.trigger[prop] + rects.trigger[size] - (rects.relativeParent[prop] - scroll[prop]) + triggerOffset, _ref2;
}

function getCenter(rects, scroll, offsetSecondary, prop, size) {
  return minMax(rects.trigger[prop] - rects.relativeParent[prop] + scroll[prop] + rects.trigger[size] / 2 - rects.layer[size] / 2 - offsetSecondary, getLimits(rects, scroll)[prop]);
}

function getLimits(rects, scroll) {
  var topBase = rects.trigger.top - rects.relativeParent.top + scroll.top;
  var leftBase = rects.trigger.left - rects.relativeParent.left + scroll.left;
  return {
    top: {
      min: topBase - (rects.layer.height - rects.arrow.height),
      max: topBase + (rects.trigger.height - rects.arrow.height)
    },
    left: {
      min: leftBase - (rects.layer.width - rects.arrow.width),
      max: leftBase + (rects.trigger.width - rects.arrow.width)
    }
  };
}

function getSecondaryStyle(secondary, rects, scroll, offsetSecondary, primaryDirection) {
  var _ref5;

  if (secondary === "CENTER") {
    var _ref3;

    var _prop = primaryDirection === "X" ? "top" : "left";

    var _size = primaryDirection === "X" ? "height" : "width";

    return _ref3 = {}, _ref3[_prop] = getCenter(rects, scroll, offsetSecondary, _prop, _size), _ref3;
  }

  var prop = secondary === "TOP" || secondary === "BOTTOM" ? "top" : "left";
  var size = secondary === "TOP" || secondary === "BOTTOM" ? "height" : "width";

  if (secondary === "TOP" || secondary === "LEFT") {
    var _ref4;

    return _ref4 = {}, _ref4[prop] = minMax(rects.trigger[prop] - rects.relativeParent[prop] + scroll[prop] + offsetSecondary, getLimits(rects, scroll)[prop]), _ref4;
  }

  return _ref5 = {}, _ref5[prop] = minMax(rects.trigger[prop] + rects.trigger[size] - rects.layer[size] - (rects.relativeParent[prop] - scroll[prop]) - offsetSecondary, getLimits(rects, scroll)[prop]), _ref5;
}

function getAbsolutePositions(_ref6) {
  var anchor = _ref6.anchor,
      rects = _ref6.rects,
      triggerOffset = _ref6.triggerOffset,
      offsetSecondary = _ref6.offsetSecondary,
      scrollLeft = _ref6.scrollLeft,
      scrollTop = _ref6.scrollTop;
  var scroll = {
    left: scrollLeft,
    top: scrollTop
  };

  if (anchor === "CENTER") {
    return {
      top: getCenter(rects, scroll, 0, "top", "height"),
      left: getCenter(rects, scroll, 0, "left", "width")
    };
  }

  var _splitAnchor = splitAnchor(anchor),
      primary = _splitAnchor.primary,
      secondary = _splitAnchor.secondary;

  var primaryDirection = getPrimaryDirection(anchor);
  return _extends_1({}, getPrimaryStyle(primary, rects, scroll, triggerOffset), {}, getSecondaryStyle(secondary, rects, scroll, offsetSecondary, primaryDirection));
}

// anticipate the width / height based on the current anchor

function fixLayerDimensions(originalLayer, anchor, layerDimensions) {
  var dimensions = typeof layerDimensions === "function" ? layerDimensions(getLayerSideByAnchor(anchor)) : layerDimensions;
  return _extends_1({}, clientRectToObject(originalLayer), {}, dimensions);
}

var propMap = {
  TOP: {
    side1: "bottom",
    side2: "top",
    size: "height",
    factor: -1
  },
  BOTTOM: {
    side1: "top",
    side2: "bottom",
    size: "height",
    factor: 1
  },
  LEFT: {
    side1: "right",
    side2: "left",
    size: "width",
    factor: -1
  },
  RIGHT: {
    side1: "left",
    side2: "right",
    size: "width",
    factor: 1
  }
};

function getPrimaryRect(primary, trigger, layer, triggerOffset) {
  var _ref;

  var _propMap$primary = propMap[primary],
      side1 = _propMap$primary.side1,
      side2 = _propMap$primary.side2,
      size = _propMap$primary.size,
      factor = _propMap$primary.factor;
  var value = trigger[side2] + triggerOffset * factor;
  return _ref = {}, _ref[side1] = value, _ref[side2] = value + layer[size] * factor, _ref;
}

function getCenter$1(trigger, layer, offsetSecondary, prop, size) {
  var _ref2;

  var value = trigger[prop] + trigger[size] / 2 - layer[size] / 2 - offsetSecondary;
  return _ref2 = {}, _ref2[prop] = value, _ref2[prop === "left" ? "right" : "bottom"] = value + layer[size], _ref2;
}

function getSecondaryRect(secondary, trigger, layer, offsetSecondary, primaryDirection) {
  var _ref3;

  if (secondary === "CENTER") {
    var prop = primaryDirection === "X" ? "top" : "left";

    var _size = primaryDirection === "X" ? "height" : "width";

    return getCenter$1(trigger, layer, offsetSecondary, prop, _size);
  }

  var _propMap$secondary = propMap[secondary],
      side1 = _propMap$secondary.side1,
      side2 = _propMap$secondary.side2,
      size = _propMap$secondary.size,
      factor = _propMap$secondary.factor;
  var value = trigger[side2] - offsetSecondary * factor;
  return _ref3 = {}, _ref3[side2] = value, _ref3[side1] = value - layer[size] * factor, _ref3;
}

function getLayerRectByAnchor(_ref4) {
  var trigger = _ref4.trigger,
      layer = _ref4.layer,
      anchor = _ref4.anchor,
      triggerOffset = _ref4.triggerOffset,
      _ref4$scrollOffset = _ref4.scrollOffset,
      scrollOffset = _ref4$scrollOffset === void 0 ? 0 : _ref4$scrollOffset,
      _ref4$offsetSecondary = _ref4.offsetSecondary,
      offsetSecondary = _ref4$offsetSecondary === void 0 ? 0 : _ref4$offsetSecondary,
      layerDimensions = _ref4.layerDimensions;
  var primaryRect;
  var secondaryRect; // get the correct anticipated ClientRect based on the provided Anchor

  var layerRect = layerDimensions ? fixLayerDimensions(layer, anchor, layerDimensions) : layer;

  if (anchor === "CENTER") {
    primaryRect = getCenter$1(trigger, layerRect, 0, "top", "height");
    secondaryRect = getCenter$1(trigger, layerRect, 0, "left", "width");
  } else {
    var _splitAnchor = splitAnchor(anchor),
        primary = _splitAnchor.primary,
        secondary = _splitAnchor.secondary;

    var primaryDirection = getPrimaryDirection(anchor);
    primaryRect = getPrimaryRect(primary, trigger, layerRect, triggerOffset);
    secondaryRect = getSecondaryRect(secondary, trigger, layerRect, offsetSecondary, primaryDirection);
  }

  var result = _extends_1({}, layerRect, {}, primaryRect, {}, secondaryRect); // correct scrollOffsets


  result.top = result.top - scrollOffset;
  result.right = result.right + scrollOffset;
  result.left = result.left - scrollOffset;
  result.bottom = result.bottom + scrollOffset;
  return result;
}

var ALL_OFFSET_SIDES = ["bottom", "top", "left", "right"];

function getLayerOffsetsToParent(layer, parent) {
  return {
    top: layer.top - parent.top,
    bottom: parent.bottom - layer.bottom,
    left: layer.left - parent.left,
    right: parent.right - layer.right
  };
}

function getLayerOffsetsToParents(layer, parents) {
  return parents.map(function (parent) {
    return getLayerOffsetsToParent(layer, parent);
  });
}

function isLayerCompletelyInvisible(layer, parents) {
  return parents.some(function (parent) {
    return layer.bottom <= parent.top || layer.right <= parent.left || layer.top >= parent.bottom || layer.left >= parent.right;
  });
}
function doesEntireLayerFitWithinScrollParents(layer, parents) {
  var parentOffsets = getLayerOffsetsToParents(layer, parents);
  return parentOffsets.every(function (offsets) {
    return ALL_OFFSET_SIDES.every(function (side) {
      return offsets[side] >= 0;
    });
  });
}
function reduceOffsets(parentOffsets) {
  var parentOffsetsCombined = parentOffsets.reduce(function (result, offsets) {
    ALL_OFFSET_SIDES.forEach(function (side) {
      result[side] = [].concat(result[side], [offsets[side]]);
    });
    return result;
  }, {
    top: [],
    bottom: [],
    left: [],
    right: []
  });
  return ALL_OFFSET_SIDES.reduce(function (result, side) {
    result[side] = parentOffsetsCombined[side].sort(function (a, b) {
      return a - b;
    })[0];
    return result;
  }, {});
}
function getNegativeOffsetSides(parentOffsets) {
  var offsets = reduceOffsets(parentOffsets);
  return ALL_OFFSET_SIDES.filter(function (side) {
    return offsets[side] < 0;
  });
}

function getVisibleLayerSurface(layer, parent) {
  var offsets = getLayerOffsetsToParent(layer, parent);

  var _ALL_OFFSET_SIDES$fil = ALL_OFFSET_SIDES.filter(function (side) {
    return offsets[side] < 0;
  }).reduce(function (rect, side) {
    var _extends2;

    var affectedProperty = side === "top" || side === "bottom" ? "height" : "width";
    return _extends_1({}, rect, (_extends2 = {}, _extends2[affectedProperty] = rect[affectedProperty] + offsets[side], _extends2));
  }, layer),
      width = _ALL_OFFSET_SIDES$fil.width,
      height = _ALL_OFFSET_SIDES$fil.height;

  var result = width * height;
  return width < 0 && height < 0 ? -result : result;
}

function getVisibleLayerSurfaceWithinScrollParent(layer, parents) {
  var surfaces = parents.map(function (parent) {
    return getVisibleLayerSurface(layer, parent);
  }); // pick smallest

  return surfaces.sort(function (a, b) {
    return a - b;
  })[0];
}
function doesAnchorFitWithinScrollParents(anchor, rects, triggerOffset, scrollOffset, layerDimensions) {
  var layerRect = getLayerRectByAnchor({
    anchor: anchor,
    trigger: rects.trigger,
    layer: rects.layer,
    triggerOffset: triggerOffset,
    scrollOffset: scrollOffset,
    layerDimensions: layerDimensions
  });
  return doesEntireLayerFitWithinScrollParents(layerRect, rects.scrollParents);
}
function getLayerOffsetsToScrollParentsByAnchor(anchor, rects, triggerOffset, scrollOffset) {
  return getLayerOffsetsToParents(getLayerRectByAnchor({
    anchor: anchor,
    trigger: rects.trigger,
    layer: rects.layer,
    triggerOffset: triggerOffset,
    scrollOffset: scrollOffset,
    layerDimensions: null
  }), rects.scrollParents);
}
function triggerIsBiggerThanLayer(layerSide, layer, trigger) {
  return (layerSide === "top" || layerSide === "bottom") && trigger.width > layer.width || (layerSide === "left" || layerSide === "right") && trigger.height > layer.height;
}

function getOffsetSurface(anchor, layer, triggerOffset, scrollOffset) {
  var primaryDirection = getPrimaryDirection(anchor);
  var primarySize = layer[primaryDirection === "X" ? "width" : "height"] - triggerOffset - scrollOffset * 2;
  var secondarySize = layer[primaryDirection === "X" ? "height" : "width"] - triggerOffset - scrollOffset * 2;
  return primarySize * secondarySize;
}

function findAnchorByLayerSurface(rects, anchorOptions, triggerOffset, scrollOffset, layerDimensions) {
  var result = anchorOptions.map(function (anchor) {
    // get layerRect based on all offsets
    var layerRect = getLayerRectByAnchor({
      anchor: anchor,
      layer: rects.layer,
      trigger: rects.trigger,
      scrollOffset: scrollOffset,
      triggerOffset: triggerOffset,
      layerDimensions: layerDimensions
    }); // get smallest visible layer surface for current anchor

    var surface = getVisibleLayerSurfaceWithinScrollParent(layerRect, rects.scrollParents); // get surface of the offsets
    // offsets are important for collision detection, but
    // eventually we are interested in the 'meat' of the layer

    var offsetSurface = getOffsetSurface(anchor, layerRect, triggerOffset, scrollOffset);
    return {
      anchor: anchor,
      square: surface - offsetSurface
    };
  }) // sort -> biggest surface first
  .sort(function (a, b) {
    return b.square - a.square;
  });
  return result[0].anchor;
}

function findBestSuitableAnchor(rects, anchorOptions, triggerOffset, scrollOffset, layerDimensions) {
  // STRATEGY A
  // find first that fits parent
  var anchor = anchorOptions.find(function (anchor) {
    return doesAnchorFitWithinScrollParents(anchor, rects, triggerOffset, scrollOffset, layerDimensions);
  });

  if (anchor) {
    return anchor;
  } // STRATEGY B
  // find first with biggest surface


  return findAnchorByLayerSurface(rects, anchorOptions, triggerOffset, scrollOffset, layerDimensions);
}

function getSecondaryOffsetSide(currentAnchor, firstAnchorThatDoesNotFit, rects, triggerOffset, scrollOffset) {
  var primaryDirection = getPrimaryDirection(currentAnchor);
  var offsets = getLayerOffsetsToScrollParentsByAnchor(firstAnchorThatDoesNotFit, rects, triggerOffset, scrollOffset);
  var sides = getNegativeOffsetSides(offsets);
  return sides.find(function (side) {
    if (primaryDirection === "X") {
      return side === "top" || side === "bottom";
    }

    return side === "left" || side === "right";
  });
}

function findSecondaryOffset(anchor, anchorOptions, rects, triggerOffset, scrollOffset) {
  var _splitAnchor = splitAnchor(anchor),
      primary = _splitAnchor.primary;
  /**
   * A.
   * Check which other anchors available
   */


  var secondaryAnchorOptions = getSecondaryAnchorOptionsByPrimary(primary, anchorOptions);
  /**
   * B.
   * Check whether current anchor is the preffered anchor and whether
   * it fits
   * If so, skip secondary offset
   */

  var currentAnchorHasHighestPriority = secondaryAnchorOptions.indexOf(anchor) === 0;
  var currentAnchorFits = doesAnchorFitWithinScrollParents(anchor, rects, triggerOffset, scrollOffset, null);

  if (currentAnchorHasHighestPriority && currentAnchorFits) {
    return 0;
  }
  /**
   * C.
   * Retrieve the first anchor on same primary side (by priority) that
   * does not fit.
   * Check if there's a relevant side that has a negative offset.
   * If not, skip secondary offset
   */


  var firstAnchorThatDoesNotFit = secondaryAnchorOptions.find(function (anchor) {
    return !doesAnchorFitWithinScrollParents(anchor, rects, triggerOffset, scrollOffset, null);
  });
  var affectedSide = getSecondaryOffsetSide(anchor, firstAnchorThatDoesNotFit, rects, triggerOffset, scrollOffset);

  if (!affectedSide) {
    return 0;
  }
  /**
   * Determine the final secondary offset
   */


  var currentOffsets = reduceOffsets(getLayerOffsetsToScrollParentsByAnchor(anchor, rects, triggerOffset, scrollOffset));
  var secondaryOffset = -currentOffsets[affectedSide];
  var triggerIsBigger = triggerIsBiggerThanLayer(getLayerSideByAnchor(anchor), rects.layer, rects.trigger);
  var isCenter = anchor.includes("_CENTER");
  var isLeft = anchor.includes("_LEFT");
  var isTop = anchor.includes("_TOP"); // when trigger is bigger, make `secondaryOffset` positive
  // conditionally

  if (triggerIsBigger && (isLeft && affectedSide === "right" || affectedSide === "left" || isTop && affectedSide === "bottom" || affectedSide === "top")) {
    secondaryOffset = -secondaryOffset;
  } else if ( // when current anchor is center, make `secondaryOffset` positive
  // when affectedSide is top or right
  !triggerIsBigger && isCenter && (affectedSide === "top" || affectedSide === "left")) {
    secondaryOffset = -secondaryOffset;
  }

  return secondaryOffset;
}

function getOffsets(layer, trigger, arrow) {
  var left = layer.left + layer.width / 2 - trigger.left - arrow.width / 2;
  var right = layer.right - layer.width / 2 - trigger.right + arrow.width / 2;
  var top = layer.top + layer.height / 2 - trigger.top - arrow.height / 2;
  var bottom = layer.bottom - layer.height / 2 - trigger.bottom + arrow.height / 2;
  return {
    left: left < 0 ? -left : 0,
    right: right > 0 ? -right : 0,
    top: top < 0 ? -top : 0,
    bottom: bottom > 0 ? -bottom : 0
  };
}

function getArrowStyle(layer, trigger, layerSide, arrow) {
  var triggerIsBigger = triggerIsBiggerThanLayer(layerSide, layer, trigger);
  var limitsDefault = {
    left: {
      min: arrow.width / 2,
      max: layer.width - arrow.width / 2
    },
    top: {
      min: arrow.height / 2,
      max: layer.height - arrow.height / 2
    }
  };
  var offsets = getOffsets(layer, trigger, arrow);

  if (layerSide === "bottom") {
    return {
      bottom: "100%",
      top: null,
      left: minMax(triggerIsBigger ? layer.width / 2 + (offsets.left + offsets.right) : trigger.left + trigger.width / 2 - layer.left, limitsDefault.left),
      right: null
    };
  }

  if (layerSide === "right") {
    return {
      right: "100%",
      left: null,
      top: minMax(triggerIsBigger ? layer.height / 2 + (offsets.top + offsets.bottom) : trigger.top + trigger.height / 2 - layer.top, limitsDefault.top),
      bottom: null
    };
  }

  if (layerSide === "top") {
    return {
      top: "100%",
      bottom: null,
      left: minMax(triggerIsBigger ? layer.width / 2 + (offsets.left + offsets.right) : trigger.left + trigger.width / 2 - layer.left, limitsDefault.left),
      right: null
    };
  }

  return {
    left: "100%",
    right: null,
    top: minMax(triggerIsBigger ? layer.height / 2 + (offsets.top + offsets.bottom) : trigger.top + trigger.height / 2 - layer.top, limitsDefault.top),
    bottom: null
  };
}

function getAbsoluteStyle(_ref) {
  var rects = _ref.rects,
      scrollTop = _ref.scrollTop,
      scrollLeft = _ref.scrollLeft,
      triggerOffset = _ref.triggerOffset,
      scrollOffset = _ref.scrollOffset,
      possibleAnchors = _ref.possibleAnchors,
      preferedAnchor = _ref.preferedAnchor,
      preferedX = _ref.preferedX,
      preferedY = _ref.preferedY,
      autoAdjust = _ref.autoAdjust,
      snapToAnchor = _ref.snapToAnchor,
      layerDimensions = _ref.layerDimensions;
  // get a list of possible anchors bases on user set props
  var possibleAnchorsByPriority = getAnchorPriority(preferedAnchor, possibleAnchors, preferedX, preferedY, rects); // on `autoAdjust` find best suitable anchor based on
  // window's / scrollParent's position

  var anchor = autoAdjust ? findBestSuitableAnchor(rects, possibleAnchorsByPriority, triggerOffset, scrollOffset, layerDimensions) : preferedAnchor; // calculate a secondary offset when `autoAdjust` is set
  // and `snapToAnchor` is not.
  // Basically it creates a visual effect where it seems that
  // the layer has glued to it's parents sides
  // Note: `offsetSecondary` is disabled when anchor is CENTER

  var offsetSecondary = autoAdjust && !snapToAnchor && anchor !== "CENTER" ? findSecondaryOffset(anchor, possibleAnchorsByPriority, rects, triggerOffset, scrollOffset) : 0;
  var layerStyle = getAbsolutePositions({
    anchor: anchor,
    rects: rects,
    triggerOffset: triggerOffset,
    offsetSecondary: offsetSecondary,
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  });
  var layerRect = getLayerRectByAnchor({
    anchor: anchor,
    trigger: rects.trigger,
    layer: rects.layer,
    triggerOffset: triggerOffset,
    offsetSecondary: offsetSecondary,
    layerDimensions: layerDimensions
  });

  if (layerDimensions) {
    layerStyle.width = layerRect.width;
    layerStyle.height = layerRect.height;
  }

  return {
    layerStyle: layerStyle,
    layerRect: layerRect,
    anchor: anchor
  };
}

function compensateScrollbars(rect, clientWidth, clientHeight) {
  var scrollbarWidth = rect.width - clientWidth;
  var scrollbarHeight = rect.height - clientHeight;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width - scrollbarWidth,
    right: rect.right - scrollbarWidth,
    height: rect.height - scrollbarHeight,
    bottom: rect.bottom - scrollbarHeight
  };
}

function getArrowRect(layerElement, arrowOffset) {
  var arrowElement = layerElement.querySelector("[data-arrow]");

  if (!arrowElement) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0
    };
  }

  var rect = arrowElement.getBoundingClientRect();
  return _extends_1({}, clientRectToObject(rect), {
    width: rect.width + arrowOffset * 2,
    height: rect.height + arrowOffset * 2
  });
}

var defaultPlacement = {
  autoAdjust: false,
  snapToAnchor: false,
  anchor: "TOP_CENTER",
  layerDimensions: null,
  possibleAnchors: POSSIBLE_ANCHORS,
  preferX: "RIGHT",
  preferY: "BOTTOM",
  scrollOffset: 10,
  triggerOffset: 0,
  arrowOffset: 0
};
function getPositioning(_ref) {
  var triggerRect = _ref.triggerRect,
      layerElement = _ref.layerElement,
      relativeParentElement = _ref.relativeParentElement,
      scrollParents = _ref.scrollParents,
      _ref$placement = _ref.placement,
      placement = _ref$placement === void 0 ? {} : _ref$placement,
      environment = _ref.environment,
      fixed = _ref.fixed;

  /**
   * A.
   * Calculate new layer positions
   */
  // sometimes ResizeObserver calls this function when all values in the
  // trigger ClientRect are 0. Return early in that case
  if (triggerRect.height === 0) {
    return;
  }

  if (!layerElement) {
    return;
  } // gather all scroll parents (including the window ClientRect)
  // in order to check for collisions


  var scrollParentRects = fixed ? [getWindowClientRect(environment)] : [].concat(scrollParents.map(function (parent) {
    return compensateScrollbars(parent.getBoundingClientRect(), parent.clientWidth, parent.clientHeight);
  }), [getWindowClientRect(environment)]);
  var options = {
    autoAdjust: placement.autoAdjust || defaultPlacement.autoAdjust,
    snapToAnchor: placement.snapToAnchor || defaultPlacement.snapToAnchor,
    triggerOffset: isSet(placement.triggerOffset) ? placement.triggerOffset : defaultPlacement.triggerOffset,
    scrollOffset: isSet(placement.scrollOffset) ? placement.scrollOffset : defaultPlacement.scrollOffset,
    possibleAnchors: placement.possibleAnchors || defaultPlacement.possibleAnchors,
    preferedAnchor: placement.anchor || defaultPlacement.anchor,
    preferedX: placement.preferX || defaultPlacement.preferX,
    preferedY: placement.preferY || defaultPlacement.preferY,
    scrollLeft: relativeParentElement === document.body ? 0 : relativeParentElement.scrollLeft,
    scrollTop: relativeParentElement === document.body ? 0 : relativeParentElement.scrollTop,
    relativeParentElement: relativeParentElement,
    layerDimensions: placement.layerDimensions || defaultPlacement.layerDimensions
  };
  var layerBox = layerElement.getBoundingClientRect(); // construct layerRect

  var layer = _extends_1({
    top: layerBox.top,
    left: layerBox.left,
    right: layerBox.right,
    bottom: layerBox.bottom
  }, getContentBox(layerElement, environment));

  var rects = {
    layer: layer,
    relativeParent: relativeParentElement.getBoundingClientRect(),
    scrollParents: scrollParentRects,
    trigger: triggerRect,
    arrow: getArrowRect(layerElement, placement.arrowOffset || defaultPlacement.arrowOffset)
  };

  var _getAbsoluteStyle = getAbsoluteStyle(_extends_1({
    rects: rects
  }, options)),
      layerRect = _getAbsoluteStyle.layerRect,
      layerStyle = _getAbsoluteStyle.layerStyle,
      anchor = _getAbsoluteStyle.anchor;

  if (fixed) {
    layerStyle.top = layerRect.top;
    layerStyle.left = layerRect.left;
  } // determine in which side to layer will be relative to
  // the trigger


  var layerSide = getLayerSideByAnchor(anchor); // get optional arrow positions
  // anchor-style is pointless when rendered anchor is CENTER

  var arrowStyle = anchor === "CENTER" ? EMPTY_STYLE : getArrowStyle(layerRect, triggerRect, layerSide, rects.arrow);
  var styles = {
    layer: layerStyle,
    arrow: arrowStyle,
    layerSide: layerSide
  };
  return {
    styles: styles,
    layerRect: layerRect
  };
}

/**
 * Tracks an element and keeps it in state
 * (together with other relevant state that depends on the element)
 */

function useElementRef(initialState, elementToState) {
  var _React$useState = React.useState(initialState || null),
      state = _React$useState[0],
      setState = _React$useState[1];

  var lastElement = React.useRef(null);
  var setRef = React.useCallback(function (node) {
    if (node && node !== lastElement.current) {
      lastElement.current = node;

      if (elementToState) {
        setState(elementToState(node));
      } else {
        setState(node);
      }
    }
  }, []);
  return [setRef, state, lastElement];
}

function findScrollContainers(element, environment) {
  var result = [];

  if (!element || !environment) {
    return result;
  }

  if (element === document.body) {
    return result;
  }

  var _environment$getCompu = environment.getComputedStyle(element),
      overflow = _environment$getCompu.overflow,
      overflowX = _environment$getCompu.overflowX,
      overflowY = _environment$getCompu.overflowY;

  if ([overflow, overflowX, overflowY].some(function (prop) {
    return prop === "auto" || prop === "scroll";
  })) {
    result.push(element);
  }

  return [].concat(result, findScrollContainers(element.parentElement, environment));
}

function useElementState(container, fixed, environment) {
  return useElementRef({
    triggerElement: null,
    relativeParentElement: null,
    scrollParents: []
  }, React.useCallback(function (triggerElement) {
    var scrollParents = findScrollContainers(triggerElement, environment);
    var relativeParentElement = scrollParents[0] || document.body;

    if (relativeParentElement === document.body) {
      document.body.style.position = "relative";
    } else if (process.env.NODE_ENV === "development" && environment) {
      // Check if we should warn the user about 'position: relative; stuff...'
      var containerElement = typeof container === "function" ? container() : container;
      var position = environment.getComputedStyle(relativeParentElement).position;
      var shouldWarnAboutPositionStyle = position !== "relative" && position !== "absolute" && position !== "fixed" && !fixed && !containerElement;

      if (shouldWarnAboutPositionStyle) {
        console.error("react-laag: Set the 'position' style of the nearest scroll-container to 'relative', 'absolute' or 'fixed', or set the 'fixed' prop to true. This is needed in order to position the layers properly. Currently the scroll-container is positioned: \"" + position + "\". Visit https://react-laag.com/docs/#position-relative for more info.", relativeParentElement);
      }
    }

    return {
      triggerElement: triggerElement,
      relativeParentElement: relativeParentElement,
      scrollParents: scrollParents
    };
  }, []));
}

function useIsOpen(internal, external) {
  var shouldOpenAfterMount = React.useRef(external);
  var isOpen = shouldOpenAfterMount.current ? false : isSet(external) ? external : internal;
  var rerenderAfterMount = React.useState(false)[1];
  React.useEffect(function () {
    if (shouldOpenAfterMount.current) {
      shouldOpenAfterMount.current = false;
      rerenderAfterMount(true);
    }
  }, []);
  return isOpen;
}

function ToggleLayer(_ref) {
  var children = _ref.children,
      renderLayer = _ref.renderLayer,
      _ref$placement = _ref.placement,
      placement = _ref$placement === void 0 ? {} : _ref$placement,
      onStyle = _ref.onStyle,
      isOpenExternal = _ref.isOpen,
      closeOnOutsideClick = _ref.closeOnOutsideClick,
      onOutsideClick = _ref.onOutsideClick,
      onDisappear = _ref.onDisappear,
      closeOnDisappear = _ref.closeOnDisappear,
      fixed = _ref.fixed,
      container = _ref.container,
      _ref$environment = _ref.environment,
      environment = _ref$environment === void 0 ? typeof window !== "undefined" ? window : undefined : _ref$environment,
      props = objectWithoutPropertiesLoose(_ref, ["children", "renderLayer", "placement", "onStyle", "isOpen", "closeOnOutsideClick", "onOutsideClick", "onDisappear", "closeOnDisappear", "fixed", "container", "environment"]);

  /**
   * Tracks trigger element and keeps it in state together with it's
   * relative/absolute positioned parent
   */
  var _useElementState = useElementState(container, fixed, environment),
      triggerRef = _useElementState[0],
      _useElementState$ = _useElementState[1],
      relativeParentElement = _useElementState$.relativeParentElement,
      triggerElement = _useElementState$.triggerElement,
      scrollParents = _useElementState$.scrollParents,
      normalTriggerRef = _useElementState[2];

  var _useStyleState = useStyleState(placement.anchor || defaultPlacement.anchor),
      styles = _useStyleState.styles,
      setStyles = _useStyleState.setStyles,
      lastStyles = _useStyleState.lastStyles,
      resetLastStyles = _useStyleState.resetLastStyles;

  var layerRef = React.useRef(null);

  var _React$useState = React.useState(false),
      isOpenInternal = _React$useState[0],
      setOpenInternal = _React$useState[1];

  var isOpen = useIsOpen(isOpenInternal, isOpenExternal);
  var handlePositioning = React.useCallback(function () {
    if (!triggerElement) {
      throw new Error("Could not find a valid reference of the trigger element. See https://www.react-laag.com/docs/togglelayer/#children for more info.");
    }

    var triggerRect = triggerElement.getBoundingClientRect();
    var result = getPositioning({
      triggerRect: triggerRect,
      layerElement: layerRef.current,
      placement: placement,
      relativeParentElement: relativeParentElement,
      scrollParents: scrollParents,
      fixed: fixed,
      environment: environment
    });

    if (!result) {
      return;
    }

    var layerRect = result.layerRect,
        styles = result.styles; // only update styles when necessary

    if (shouldUpdateStyles(lastStyles.current, styles)) {
      // is parent in control of styles? (onStyle)
      if (isSet(onStyle)) {
        lastStyles.current = styles;
        onStyle(styles.layer, styles.arrow, styles.layerSide);
      } // ... otherwise set styles internally
      else {
          setStyles(styles);
        }
    }
    /**
     * B.
     * Manage disappearance
     */


    var hasOnDisappear = isSet(onDisappear);
    var shouldCloseOnDisappear = closeOnDisappear && !isSet(isOpenExternal); // Should we respond to the layer's partial or full disappearance?
    // (trigger's disappearance when `fixed` props is set)

    if (hasOnDisappear || shouldCloseOnDisappear) {
      var allScrollParents = [].concat(scrollParents.map(function (parent) {
        return parent.getBoundingClientRect();
      }), [getWindowClientRect(environment)]);
      var partial = !doesEntireLayerFitWithinScrollParents(fixed ? triggerRect : layerRect, allScrollParents);
      var full = isLayerCompletelyInvisible(fixed ? triggerRect : layerRect, allScrollParents); // if parent is interested in diseappearance...

      if (hasOnDisappear) {
        if (partial || full) {
          onDisappear(full ? "full" : "partial");
        }
      } // ... else close accordingly
      else {
          if (closeOnDisappear === "partial" && partial) {
            setOpenInternal(false);
          }

          if (closeOnDisappear === "full" && full) {
            setOpenInternal(false);
          }
        }
    }
  }, [relativeParentElement, isOpen, triggerElement, scrollParents, fixed, placement]); // call `handlePositioning` when the layer's / trigger's
  // height and / or width changes

  var resizeObserver = useTrackElementResize(props.ResizeObserver, layerRef, triggerElement, isOpen, handlePositioning, environment); // On every render, check a few things...

  useIsomorphicLayoutEffect(function () {
    /**
     * A.
     * Ignore when render is caused by internal style change
     */
    var styleIsSetInterally = !isSet(onStyle);
    var effectBecauseOfInternalStyleChange = styles !== lastStyles.current;

    if (effectBecauseOfInternalStyleChange && styleIsSetInterally) {
      lastStyles.current = styles;
      return;
    } // reset lastStyles-ref when closed


    if (!isOpen) {
      resetLastStyles();
      return;
    }
    /**
     * B.
     * Prepare to calculate new layer style
     */
    // if (!triggerElement) {
    //   throw new Error("Please provide a valid ref to the trigger element");
    // } else if (!layerRef.current) {
    //   throw new Error("Please provide a valid ref to the layer element");
    // }


    handlePositioning();
  }); // calculate new layer style when window size changes

  useOnWindowResize(handlePositioning, environment, isOpen); // calculate new layer style when user scrolls

  useOnScroll(scrollParents, handlePositioning, environment, isOpen);
  var outsideClickRefs = React.useRef(new Set([layerRef, normalTriggerRef])); // handle clicks that are not originated from the trigger / layer
  // element

  useOutsideClick(outsideClickRefs, React.useCallback(function () {
    if (!isOpen) {
      return;
    }

    if (onOutsideClick) {
      onOutsideClick();
    }

    if (closeOnOutsideClick && !isSet(isOpenExternal)) {
      setOpenInternal(false);
    }
  }, [isOpen, setOpenInternal, isOpenExternal, onOutsideClick]));
  var containerElement = typeof container === "function" ? container() : container;
  return React.createElement(React.Fragment, null, children({
    isOpen: isOpen,
    close: function close() {
      /* istanbul ignore next */
      if (isSet(isOpenExternal)) {
        throw new Error("You cannot call `close()` while using the `isOpen` prop");
      }
      /* istanbul ignore next */


      setOpenInternal(false);
    },
    open: function open() {
      /* istanbul ignore next */
      if (isSet(isOpenExternal)) {
        throw new Error("You cannot call `open()` while using the `isOpen` prop");
      }
      /* istanbul ignore next */


      setOpenInternal(true);
    },
    toggle: function toggle() {
      /* istanbul ignore next */
      if (isSet(isOpenExternal)) {
        throw new Error("You cannot call `toggle()` while using the `isOpen` prop");
      }

      setOpenInternal(!isOpenInternal);
    },
    triggerRef: triggerRef,
    layerSide: isOpen ? styles.layerSide : null
  }), relativeParentElement && React.createElement(OutsideClickGroupProvider, {
    refs: outsideClickRefs
  }, reactDom.createPortal(renderLayer({
    layerProps: {
      ref: function ref(element) {
        if (element) {
          // observe the layer for resizing
          // it's ok to observe the same element multiple times
          // since multiple observes of same element are ignored
          resizeObserver.observe(element);
        }

        layerRef.current = element;
      },
      style: _extends_1({}, isSet(onStyle) ? EMPTY_STYLE : styles.layer, {
        position: fixed ? "fixed" : "absolute",
        willChange: "top, bottom, left, right, width, height"
      })
    },
    arrowStyle: _extends_1({}, isSet(onStyle) ? EMPTY_STYLE : styles.arrow, {
      position: "absolute",
      willChange: "top, bottom, left, right"
    }),
    isOpen: isOpen,
    layerSide: styles.layerSide,
    triggerRect: triggerElement ? triggerElement.getBoundingClientRect() : null,
    close: function close() {
      /* istanbul ignore next */
      if (isSet(isOpenExternal)) {
        throw new Error("You cannot call `close()` while using the `isOpen` prop");
      }
      /* istanbul ignore next */


      setOpenInternal(false);
    }
  }), containerElement || relativeParentElement)));
}

function getWidthBasedOnAngle(angle, size) {
  return Math.tan(angle * (Math.PI / 180)) * size;
}

function getViewBox(sizeA, sizeB, layerSide, borderWidth) {
  switch (layerSide) {
    case "bottom":
      return "0 " + -borderWidth + " " + sizeB + " " + sizeA;

    case "top":
      return "0 0 " + sizeB + " " + (sizeA + borderWidth);

    case "right":
      return -borderWidth + " 0 " + sizeA + " " + sizeB;

    case "left":
      return "0 0 " + (sizeA + borderWidth) + " " + sizeB;
  }

  return "";
}

function getTrianglePath(_ref) {
  var sizeA = _ref.sizeA,
      sizeB = _ref.sizeB,
      layerSide = _ref.layerSide,
      roundness = _ref.roundness,
      angle = _ref.angle;
  var relativeRoundness = roundness / 10 * sizeA * 2;
  var A = layerSide === "bottom" ? "0 " + sizeA : layerSide === "top" ? "0 0" : layerSide === "right" ? sizeA + " " + sizeB : "0 " + sizeB;
  var B = (layerSide === "bottom" || layerSide === "top" ? "H" : "V") + " " + (layerSide === "bottom" || layerSide === "top" ? sizeB : 0);
  var cPoint = sizeB / 2;
  var c1A = sizeB / 2 + getWidthBasedOnAngle(angle, sizeA / 8);
  var c1B = sizeA / 8;
  var C = layerSide === "bottom" ? "C " + c1A + " " + c1B + " " + (cPoint + relativeRoundness) + " 0 " + cPoint + " 0" : layerSide === "top" ? "C " + c1A + " " + (sizeA - c1B) + " " + (cPoint + relativeRoundness) + " " + sizeA + " " + cPoint + " " + sizeA : layerSide === "right" ? "C " + c1B + " " + (sizeB - c1A) + " 0 " + (cPoint - relativeRoundness) + " 0 " + cPoint : "C " + (sizeA - c1B) + " " + (sizeB - c1A) + " " + sizeA + " " + (cPoint - relativeRoundness) + " " + sizeA + " " + cPoint;
  var d1A = sizeB / 2 - getWidthBasedOnAngle(angle, sizeA / 8);
  var d1B = sizeA / 8;
  var D = layerSide === "bottom" ? "C " + (cPoint - relativeRoundness) + " 0 " + d1A + " " + d1B + " " + A : layerSide === "top" ? "C " + (cPoint - relativeRoundness) + " " + sizeA + " " + d1A + " " + (sizeA - d1B) + " " + A : layerSide === "right" ? "C 0 " + (cPoint + relativeRoundness) + " " + d1B + " " + (sizeB - d1A) + " " + A : "C" + sizeA + " " + (cPoint + relativeRoundness) + " " + (sizeA - d1B) + " " + (sizeB - d1A) + " " + A;
  return "M " + A + " " + B + " " + C + " " + D;
}

function getBorderMaskPath(_ref2) {
  var sizeA = _ref2.sizeA,
      sizeB = _ref2.sizeB,
      borderWidth = _ref2.borderWidth,
      layerSide = _ref2.layerSide,
      angle = _ref2.angle;
  var borderOffset = getWidthBasedOnAngle(angle, borderWidth);

  if (layerSide === "bottom" || layerSide === "top") {
    return "M " + borderWidth + " " + (layerSide === "bottom" ? sizeA : 0) + " H " + (sizeB - borderWidth) + " L " + (sizeB - borderWidth - borderOffset) + " " + (layerSide === "bottom" ? sizeA - borderWidth : borderWidth) + " H " + (borderOffset + borderWidth) + " Z";
  }

  return "M " + (layerSide === "right" ? sizeA : 0) + " " + borderWidth + " V " + (sizeB - borderWidth) + " L " + (layerSide === "right" ? sizeA - borderWidth : borderWidth) + " " + (sizeB - borderWidth - borderOffset) + " V " + (borderOffset + borderWidth) + " Z";
}

function Arrow(_ref3) {
  var _ref3$size = _ref3.size,
      size = _ref3$size === void 0 ? 8 : _ref3$size,
      _ref3$angle = _ref3.angle,
      angle = _ref3$angle === void 0 ? 45 : _ref3$angle,
      _ref3$borderWidth = _ref3.borderWidth,
      borderWidth = _ref3$borderWidth === void 0 ? 0 : _ref3$borderWidth,
      _ref3$borderColor = _ref3.borderColor,
      borderColor = _ref3$borderColor === void 0 ? "black" : _ref3$borderColor,
      _ref3$roundness = _ref3.roundness,
      roundness = _ref3$roundness === void 0 ? 0 : _ref3$roundness,
      _ref3$backgroundColor = _ref3.backgroundColor,
      backgroundColor = _ref3$backgroundColor === void 0 ? "white" : _ref3$backgroundColor,
      _ref3$layerSide = _ref3.layerSide,
      layerSide = _ref3$layerSide === void 0 ? "top" : _ref3$layerSide,
      _ref3$style = _ref3.style,
      style = _ref3$style === void 0 ? {} : _ref3$style;

  if (layerSide === "center") {
    return null;
  }

  var sizeA = size;
  var sizeB = getWidthBasedOnAngle(angle, size) * 2;
  return React.createElement("svg", {
    style: _extends_1({}, style, {
      transform: "translate" + (layerSide === "left" || layerSide === "right" ? "Y" : "X") + "(-50%)"
    }),
    "data-arrow": "true",
    width: layerSide === "left" || layerSide === "right" ? sizeA : sizeB,
    viewBox: getViewBox(sizeA, sizeB, layerSide, borderWidth)
  }, React.createElement("path", {
    fill: backgroundColor,
    strokeWidth: borderWidth,
    stroke: borderColor,
    d: getTrianglePath({
      angle: angle,
      layerSide: layerSide,
      roundness: roundness,
      sizeA: sizeA,
      sizeB: sizeB
    })
  }), React.createElement("path", {
    fill: backgroundColor,
    d: getBorderMaskPath({
      sizeA: sizeA,
      sizeB: sizeB,
      angle: angle,
      borderWidth: borderWidth,
      layerSide: layerSide
    })
  }));
}

function useToggleLayer(renderLayer, _ref) {
  if (_ref === void 0) {
    _ref = {};
  }

  var _ref2 = _ref,
      onStyle = _ref2.onStyle,
      closeOnOutsideClick = _ref2.closeOnOutsideClick,
      closeOnDisappear = _ref2.closeOnDisappear,
      fixed = _ref2.fixed,
      container = _ref2.container,
      _ref2$placement = _ref2.placement,
      placement = _ref2$placement === void 0 ? {} : _ref2$placement,
      _ref2$environment = _ref2.environment,
      environment = _ref2$environment === void 0 ? typeof window !== "undefined" ? window : undefined : _ref2$environment,
      props = objectWithoutPropertiesLoose(_ref2, ["onStyle", "closeOnOutsideClick", "closeOnDisappear", "fixed", "container", "placement", "environment"]);

  /**
   * Tracks trigger element and keeps it in state together with it's
   * relative/absolute positioned parent
   */
  var _useElementState = useElementState(container, fixed, environment),
      setTargetRef = _useElementState[0],
      _useElementState$ = _useElementState[1],
      relativeParentElement = _useElementState$.relativeParentElement,
      targetElement = _useElementState$.triggerElement,
      scrollParents = _useElementState$.scrollParents,
      normalTriggerRef = _useElementState[2];

  var _useStyleState = useStyleState(placement.anchor || defaultPlacement.anchor),
      styles = _useStyleState.styles,
      setStyles = _useStyleState.setStyles,
      lastStyles = _useStyleState.lastStyles,
      resetLastStyles = _useStyleState.resetLastStyles;

  var layerRef = React.useRef(null);
  var triggerRectRef = React.useRef(null);

  function getTriggerRect() {
    return typeof triggerRectRef.current === "function" ? triggerRectRef.current() : triggerRectRef.current;
  }

  var _React$useState = React.useState(false),
      isOpen = _React$useState[0],
      setOpen = _React$useState[1];

  function _close() {
    triggerRectRef.current = null;
    setOpen(false);
  }

  var handlePositioning = React.useCallback(function () {
    var triggerRect = getTriggerRect();

    if (!triggerRect) {
      return;
    }

    var result = getPositioning({
      triggerRect: triggerRect,
      layerElement: layerRef.current,
      placement: placement,
      relativeParentElement: relativeParentElement,
      scrollParents: scrollParents,
      fixed: fixed,
      environment: environment
    });

    if (!result) {
      return;
    }

    var layerRect = result.layerRect,
        styles = result.styles; // only update styles when necessary

    if (shouldUpdateStyles(lastStyles.current, styles)) {
      // is parent in control of styles? (onStyle)
      if (isSet(onStyle)) {
        lastStyles.current = styles;
        onStyle(styles.layer, styles.arrow, styles.layerSide);
      } // ... otherwise set styles internally
      else {
          setStyles(styles);
        }
    }
    /**
     * B.
     * Manage disappearance
     */
    // Should we respond to the layer's partial or full disappearance?
    // (trigger's disappearance when `fixed` props is set)


    if (closeOnDisappear) {
      var allScrollParents = [].concat(scrollParents.map(function (parent) {
        return parent.getBoundingClientRect();
      }), [getWindowClientRect(environment)]);
      var partial = !doesEntireLayerFitWithinScrollParents(fixed ? triggerRect : layerRect, allScrollParents);
      var full = isLayerCompletelyInvisible(fixed ? triggerRect : layerRect, allScrollParents);

      if (closeOnDisappear === "partial" && partial) {
        _close();
      }

      if (closeOnDisappear === "full" && full) {
        _close();
      }
    }
  }, [relativeParentElement, isOpen, targetElement, scrollParents, fixed, placement]); // call `handlePositioning` when the layer's / targets's
  // height and / or width changes

  var resizeObserver = useTrackElementResize(props.ResizeObserver, layerRef, targetElement, isOpen, handlePositioning, environment); // On every render, check a few things...

  useIsomorphicLayoutEffect(function () {
    /**
     * A.
     * Ignore when render is caused by internal style change
     */
    var styleIsSetInterally = !isSet(onStyle);
    var effectBecauseOfInternalStyleChange = styles !== lastStyles.current;

    if (effectBecauseOfInternalStyleChange && styleIsSetInterally) {
      lastStyles.current = styles;
      return;
    } // reset `lastStyles` when closed


    if (!isOpen) {
      resetLastStyles();
      return;
    }
    /**
     * B.
     * Prepare to calculate new layer style
     */


    handlePositioning();
  }); // calculate new layer style when window size changes

  useOnWindowResize(handlePositioning, environment, isOpen); // calculate new layer style when user scrolls

  useOnScroll(scrollParents, handlePositioning, environment, isOpen);
  var outsideClickRefs = React.useRef(new Set([layerRef, normalTriggerRef])); // handle clicks that are not originated from the trigger / layer
  // element

  useOutsideClick(outsideClickRefs, React.useCallback(function () {
    if (!isOpen) {
      return;
    }

    if (closeOnOutsideClick) {
      _close();
    }
  }, [isOpen, setOpen, closeOnOutsideClick]));
  var containerElement = typeof container === "function" ? container() : container;

  function open(_ref3) {
    var clientRect = _ref3.clientRect,
        target = _ref3.target;
    triggerRectRef.current = clientRect;

    if (isOpen && target === targetElement) {
      handlePositioning();
    } else {
      setTargetRef(target);
      setOpen(true);
    }
  }

  var payload = {
    isOpen: isOpen,
    close: _close,
    open: open,
    openFromContextMenuEvent: function openFromContextMenuEvent(evt) {
      evt.preventDefault();
      var target = evt.target;
      var clientRect = {
        top: evt.clientY,
        left: evt.clientX,
        bottom: evt.clientY + 1,
        right: evt.clientX + 1,
        width: 1,
        height: 1
      };
      open({
        clientRect: clientRect,
        target: target
      });
    },
    openFromMouseEvent: function openFromMouseEvent(evt) {
      var currentTarget = evt.currentTarget;

      if (!currentTarget || !currentTarget.getBoundingClientRect) {
        return;
      }

      var clientRect = function clientRect() {
        return currentTarget.getBoundingClientRect();
      };

      open({
        clientRect: clientRect,
        target: currentTarget
      });
    },
    openFromRef: function openFromRef(ref) {
      if (!ref.current) {
        console.error("Error inside useTooltip(): Expected a valid ref to a trigger element, but got " + typeof ref.current);
        return;
      }

      open({
        target: ref.current,
        clientRect: ref.current.getBoundingClientRect()
      });
    },
    openFromSelection: function openFromSelection(selection) {
      if (!selection.anchorNode || selection.isCollapsed) {
        return;
      }

      var element = getElementFromAnchorNode(selection.anchorNode);

      if (!element) {
        return;
      }

      var range = selection.getRangeAt(0);
      open({
        clientRect: function clientRect() {
          return range.getBoundingClientRect();
        },
        target: element
      });
    },
    layerSide: isOpen ? styles.layerSide : null
  };
  var element = relativeParentElement && reactDom.createPortal(renderLayer({
    layerProps: {
      ref: function ref(element) {
        if (element) {
          // observe the layer for resizing
          // it's ok to observe the same element multiple times
          // since multiple observes of same element are ignored
          resizeObserver.observe(element);
        }

        layerRef.current = element;
      },
      style: _extends_1({}, isSet(onStyle) ? EMPTY_STYLE : styles.layer, {
        position: fixed ? "fixed" : "absolute",
        willChange: "top, bottom, left, right, width, height"
      })
    },
    arrowStyle: _extends_1({}, isSet(onStyle) ? EMPTY_STYLE : styles.arrow, {
      position: "absolute",
      willChange: "top, bottom, left, right"
    }),
    isOpen: isOpen,
    layerSide: styles.layerSide,
    triggerRect: getTriggerRect(),
    close: function close() {
      _close();
    }
  }), containerElement || relativeParentElement);
  return [React.createElement(OutsideClickGroupProvider, {
    refs: outsideClickRefs
  }, element), payload];
}

function useHover(config) {
  var _ref = config || {},
      _ref$delayEnter = _ref.delayEnter,
      delayEnter = _ref$delayEnter === void 0 ? 0 : _ref$delayEnter,
      _ref$delayLeave = _ref.delayLeave,
      delayLeave = _ref$delayLeave === void 0 ? 0 : _ref$delayLeave,
      _ref$hideOnScroll = _ref.hideOnScroll,
      hideOnScroll = _ref$hideOnScroll === void 0 ? true : _ref$hideOnScroll,
      onShow = _ref.onShow,
      onHide = _ref.onHide;

  var _React$useState = React.useState(false),
      show = _React$useState[0],
      setShow = _React$useState[1];

  var timeoutRef = React.useRef(null);
  var timeoutState = React.useRef(null);
  var hasTouchMoved = React.useRef(false);

  function handleShowHide(show) {
    if (show) {
      if (onShow) {
        onShow();
      }

      setShow(true);
      return;
    }

    if (onHide) {
      onHide();
    }

    setShow(false);
  }

  function onMouseEnter() {
    // if was leaving, stop leaving
    if (timeoutState.current === "leaving" && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      timeoutState.current = null;
    }

    if (show) {
      return;
    }

    timeoutState.current = "entering";
    timeoutRef.current = setTimeout(function () {
      handleShowHide(true);
      timeoutRef.current = null;
      timeoutState.current = null;
    }, delayEnter);
  }

  function onMouseLeave() {
    // if was waiting for entering,
    // clear timeout
    if (timeoutState.current === "entering" && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!show) {
      return;
    }

    timeoutState.current = "leaving";
    timeoutRef.current = setTimeout(function () {
      handleShowHide(false);
      timeoutRef.current = null;
    }, delayLeave);
  } // make sure to clear timeout on unmount


  React.useEffect(function () {
    var to = timeoutRef.current;

    function clear() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function onScroll() {
      if (show && hideOnScroll) {
        clear();
        handleShowHide(false);
      }
    }

    function onTouchEnd() {
      if (show) {
        clear();
        handleShowHide(false);
      }
    }

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("touchend", onTouchEnd, true);
    return function () {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("touchend", onTouchEnd, true);

      if (to) {
        clearTimeout(to);
      }
    };
  }, [show, hideOnScroll]);
  var hoverProps = {
    onMouseEnter: onMouseEnter,
    onMouseLeave: onMouseLeave,
    onTouchStart: function onTouchStart() {
      hasTouchMoved.current = false;
    },
    onTouchMove: function onTouchMove() {
      hasTouchMoved.current = true;
    },
    onTouchEnd: function onTouchEnd() {
      if (!hasTouchMoved.current && !show) {
        handleShowHide(true);
      }

      hasTouchMoved.current = false;
    }
  }; // @ts-ignore

  if (onShow) {
    return hoverProps;
  }

  return [show, hoverProps];
}

function useBreakpoint(maxPixels) {
  var _React$useState = React.useState(typeof window !== "undefined" ? window.matchMedia("(max-width: " + maxPixels + "px)").matches : false),
      match = _React$useState[0],
      setMatch = _React$useState[1];

  React.useEffect(function () {
    var matcher = window.matchMedia("(max-width: " + maxPixels + "px)");

    function onMatch(evt) {
      setMatch(evt.matches);
    }

    matcher.addListener(onMatch);
    return function () {
      matcher.removeListener(onMatch);
    };
  }, [maxPixels]);
  return match;
}

function Transition(_ref) {
  var isOpenExternal = _ref.isOpen,
      children = _ref.children;

  var _React$useState = React.useState({
    isOpenInternal: isOpenExternal,
    isLeaving: false
  }),
      state = _React$useState[0],
      setState = _React$useState[1];

  var didMount = React.useRef(false);
  React.useEffect(function () {
    if (isOpenExternal) {
      setState({
        isOpenInternal: true,
        isLeaving: false
      });
    } else if (didMount.current) {
      setState({
        isOpenInternal: false,
        isLeaving: true
      });
    }
  }, [isOpenExternal, setState]);
  React.useEffect(function () {
    didMount.current = true;
  }, []);

  if (!isOpenExternal && !state.isOpenInternal && !state.isLeaving) {
    return null;
  }

  return children(state.isOpenInternal, function () {
    if (!state.isOpenInternal) {
      setState(function (s) {
        return _extends_1({}, s, {
          isLeaving: false
        });
      });
    }
  }, state.isLeaving);
}

function useTooltip(renderLayer, _ref) {
  if (_ref === void 0) {
    _ref = {};
  }

  var _ref2 = _ref,
      delayEnter = _ref2.delayEnter,
      delayLeave = _ref2.delayLeave,
      hideOnScroll = _ref2.hideOnScroll,
      rest = objectWithoutPropertiesLoose(_ref2, ["delayEnter", "delayLeave", "hideOnScroll"]);

  var triggerRef = React.useRef();

  var _useToggleLayer = useToggleLayer(renderLayer, rest),
      element = _useToggleLayer[0],
      _useToggleLayer$ = _useToggleLayer[1],
      openFromRef = _useToggleLayer$.openFromRef,
      close = _useToggleLayer$.close;

  var hoverProps = useHover({
    delayEnter: delayEnter,
    delayLeave: delayLeave,
    hideOnScroll: hideOnScroll,
    onShow: function onShow() {
      return openFromRef(triggerRef);
    },
    onHide: close
  });

  var triggerProps = _extends_1({
    ref: triggerRef
  }, hoverProps);

  return [element, triggerProps];
}

exports.ToggleLayer = ToggleLayer;
exports.Arrow = Arrow;
exports.useToggleLayer = useToggleLayer;
exports.anchor = Anchor;
exports.useHover = useHover;
exports.useBreakpoint = useBreakpoint;
exports.Transition = Transition;
exports.useTooltip = useTooltip;
//# sourceMappingURL=index.js.map
