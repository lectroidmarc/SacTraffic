/**
 * Externs file for Google Maps API v2.
 * http://bolinfest.com/javascript/maps-v2-externs.js
 *
 * @param {Node} container
 * @param {GMapOptions=} opts
 * @constructor
 */
var GMap2 = function(container, opts) {};

/**
 */
GMap2.prototype.enableDragging = function() {};

/**
 */
GMap2.prototype.disableDragging = function() {};

/**
 * @return {boolean}
 */
GMap2.prototype.draggingEnabled = function() {};

/**
 */
GMap2.prototype.enableInfoWindow = function() {};

/**
 */
GMap2.prototype.disableInfoWindow = function() {};

/**
 * @return {boolean}
 */
GMap2.prototype.infoWindowEnabled = function() {};

/**
 */
GMap2.prototype.enableDoubleClickZoom = function() {};

/**
 */
GMap2.prototype.disableDoubleClickZoom = function() {};

/**
 * @return {boolean}
 */
GMap2.prototype.doubleClickZoomEnabled = function() {};

/**
 */
GMap2.prototype.enableContinuousZoom = function() {};

/**
 */
GMap2.prototype.disableContinuousZoom = function() {};

/**
 * @return {boolean}
 */
GMap2.prototype.continuousZoomEnabled = function() {};

/**
 */
GMap2.prototype.enableGoogleBar = function() {};

/**
 */
GMap2.prototype.disableGoogleBar = function() {};

/**
 */
GMap2.prototype.enableScrollWheelZoom = function() {};

/**
 */
GMap2.prototype.disableScrollWheelZoom = function() {};

/**
 * @return {boolean}
 */
GMap2.prototype.scrollWheelZoomEnabled = function() {};

/**
 */
GMap2.prototype.enablePinchToZoom = function() {};

/**
 */
GMap2.prototype.disablePinchToZoom = function() {};

/**
 * @return {boolean}
 */
GMap2.prototype.pinchToZoomEnabled = function() {};

/**
 * @return {Object}
 */
GMap2.prototype.getDefaultUI = function() {};

/**
 */
GMap2.prototype.setUIToDefault = function() {};

/**
 * @param {GMapUIOptions} ui
 */
GMap2.prototype.setUI = function(ui) {};

/**
 * @param {GControl} control
 * @param {GControlPosition=} position
 */
GMap2.prototype.addControl = function(control, position) {};

/**
 * @param {GControl} control
 */
GMap2.prototype.removeControl = function(control) {};

/**
 * @return {Node}
 */
GMap2.prototype.getContainer = function() {};

/**
 * @return {Array.<GMapType>}
 */
GMap2.prototype.getMapTypes = function() {};

/**
 * @return {GMapType}
 */
GMap2.prototype.getCurrentMapType = function() {};

/**
 * @param {GMapType} type
 */
GMap2.prototype.setMapType = function(type) {};

/**
 * @param {GMapType} type
 */
GMap2.prototype.addMapType = function(type) {};

/**
 * @param {GMapType} type
 */
GMap2.prototype.removeMapType = function(type) {};

/**
 * @return {boolean}
 */
GMap2.prototype.isLoaded = function() {};

/**
 * @return {GLatLng}
 */
GMap2.prototype.getCenter = function() {};

/**
 * @return {GLatLngBounds}
 */
GMap2.prototype.getBounds = function() {};

/**
 * @param {GLatLngBounds} bounds
 * @return {number}
 */
GMap2.prototype.getBoundsZoomLevel = function(bounds) {};

/**
 * @return {GSize}
 */
GMap2.prototype.getSize = function() {};

/**
 * @return {number}
 */
GMap2.prototype.getZoom = function() {};

/**
 * @return {GDraggableObject}
 */
GMap2.prototype.getDragObject = function() {};

/**
 * @param {function(*)} callback
 */
GMap2.prototype.getEarthInstance = function(callback) {};

/**
 * @param {GLatLng} center
 * @param {number=} zoom
 * @param {GMapType=} type
 */
GMap2.prototype.setCenter = function(center, zoom, type) {};

/**
 * @param {GLatLng} center
 */
GMap2.prototype.panTo = function(center) {};

/**
 * @param {GSize} distance
 */
GMap2.prototype.panBy = function(distance) {};

/**
 * @param {number} dx
 * @param {number} dy
 */
GMap2.prototype.panDirection = function(dx, dy) {};

/**
 * @param {number} level
 */
GMap2.prototype.setZoom = function(level) {};

/**
 * @param {GLatLng=} latlng
 * @param {boolean=} doCenter
 * @param {boolean=} doContinuousZoom
 */
GMap2.prototype.zoomIn = function(latlng, doCenter, doContinuousZoom) {};

/**
 * @param {GLatLng=} latlng
 * @param {boolean=} doContinuousZoom
 */
GMap2.prototype.zoomOut = function(latlng, doContinuousZoom) {};

/**
 */
GMap2.prototype.savePosition = function() {};

/**
 */
GMap2.prototype.returnToSavedPosition = function() {};

/**
 */
GMap2.prototype.checkResize = function() {};

/**
 * @param {GOverlay} overlay
 */
GMap2.prototype.addOverlay = function(overlay) {};

/**
 * @param {GOverlay} overlay
 */
GMap2.prototype.removeOverlay = function(overlay) {};

/**
 */
GMap2.prototype.clearOverlays = function() {};

/**
 * @param {GMapPane} pane
 * @return {Node}
 */
GMap2.prototype.getPane = function(pane) {};

/**
 * @param {GLatLng} latlng
 * @param {Node} node
 * @param {GInfoWindowOptions=} opts
 */
GMap2.prototype.openInfoWindow = function(latlng, node, opts) {};

/**
 * @param {GLatLng} latlng
 * @param {string} html
 * @param {GInfoWindowOptions=} opts
 */
GMap2.prototype.openInfoWindowHtml = function(latlng, html, opts) {};

/**
 * @param {GLatLng} latlng
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GInfoWindowOptions=} opts
 */
GMap2.prototype.openInfoWindowTabs = function(latlng, tabs, opts) {};

/**
 * @param {GLatLng} latlng
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GInfoWindowOptions=} opts
 */
GMap2.prototype.openInfoWindowTabsHtml = function(latlng, tabs, opts) {};

/**
 * @param {GLatLng} latlng
 * @param {GInfoWindowOptions=} opts
 */
GMap2.prototype.showMapBlowup = function(latlng, opts) {};

/**
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {function(...[*]):*=} onupdate
 */
GMap2.prototype.updateInfoWindow = function(tabs, onupdate) {};

/**
 * @param {function(...[*]):*} modifier
 * @param {function(...[*]):*=} onupdate
 */
GMap2.prototype.updateCurrentTab = function(modifier, onupdate) {};

/**
 */
GMap2.prototype.closeInfoWindow = function() {};

/**
 * @return {GInfoWindow}
 */
GMap2.prototype.getInfoWindow = function() {};

/**
 * @param {GPoint} pixel
 * @return {GLatLng}
 */
GMap2.prototype.fromContainerPixelToLatLng = function(pixel) {};

/**
 * @param {GLatLng} latlng
 * @return {GPoint}
 */
GMap2.prototype.fromLatLngToContainerPixel = function(latlng) {};

/**
 * @param {GLatLng} latlng
 * @return {GPoint}
 */
GMap2.prototype.fromLatLngToDivPixel = function(latlng) {};

/**
 * @param {GPoint} pixel
 * @return {GLatLng}
 */
GMap2.prototype.fromDivPixelToLatLng = function(pixel) {};

/**
 * @param {Array.<GPoint>} points
 * @constructor
 */
var GBounds = function(points) {};

/**
 * @type {number}
 */
GBounds.prototype.minX;

/**
 * @type {number}
 */
GBounds.prototype.minY;

/**
 * @type {number}
 */
GBounds.prototype.maxX;

/**
 * @type {number}
 */
GBounds.prototype.maxY;

/**
 * @return {string}
 */
GBounds.prototype.toString = function() {};

/**
 * @param {GBounds} other
 * @return {boolean}
 */
GBounds.prototype.equals = function(other) {};

/**
 * @return {GPoint}
 */
GBounds.prototype.mid = function() {};

/**
 * @return {GPoint}
 */
GBounds.prototype.min = function() {};

/**
 * @return {GPoint}
 */
GBounds.prototype.max = function() {};

/**
 * @param {GBounds} other
 * @return {boolean}
 */
GBounds.prototype.containsBounds = function(other) {};

/**
 * @param {GPoint} point
 * @return {boolean}
 */
GBounds.prototype.containsPoint = function(point) {};

/**
 * @param {GPoint} point
 */
GBounds.prototype.extend = function(point) {};

/**
 * @return {boolean}
 */
var GBrowserIsCompatible = function() {};

/**
 * @param {Node} src
 * @param {GDraggableObjectOptions=} opts
 * @constructor
 */
var GDraggableObject = function(src, opts) {};

/**
 * @param {string} cursor
 */
GDraggableObject.setDraggableCursor = function(cursor) {};

/**
 * @param {string} cursor
 */
GDraggableObject.setDraggingCursor = function(cursor) {};

/**
 * @param {string} cursor
 */
GDraggableObject.prototype.setDraggableCursor = function(cursor) {};

/**
 * @param {string} cursor
 */
GDraggableObject.prototype.setDraggingCursor = function(cursor) {};

/**
 * @param {GPoint} point
 */
GDraggableObject.prototype.moveTo = function(point) {};

/**
 * @param {GSize} size
 */
GDraggableObject.prototype.moveBy = function(size) {};

/**
 * @constructor
 */
var GDraggableObjectOptions = function() {};

/**
 * @type {number}
 */
GDraggableObjectOptions.prototype.left;

/**
 * @type {number}
 */
GDraggableObjectOptions.prototype.top;

/**
 * @type {Node}
 */
GDraggableObjectOptions.prototype.container;

/**
 * @type {string}
 */
GDraggableObjectOptions.prototype.draggableCursor;

/**
 * @type {string}
 */
GDraggableObjectOptions.prototype.draggingCursor;

/**
 * @type {boolean}
 */
GDraggableObjectOptions.prototype.delayDrag;

/**
 * @constructor
 */
var GInfoWindow = function() {};

/**
 * @param {number} index
 */
GInfoWindow.prototype.selectTab = function(index) {};

/**
 */
GInfoWindow.prototype.hide = function() {};

/**
 */
GInfoWindow.prototype.show = function() {};

/**
 * @return {boolean}
 */
GInfoWindow.prototype.isHidden = function() {};

/**
 * @param {GLatLng} latlng
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GSize} size
 * @param {GSize=} offset
 * @param {number=} selectedTab
 */
GInfoWindow.prototype.reset = function(latlng, tabs, size, offset, selectedTab) {};

/**
 * @return {GLatLng}
 */
GInfoWindow.prototype.getPoint = function() {};

/**
 * @return {GSize}
 */
GInfoWindow.prototype.getPixelOffset = function() {};

/**
 * @return {number}
 */
GInfoWindow.prototype.getSelectedTab = function() {};

/**
 * @return {Array.<GInfoWindowTab>}
 */
GInfoWindow.prototype.getTabs = function() {};

/**
 * @return {Array.<Node>}
 */
GInfoWindow.prototype.getContentContainers = function() {};

/**
 */
GInfoWindow.prototype.enableMaximize = function() {};

/**
 */
GInfoWindow.prototype.disableMaximize = function() {};

/**
 */
GInfoWindow.prototype.maximize = function() {};

/**
 */
GInfoWindow.prototype.restore = function() {};

/**
 * @constructor
 */
var GInfoWindowOptions = function() {};

/**
 * @param {string} label
 * @param {Node|string} content
 * @constructor
 */
var GInfoWindowTab = function(label, content) {};

/**
 * @param {GMap2} map
 * @constructor
 */
var GKeyboardHandler = function(map) {};

var GLanguage = {};

/**
 * @return {string}
 */
GLanguage.getLanguageCode = function() {};

/**
 * @return {boolean}
 */
GLanguage.isRtl = function() {};

/**
 * @param {number} lat
 * @param {number} lng
 * @param {boolean=} unbounded
 * @constructor
 */
var GLatLng = function(lat, lng, unbounded) {};

/**
 * @param {string} latlng
 * @return {GLatLng}
 */
GLatLng.fromUrlValue = function(latlng) {};

/**
 * @return {number}
 */
GLatLng.prototype.lat = function() {};

/**
 * @return {number}
 */
GLatLng.prototype.lng = function() {};

/**
 * @return {number}
 */
GLatLng.prototype.latRadians = function() {};

/**
 * @return {number}
 */
GLatLng.prototype.lngRadians = function() {};

/**
 * @param {GLatLng} other
 * @return {boolean}
 */
GLatLng.prototype.equals = function(other) {};

/**
 * @param {GLatLng} other
 * @param {number=} radius
 * @return {number}
 */
GLatLng.prototype.distanceFrom = function(other, radius) {};

/**
 * @param {number=} precision
 * @return {string}
 */
GLatLng.prototype.toUrlValue = function(precision) {};

/**
 * @param {GLatLng=} sw
 * @param {GLatLng=} ne
 * @constructor
 */
var GLatLngBounds = function(sw, ne) {};

/**
 * @param {GLatLngBounds} other
 * @return {boolean}
 */
GLatLngBounds.prototype.equals = function(other) {};

/**
 * @param {GLatLng} latlng
 * @return {boolean}
 */
GLatLngBounds.prototype.containsLatLng = function(latlng) {};

/**
 * @param {GLatLngBounds} other
 * @return {boolean}
 */
GLatLngBounds.prototype.intersects = function(other) {};

/**
 * @param {GLatLngBounds} other
 * @return {boolean}
 */
GLatLngBounds.prototype.containsBounds = function(other) {};

/**
 * @param {GLatLng} latlng
 */
GLatLngBounds.prototype.extend = function(latlng) {};

/**
 * @return {GLatLng}
 */
GLatLngBounds.prototype.getSouthWest = function() {};

/**
 * @return {GLatLng}
 */
GLatLngBounds.prototype.getNorthEast = function() {};

/**
 * @return {GLatLng}
 */
GLatLngBounds.prototype.toSpan = function() {};

/**
 * @return {boolean}
 */
GLatLngBounds.prototype.isFullLat = function() {};

/**
 * @return {boolean}
 */
GLatLngBounds.prototype.isFullLng = function() {};

/**
 * @return {boolean}
 */
GLatLngBounds.prototype.isEmpty = function() {};

/**
 * @return {GLatLng}
 */
GLatLngBounds.prototype.getCenter = function() {};

var GLog = {};

/**
 * @param {string} message
 * @param {string=} color
 */
GLog.write = function(message, color) {};

/**
 * @param {string} url
 */
GLog.writeUrl = function(url) {};

/**
 * @param {string} html
 */
GLog.writeHtml = function(html) {};

/**
 * @constructor
 */
var GMapOptions = function() {};

/**
 * @type {GSize}
 */
GMapOptions.prototype.size;

/**
 * @type {Array.<GMapType>}
 */
GMapOptions.prototype.mapTypes;

/**
 * @type {string}
 */
GMapOptions.prototype.draggableCursor;

/**
 * @type {string}
 */
GMapOptions.prototype.draggingCursor;

/**
 * @type {GGoogleBarOptions}
 */
GMapOptions.prototype.googleBarOptions;

/**
 * @type {string}
 */
GMapOptions.prototype.backgroundColor;

/** @enum */
var GMapPane = {};

/**
 * @type {*}
 */
GMapPane.G_MAP_MAP_PANE;

/**
 * @type {*}
 */
GMapPane.G_MAP_OVERLAY_LAYER_PANE;

/**
 * @type {*}
 */
GMapPane.G_MAP_MARKER_SHADOW_PANE;

/**
 * @type {*}
 */
GMapPane.G_MAP_MARKER_PANE;

/**
 * @type {*}
 */
GMapPane.G_MAP_FLOAT_SHADOW_PANE;

/**
 * @type {*}
 */
GMapPane.G_MAP_MARKER_MOUSE_TARGET_PANE;

/**
 * @type {*}
 */
GMapPane.G_MAP_FLOAT_PANE;

/**
 * @param {number} x
 * @param {number} y
 * @constructor
 */
var GPoint = function(x, y) {};

/**
 * @type {number}
 */
GPoint.prototype.x;

/**
 * @type {number}
 */
GPoint.prototype.y;

/**
 * @param {GPoint} other
 * @return {boolean}
 */
GPoint.prototype.equals = function(other) {};

/**
 * @return {string}
 */
GPoint.prototype.toString = function() {};

/**
 * @type {*}
 */
GPoint.ORIGIN;

/**
 * @param {number} width
 * @param {number} height
 * @constructor
 */
var GSize = function(width, height) {};

/**
 * @type {number}
 */
GSize.prototype.width;

/**
 * @type {number}
 */
GSize.prototype.height;

/**
 * @param {GSize} other
 * @return {boolean}
 */
GSize.prototype.equals = function(other) {};

/**
 * @return {string}
 */
GSize.prototype.toString = function() {};

/**
 * @type {*}
 */
GSize.ZERO;

/**
 */
var GUnload = function() {};

var G_API_VERSION;

var GEvent = {};

/**
 * @param {Object} source
 * @param {string} event
 * @param {function(...[*]):*} handler
 * @return {GEventListener}
 */
GEvent.addListener = function(source, event, handler) {};

/**
 * @param {Node} source
 * @param {string} event
 * @param {function(...[*]):*} handler
 * @return {GEventListener}
 */
GEvent.addDomListener = function(source, event, handler) {};

/**
 * @param {GEventListener} handle
 */
GEvent.removeListener = function(handle) {};

/**
 * @param {Object|Node} source
 * @param {string} event
 */
GEvent.clearListeners = function(source, event) {};

/**
 * @param {Object|Node} source
 */
GEvent.clearInstanceListeners = function(source) {};

/**
 * @param {Node} source
 */
GEvent.clearNode = function(source) {};

/**
 * @param {Object} source
 * @param {string} event
 * @param {...*} var_args
 */
GEvent.trigger = function(source, event, var_args) {};

/**
 * @param {Object} source
 * @param {string} event
 * @param {Object} object
 * @param {function(...[*]):*} method
 * @return {GEventListener}
 */
GEvent.bind = function(source, event, object, method) {};

/**
 * @param {Node} source
 * @param {string} event
 * @param {Object} object
 * @param {function(...[*]):*} method
 * @return {GEventListener}
 */
GEvent.bindDom = function(source, event, object, method) {};

/**
 * @param {Object} object
 * @param {function(...[*]):*} method
 * @return {function(...[*]):*}
 */
GEvent.callback = function(object, method) {};

/**
 * @param {Object} object
 * @param {function(...[*]):*} method
 * @param {...*} var_args
 * @return {function(...[*]):*}
 */
GEvent.callbackArgs = function(object, method, var_args) {};

/**
 * @constructor
 */
var GEventListener = function() {};

/**
 * @param {boolean=} printable
 * @param {boolean=} selectable
 * @constructor
 */
var GControl = function(printable, selectable) {};

/**
 * @return {boolean}
 */
GControl.prototype.printable = function() {};

/**
 * @return {boolean}
 */
GControl.prototype.selectable = function() {};

/**
 * @param {GMap2} map
 * @return {Node}
 */
GControl.prototype.initialize = function(map) {};

/**
 * @return {GControlPosition}
 */
GControl.prototype.getDefaultPosition = function() {};

/** @enum */
var GControlAnchor = {};

/**
 * @type {*}
 */
GControlAnchor.G_ANCHOR_TOP_RIGHT;

/**
 * @type {*}
 */
GControlAnchor.G_ANCHOR_TOP_LEFT;

/**
 * @type {*}
 */
GControlAnchor.G_ANCHOR_BOTTOM_RIGHT;

/**
 * @type {*}
 */
GControlAnchor.G_ANCHOR_BOTTOM_LEFT;

/**
 * @param {GControlAnchor} anchor
 * @param {GSize} offset
 * @constructor
 */
var GControlPosition = function(anchor, offset) {};

/**
 * @constructor
 */
var GHierarchicalMapTypeControl = function() {};

/**
 * @param {GMapType} parentType
 * @param {GMapType} childType
 * @param {string=} childText
 * @param {boolean=} isDefault
 */
GHierarchicalMapTypeControl.prototype.addRelationship = function(parentType, childType, childText, isDefault) {};

/**
 * @param {GMapType} mapType
 */
GHierarchicalMapTypeControl.prototype.removeRelationship = function(mapType) {};

/**
 */
GHierarchicalMapTypeControl.prototype.clearRelationships = function() {};

/**
 * @param {Array.<GTileLayer>} layers
 * @param {GProjection} projection
 * @param {string} name
 * @param {GMapTypeOptions=} opts
 * @constructor
 */
var GMapType = function(layers, projection, name, opts) {};

/**
 * @param {GLatLng} center
 * @param {GLatLng} span
 * @param {GSize} viewSize
 * @return {number}
 */
GMapType.prototype.getSpanZoomLevel = function(center, span, viewSize) {};

/**
 * @param {GLatLngBounds} bounds
 * @param {GSize} viewSize
 */
GMapType.prototype.getBoundsZoomLevel = function(bounds, viewSize) {};

/**
 * @param {boolean=} short
 * @return {string}
 */
GMapType.prototype.getName = function() {};

/**
 * @return {GProjection}
 */
GMapType.prototype.getProjection = function() {};

/**
 * @return {number}
 */
GMapType.prototype.getTileSize = function() {};

/**
 * @return {Array.<GTileLayer>}
 */
GMapType.prototype.getTileLayers = function() {};

/**
 * @return {number}
 */
GMapType.prototype.getMinimumResolution = function() {};

/**
 * @return {number}
 */
GMapType.prototype.getMaximumResolution = function() {};

/**
 * @param {GLatLng} latlng
 * @param {function(...[*]):*} callback
 * @param {number} opt_targetZoom
 */
GMapType.prototype.getMaxZoomAtLatLng = function(latlng, callback, opt_targetZoom) {};

/**
 * @return {string}
 */
GMapType.prototype.getTextColor = function() {};

/**
 * @return {string}
 */
GMapType.prototype.getLinkColor = function() {};

/**
 * @return {string}
 */
GMapType.prototype.getErrorMessage = function() {};

/**
 * @param {GLatLngBounds} bounds
 * @param {number} zoom
 * @return {Array.<string>}
 */
GMapType.prototype.getCopyrights = function(bounds, zoom) {};

/**
 * @return {string}
 */
GMapType.prototype.getUrlArg = function() {};

/**
 * @return {string}
 */
GMapType.prototype.getAlt = function() {};

/**
 * @type {*}
 */
GMapType.G_NORMAL_MAP;

/**
 * @type {*}
 */
GMapType.G_SATELLITE_MAP;

/**
 * @type {*}
 */
GMapType.G_HYBRID_MAP;

/**
 * @type {*}
 */
GMapType.G_PHYSICAL_MAP;

/**
 * @type {*}
 */
GMapType.G_MAPMAKER_NORMAL_MAP;

/**
 * @type {*}
 */
GMapType.G_MAPMAKER_HYBRID_MAP;

/**
 * @type {*}
 */
GMapType.G_MOON_ELEVATION_MAP;

/**
 * @type {*}
 */
GMapType.G_MOON_VISIBLE_MAP;

/**
 * @type {*}
 */
GMapType.G_MARS_ELEVATION_MAP;

/**
 * @type {*}
 */
GMapType.G_MARS_VISIBLE_MAP;

/**
 * @type {*}
 */
GMapType.G_MARS_INFRARED_MAP;

/**
 * @type {*}
 */
GMapType.G_SKY_VISIBLE_MAP;

/**
 * @type {*}
 */
GMapType.G_SATELLITE_3D_MAP;

/**
 * @type {*}
 */
GMapType.G_DEFAULT_MAP_TYPES;

/**
 * @type {*}
 */
GMapType.G_MAPMAKER_MAP_TYPES;

/**
 * @type {*}
 */
GMapType.G_MOON_MAP_TYPES;

/**
 * @type {*}
 */
GMapType.G_MARS_MAP_TYPES;

/**
 * @type {*}
 */
GMapType.G_SKY_MAP_TYPES;

/**
 * @param {boolean=} useShortNames
 * @constructor
 */
var GMapTypeControl = function(useShortNames) {};

/**
 * @constructor
 */
var GMapTypeOptions = function() {};

/**
 * @type {string}
 */
GMapTypeOptions.prototype.shortName;

/**
 * @type {string}
 */
GMapTypeOptions.prototype.urlArg;

/**
 * @type {number}
 */
GMapTypeOptions.prototype.maxResolution;

/**
 * @type {number}
 */
GMapTypeOptions.prototype.minResolution;

/**
 * @type {number}
 */
GMapTypeOptions.prototype.tileSize;

/**
 * @type {string}
 */
GMapTypeOptions.prototype.textColor;

/**
 * @type {string}
 */
GMapTypeOptions.prototype.linkColor;

/**
 * @type {string}
 */
GMapTypeOptions.prototype.errorMessage;

/**
 * @type {string}
 */
GMapTypeOptions.prototype.alt;

/**
 * @type {number}
 */
GMapTypeOptions.prototype.radius;

/**
 * @param {GSize} opt_size
 * @constructor
 */
var GMapUIOptions = function(opt_size) {};

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.maptypes.normal;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.maptypes.satellite;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.maptypes.hybrid;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.maptypes.physical;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.zoom.scrollwheel;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.zoom.doubleclick;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.keyboard;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.controls.largemapcontrol3d;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.controls.smallzoomcontrol3d;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.controls.maptypecontrol;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.controls.menumaptypecontrol;

/**
 * @type {boolean}
 */
GMapUIOptions.prototype.controls.scalecontrol;

/**
 * @param {boolean=} useShortNames
 * @constructor
 */
var GMenuMapTypeControl = function(useShortNames) {};

/**
 * @constructor
 */
var GNavLabelControl = function() {};

/**
 * @param {number} level
 */
GNavLabelControl.prototype.setMinAddressLinkLevel = function(level) {};

/**
 * @param {number} id
 * @param {GLatLngBounds} bounds
 * @param {number} minZoom
 * @param {string} text
 * @constructor
 */
var GCopyright = function(id, bounds, minZoom, text) {};

/**
 * @type {number}
 */
GCopyright.prototype.id;

/**
 * @type {number}
 */
GCopyright.prototype.minZoom;

/**
 * @type {GLatLngBounds}
 */
GCopyright.prototype.bounds;

/**
 * @type {string}
 */
GCopyright.prototype.text;

/**
 * @param {string=} prefix
 * @constructor
 */
var GCopyrightCollection = function(prefix) {};

/**
 * @param {GCopyright} copyright
 */
GCopyrightCollection.prototype.addCopyright = function(copyright) {};

/**
 * @param {GLatLngBounds} bounds
 * @param {number} zoom
 * @return {Array.<string>}
 */
GCopyrightCollection.prototype.getCopyrights = function(bounds, zoom) {};

/**
 * @param {GLatLngBounds} bounds
 * @param {number} zoom
 * @return {string}
 */
GCopyrightCollection.prototype.getCopyrightNotice = function(bounds, zoom) {};

/**
 * @param {string} imageUrl
 * @param {GLatLngBounds} bounds
 * @constructor
 */
var GGroundOverlay = function(imageUrl, bounds) {};

/**
 */
GGroundOverlay.prototype.hide = function() {};

/**
 * @return {boolean}
 */
GGroundOverlay.prototype.isHidden = function() {};

/**
 */
GGroundOverlay.prototype.show = function() {};

/**
 * @return {boolean}
 */
GGroundOverlay.prototype.supportsHide = function() {};

/**
 * @param {GIcon=} copy
 * @param {string=} image
 * @constructor
 */
var GIcon = function(copy, image) {};

/**
 * @type {string}
 */
GIcon.prototype.image;

/**
 * @type {string}
 */
GIcon.prototype.shadow;

/**
 * @type {GSize}
 */
GIcon.prototype.iconSize;

/**
 * @type {GSize}
 */
GIcon.prototype.shadowSize;

/**
 * @type {GPoint}
 */
GIcon.prototype.iconAnchor;

/**
 * @type {GPoint}
 */
GIcon.prototype.infoWindowAnchor;

/**
 * @type {string}
 */
GIcon.prototype.printImage;

/**
 * @type {string}
 */
GIcon.prototype.mozPrintImage;

/**
 * @type {string}
 */
GIcon.prototype.printShadow;

/**
 * @type {string}
 */
GIcon.prototype.transparent;

/**
 * @type {Array.<number>}
 */
GIcon.prototype.imageMap;

/**
 * @type {number}
 */
GIcon.prototype.maxHeight;

/**
 * @type {string}
 */
GIcon.prototype.dragCrossImage;

/**
 * @type {GSize}
 */
GIcon.prototype.dragCrossSize;

/**
 * @type {GPoint}
 */
GIcon.prototype.dragCrossAnchor;

/**
 * @type {*}
 */
GIcon.G_DEFAULT_ICON;

/**
 * @param {string} layerId
 * @constructor
 */
var GLayer = function(layerId) {};

/**
 * @param {string} layerId
 */
GLayer.isHidden = function(layerId) {};

/**
 */
GLayer.prototype.hide = function() {};

/**
 */
GLayer.prototype.show = function() {};

/**
 * @param {GLatLng} latlng
 * @param {GIcon=} icon
 * @param {boolean=} inert
 * @constructor
 */
var GMarker = function(latlng, icon, inert) {};

/**
 * @param {Node} content
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.openInfoWindow = function(content, opts) {};

/**
 * @param {string} content
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.openInfoWindowHtml = function(content, opts) {};

/**
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.openInfoWindowTabs = function(tabs, opts) {};

/**
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.openInfoWindowTabsHtml = function(tabs, opts) {};

/**
 * @param {Node} content
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.bindInfoWindow = function(content, opts) {};

/**
 * @param {string} content
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.bindInfoWindowHtml = function(content, opts) {};

/**
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.bindInfoWindowTabs = function(tabs, opts) {};

/**
 * @param {Array.<GInfoWindowTab>} tabs
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.bindInfoWindowTabsHtml = function(tabs, opts) {};

/**
 */
GMarker.prototype.closeInfoWindow = function() {};

/**
 * @param {GInfoWindowOptions=} opts
 */
GMarker.prototype.showMapBlowup = function(opts) {};

/**
 * @return {GIcon}
 */
GMarker.prototype.getIcon = function() {};

/**
 * @return {string}
 */
GMarker.prototype.getTitle = function() {};

/**
 * @return {GLatLng}
 */
GMarker.prototype.getLatLng = function() {};

/**
 * @param {GLatLng} latlng
 */
GMarker.prototype.setLatLng = function(latlng) {};

/**
 */
GMarker.prototype.enableDragging = function() {};

/**
 */
GMarker.prototype.disableDragging = function() {};

/**
 * @return {boolean}
 */
GMarker.prototype.draggable = function() {};

/**
 * @return {boolean}
 */
GMarker.prototype.draggingEnabled = function() {};

/**
 * @param {string} url
 */
GMarker.prototype.setImage = function(url) {};

/**
 */
GMarker.prototype.hide = function() {};

/**
 */
GMarker.prototype.show = function() {};

/**
 * @return {boolean}
 */
GMarker.prototype.isHidden = function() {};

/**
 * @param {GMap2} map
 * @param {GMarkerManagerOptions=} opts
 * @constructor
 */
var GMarkerManager = function(map, opts) {};

/**
 * @param {Array.<GMarker>} markers
 * @param {number} minZoom
 * @param {number=} maxZoom
 */
GMarkerManager.prototype.addMarkers = function(markers, minZoom, maxZoom) {};

/**
 * @param {GMarker} marker
 * @param {number} minZoom
 * @param {number=} maxZoom
 */
GMarkerManager.prototype.addMarker = function(marker, minZoom, maxZoom) {};

/**
 */
GMarkerManager.prototype.refresh = function() {};

/**
 * @param {number} zoom
 * @return {number}
 */
GMarkerManager.prototype.getMarkerCount = function(zoom) {};

/**
 * @constructor
 */
var GMarkerManagerOptions = function() {};

/**
 * @type {number}
 */
GMarkerManagerOptions.prototype.borderPadding;

/**
 * @type {number}
 */
GMarkerManagerOptions.prototype.maxZoom;

/**
 * @type {boolean}
 */
GMarkerManagerOptions.prototype.trackMarkers;

/**
 * @constructor
 */
var GMarkerOptions = function() {};

/**
 * @param {number} zoomlevels
 * @constructor
 */
var GMercatorProjection = function(zoomlevels) {};

/**
 * @param {GLatLng} latlng
 * @param {number} zoom
 * @return {GPoint}
 */
GMercatorProjection.prototype.fromLatLngToPixel = function(latlng, zoom) {};

/**
 * @param {GPoint} pixel
 * @param {number} zoom
 * @param {boolean=} unbounded
 * @return {GLatLng}
 */
GMercatorProjection.prototype.fromPixelToLatLng = function(pixel, zoom, unbounded) {};

/**
 * @param {GPoint} tile
 * @param {number} zoom
 * @param {number} tilesize
 */
GMercatorProjection.prototype.tileCheckRange = function(tile, zoom, tilesize) {};

/**
 * @param {number} zoom
 */
GMercatorProjection.prototype.getWrapWidth = function(zoom) {};

/**
 * @constructor
 */
var GOverlay = function() {};

/**
 * @param {number} latitude
 * @return {number}
 */
GOverlay.getZIndex = function(latitude) {};

/**
 * @constructor
 */
var GPolyEditingOptions = function() {};

/**
 * @constructor
 */
var GPolyStyleOptions = function() {};

/**
 * @param {Array.<GLatLng>} latlngs
 * @param {string=} strokeColor
 * @param {number=} strokeWeight
 * @param {number=} strokeOpacity
 * @param {number=} fillColor
 * @param {number=} fillOpacity
 * @param {GPolygonOptions=} opts
 * @constructor
 */
var GPolygon = function(latlngs, strokeColor, strokeWeight, strokeOpacity, fillColor, fillOpacity, opts) {};

/**
 * @param {Array.<Object>} polylines
 * @param {boolean=} fill
 * @param {string=} color
 * @param {number=} opacity
 * @param {boolean=} outline
 * @return {GPolygon}
 */
GPolygon.fromEncoded = function(polylines, fill, color, opacity, outline) {};

/**
 * @param {number} index
 */
GPolygon.prototype.deleteVertex = function(index) {};

/**
 */
GPolygon.prototype.disableEditing = function() {};

/**
 * @param {GPolyEditingOptions=} opts
 */
GPolygon.prototype.enableDrawing = function(opts) {};

/**
 * @param {GPolyEditingOptions=} opts
 */
GPolygon.prototype.enableEditing = function(opts) {};

/**
 * @return {number}
 */
GPolygon.prototype.getVertexCount = function() {};

/**
 * @param {number} index
 * @return {GLatLng}
 */
GPolygon.prototype.getVertex = function(index) {};

/**
 * @return {number}
 */
GPolygon.prototype.getArea = function() {};

/**
 * @return {GLatLngBounds}
 */
GPolygon.prototype.getBounds = function() {};

/**
 */
GPolygon.prototype.hide = function() {};

/**
 * @param {number} index
 * @param {GLatLng} latlng
 */
GPolygon.prototype.insertVertex = function(index, latlng) {};

/**
 * @return {boolean}
 */
GPolygon.prototype.isHidden = function() {};

/**
 */
GPolygon.prototype.show = function() {};

/**
 * @return {boolean}
 */
GPolygon.prototype.supportsHide = function() {};

/**
 * @param {GPolyStyleOptions} style
 */
GPolygon.prototype.setFillStyle = function(style) {};

/**
 * @param {GPolyStyleOptions} style
 */
GPolygon.prototype.setStrokeStyle = function(style) {};

/**
 * @constructor
 */
var GPolygonOptions = function() {};

/**
 * @param {Array.<GLatLng>} latlngs
 * @param {string=} color
 * @param {number=} weight
 * @param {number=} opacity
 * @param {GPolylineOptions=} opts
 * @constructor
 */
var GPolyline = function(latlngs, color, weight, opacity, opts) {};

/**
 * @param {string=} color
 * @param {number=} weight
 * @param {number=} opacity
 * @param {string} latlngs
 * @param {number} zoomFactor
 * @param {string} levels
 * @param {number} numLevels
 * @return {GPolyline}
 */
GPolyline.fromEncoded = function(color, weight, opacity, latlngs, zoomFactor, levels, numLevels) {};

/**
 * @param {number} index
 */
GPolyline.prototype.deleteVertex = function(index) {};

/**
 */
GPolyline.prototype.disableEditing = function() {};

/**
 * @param {GPolyEditingOptions=} opts
 */
GPolyline.prototype.enableDrawing = function(opts) {};

/**
 * @param {GPolyEditingOptions=} opts
 */
GPolyline.prototype.enableEditing = function(opts) {};

/**
 * @return {number}
 */
GPolyline.prototype.getVertexCount = function() {};

/**
 * @param {number} index
 * @return {GLatLng}
 */
GPolyline.prototype.getVertex = function(index) {};

/**
 * @return {number}
 */
GPolyline.prototype.getLength = function() {};

/**
 * @return {GLatLngBounds}
 */
GPolyline.prototype.getBounds = function() {};

/**
 */
GPolyline.prototype.hide = function() {};

/**
 * @param {number} index
 * @param {GLatLng} latlng
 */
GPolyline.prototype.insertVertex = function(index, latlng) {};

/**
 * @return {boolean}
 */
GPolyline.prototype.isHidden = function() {};

/**
 */
GPolyline.prototype.show = function() {};

/**
 * @return {boolean}
 */
GPolyline.prototype.supportsHide = function() {};

/**
 * @param {GPolyStyleOptions} style
 */
GPolyline.prototype.setStrokeStyle = function(style) {};

/**
 * @constructor
 */
var GPolylineOptions = function() {};

/**
 * @constructor
 */
var GProjection = function() {};

/**
 * @param {GLatLng} latlng
 * @param {number} zoom
 * @return {GPoint}
 */
GProjection.prototype.fromLatLngToPixel = function(latlng, zoom) {};

/**
 * @param {GPoint} pixel
 * @param {number} zoom
 * @param {boolean=} unbounded
 * @return {GLatLng}
 */
GProjection.prototype.fromPixelToLatLng = function(pixel, zoom, unbounded) {};

/**
 * @param {GPoint} tile
 * @param {number} zoom
 * @param {number} tilesize
 * @return {boolean}
 */
GProjection.prototype.tileCheckRange = function(tile, zoom, tilesize) {};

/**
 * @param {number} zoom
 * @return {number}
 */
GProjection.prototype.getWrapWidth = function(zoom) {};

/**
 * @param {string} imageUrl
 * @param {GScreenPoint} screenXY
 * @param {GScreenPoint} overlayXY
 * @param {GScreenSize} size
 * @constructor
 */
var GScreenOverlay = function(imageUrl, screenXY, overlayXY, size) {};

/**
 */
GScreenOverlay.prototype.hide = function() {};

/**
 * @return {boolean}
 */
GScreenOverlay.prototype.isHidden = function() {};

/**
 */
GScreenOverlay.prototype.show = function() {};

/**
 * @return {boolean}
 */
GScreenOverlay.prototype.supportsHide = function() {};

/**
 * @param {number} x
 * @param {number} y
 * @param {string=} xunits
 * @param {string=} yunits
 * @constructor
 */
var GScreenPoint = function(x, y, xunits, yunits) {};

/**
 * @type {number}
 */
GScreenPoint.prototype.x;

/**
 * @type {number}
 */
GScreenPoint.prototype.y;

/**
 * @type {string}
 */
GScreenPoint.prototype.xunits;

/**
 * @type {string}
 */
GScreenPoint.prototype.yunits;

/**
 * @param {number} width
 * @param {number} height
 * @param {string=} xunits
 * @param {string=} yunits
 * @constructor
 */
var GScreenSize = function(width, height, xunits, yunits) {};

/**
 * @type {number}
 */
GScreenSize.prototype.width;

/**
 * @type {number}
 */
GScreenSize.prototype.height;

/**
 * @type {string}
 */
GScreenSize.prototype.xunits;

/**
 * @type {string}
 */
GScreenSize.prototype.yunits;

/**
 * @param {GCopyrightCollection} copyrights
 * @param {number} minResolution
 * @param {number} maxResolution
 * @param {GTileLayerOptions=} options
 * @constructor
 */
var GTileLayer = function(copyrights, minResolution, maxResolution, options) {};

/**
 * @return {number}
 */
GTileLayer.prototype.minResolution = function() {};

/**
 * @return {number}
 */
GTileLayer.prototype.maxResolution = function() {};

/**
 * @param {GPoint} tile
 * @param {number} zoom
 * @return {string}
 */
GTileLayer.prototype.getTileUrl = function(tile, zoom) {};

/**
 * @return {boolean}
 */
GTileLayer.prototype.isPng = function() {};

/**
 * @return {number}
 */
GTileLayer.prototype.getOpacity = function() {};

/**
 * @param {GLatLngBounds} bounds
 * @param {number} zoom
 * @return {string}
 */
GTileLayer.prototype.getCopyright = function(bounds, zoom) {};

/**
 * @constructor
 */
var GTileLayerOptions = function() {};

/**
 * @type {number}
 */
GTileLayerOptions.prototype.opacity;

/**
 * @type {boolean}
 */
GTileLayerOptions.prototype.isPng;

/**
 * @type {string}
 */
GTileLayerOptions.prototype.tileUrlTemplate;

/**
 * @type {string}
 */
GTileLayerOptions.prototype.draggingCursor;

/**
 * @param {GTileLayer} tileLayer
 * @param {GTileLayerOverlayOptions=} opts
 * @constructor
 */
var GTileLayerOverlay = function(tileLayer, opts) {};

/**
 */
GTileLayerOverlay.prototype.hide = function() {};

/**
 */
GTileLayerOverlay.prototype.isHidden = function() {};

/**
 */
GTileLayerOverlay.prototype.show = function() {};

/**
 */
GTileLayerOverlay.prototype.refresh = function() {};

/**
 */
GTileLayerOverlay.prototype.supportsHide = function() {};

/**
 */
GTileLayerOverlay.prototype.getTileLayer = function() {};

/**
 * @constructor
 */
var GTileLayerOverlayOptions = function() {};

/**
 * @type {number}
 */
GTileLayerOverlayOptions.prototype.zPriority;

/**
 * @param {GMap2} map
 * @param {string} publisherId
 * @param {GAdsManagerOptions=} adsManagerOptions
 * @constructor
 */
var GAdsManager = function(map, publisherId, adsManagerOptions) {};

/**
 */
GAdsManager.prototype.enable = function() {};

/**
 */
GAdsManager.prototype.disable = function() {};

/**
 * @constructor
 */
var GAdsManagerOptions = function() {};

/**
 * @type {GAdsManagerStyle}
 */
GAdsManagerOptions.prototype.style;

/**
 * @type {number}
 */
GAdsManagerOptions.prototype.maxAdsOnMap;

/**
 * @type {number}
 */
GAdsManagerOptions.prototype.channel;

/**
 * @type {number}
 */
GAdsManagerOptions.prototype.minZoomLevel;

/**
 * @type {GControlPosition}
 */
GAdsManagerOptions.prototype.position;

/** @enum */
var GAdsManagerStyle = {};

/**
 * @type {*}
 */
GAdsManagerStyle.G_ADSMANAGER_STYLE_ADUNIT;

/**
 * @type {*}
 */
GAdsManagerStyle.G_ADSMANAGER_STYLE_ICON;

/**
 * @param {GGeocodeCache=} cache
 * @constructor
 */
var GClientGeocoder = function(cache) {};

/**
 * @param {string} address
 * @param {function(...[*]):*} callback
 */
GClientGeocoder.prototype.getLatLng = function(address, callback) {};

/**
 * @return {GGeocodeCache}
 */
GClientGeocoder.prototype.getCache = function() {};

/**
 * @param {GGeocodeCache} cache
 */
GClientGeocoder.prototype.setCache = function(cache) {};

/**
 * @param {GLatLngBounds} bounds
 */
GClientGeocoder.prototype.setViewport = function(bounds) {};

/**
 * @return {GLatLngBounds}
 */
GClientGeocoder.prototype.getViewport = function() {};

/**
 * @param {string} countryCode
 */
GClientGeocoder.prototype.setBaseCountryCode = function(countryCode) {};

/**
 * @return {string}
 */
GClientGeocoder.prototype.getBaseCountryCode = function() {};

/**
 */
GClientGeocoder.prototype.reset = function() {};

/**
 * @param {string|GLatLng} input
 * @param {function(...[*]):*} callback
 */
GClientGeocoder.prototype.getLocations = function(input, callback) {};

/**
 * @param {GMap2=} map
 * @param {Element=} panel
 * @constructor
 */
var GDirections = function(map, panel) {};

/**
 * @param {string} query
 * @param {GDirectionsOptions=} queryOpts
 */
GDirections.prototype.load = function(query, queryOpts) {};

/**
 * @param {Array} waypoints
 * @param {GDirectionsOptions=} queryOpts
 */
GDirections.prototype.loadFromWaypoints = function(waypoints, queryOpts) {};

/**
 */
GDirections.prototype.clear = function() {};

/**
 * @return {Object}
 */
GDirections.prototype.getStatus = function() {};

/**
 * @return {GLatLngBounds}
 */
GDirections.prototype.getBounds = function() {};

/**
 * @return {number}
 */
GDirections.prototype.getNumRoutes = function() {};

/**
 * @param {number} i
 * @return {GRoute}
 */
GDirections.prototype.getRoute = function(i) {};

/**
 * @return {number}
 */
GDirections.prototype.getNumGeocodes = function() {};

/**
 * @param {number} i
 * @return {Object}
 */
GDirections.prototype.getGeocode = function(i) {};

/**
 * @return {string}
 */
GDirections.prototype.getCopyrightsHtml = function() {};

/**
 * @return {string}
 */
GDirections.prototype.getSummaryHtml = function() {};

/**
 * @return {Object}
 */
GDirections.prototype.getDistance = function() {};

/**
 * @return {Object}
 */
GDirections.prototype.getDuration = function() {};

/**
 * @return {GPolyline}
 */
GDirections.prototype.getPolyline = function() {};

/**
 * @param {number} i
 * @return {GMarker}
 */
GDirections.prototype.getMarker = function(i) {};

/**
 * @constructor
 */
var GDirectionsOptions = function() {};

/**
 * @type {string}
 */
GDirectionsOptions.prototype.locale;

/**
 * @type {GTravelModes}
 */
GDirectionsOptions.prototype.travelMode;

/**
 * @type {boolean}
 */
GDirectionsOptions.prototype.avoidHighways;

/**
 * @type {boolean}
 */
GDirectionsOptions.prototype.getPolyline;

/**
 * @type {boolean}
 */
GDirectionsOptions.prototype.getSteps;

/**
 * @type {boolean}
 */
GDirectionsOptions.prototype.preserveViewport;

/**
 * @param {string} url
 * @param {function(...[*]):*} onload
 * @param {string=} postBody
 * @param {string=} postContentType
 */
var GDownloadUrl = function(url, onload, postBody, postContentType) {};

/**
 * @constructor
 */
var GFactualGeocodeCache = function() {};

/**
 * @param {Object} reply
 * @return {boolean}
 */
GFactualGeocodeCache.prototype.isCachable = function(reply) {};

/** @enum */
var GGeoAddressAccuracy = {};

/** @enum */
var GGeoStatusCode = {};

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_SUCCESS= 200;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_BAD_REQUEST= 400;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_SERVER_ERROR= 500;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_MISSING_QUERY= 601;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_MISSING_ADDRESS= 601;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_UNKNOWN_ADDRESS= 602;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_UNAVAILABLE_ADDRESS= 603;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_UNKNOWN_DIRECTIONS= 604;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_BAD_KEY= 610;

/**
 * @type {*}
 */
GGeoStatusCode.G_GEO_TOO_MANY_QUERIES= 620;

/**
 * @param {string} urlOfXml
 * @param {function(...[*]):*=} callback
 * @constructor
 */
var GGeoXml = function(urlOfXml, callback) {};

/**
 * @return {GLatLng}
 */
GGeoXml.prototype.getDefaultCenter = function() {};

/**
 * @return {GLatLng}
 */
GGeoXml.prototype.getDefaultSpan = function() {};

/**
 * @return {GLatLngBounds}
 */
GGeoXml.prototype.getDefaultBounds = function() {};

/**
 * @param {GMap2} map
 */
GGeoXml.prototype.gotoDefaultViewport = function(map) {};

/**
 * @return {boolean}
 */
GGeoXml.prototype.hasLoaded = function() {};

/**
 */
GGeoXml.prototype.hide = function() {};

/**
 * @return {boolean}
 */
GGeoXml.prototype.isHidden = function() {};

/**
 */
GGeoXml.prototype.show = function() {};

/**
 * @return {boolean}
 */
GGeoXml.prototype.supportsHide = function() {};

/**
 * @constructor
 */
var GGeocodeCache = function() {};

/**
 * @param {string} address
 * @return {Object}
 */
GGeocodeCache.prototype.get = function(address) {};

/**
 * @param {Object} reply
 * @return {boolean}
 */
GGeocodeCache.prototype.isCachable = function(reply) {};

/**
 * @param {string} address
 * @param {Object} reply
 */
GGeocodeCache.prototype.put = function(address, reply) {};

/**
 */
GGeocodeCache.prototype.reset = function() {};

/**
 * @param {string} address
 * @return {string}
 */
GGeocodeCache.prototype.toCanonical = function(address) {};

/**
 * @constructor
 */
var GGoogleBar = function() {};

/**
 * @constructor
 */
var GGoogleBarAdsOptions = function() {};

/**
 * @type {string}
 */
GGoogleBarAdsOptions.prototype.client;

/**
 * @type {string}
 */
GGoogleBarAdsOptions.prototype.channel;

/**
 * @type {string}
 */
GGoogleBarAdsOptions.prototype.adsafe;

/**
 * @type {string}
 */
GGoogleBarAdsOptions.prototype.language;

/** @enum */
var GGoogleBarLinkTarget = {};

/**
 * @type {*}
 */
GGoogleBarLinkTarget.G_GOOGLEBAR_LINK_TARGET_BLANK;

/**
 * @type {*}
 */
GGoogleBarLinkTarget.G_GOOGLEBAR_LINK_TARGET_PARENT;

/**
 * @type {*}
 */
GGoogleBarLinkTarget.G_GOOGLEBAR_LINK_TARGET_SELF;

/**
 * @type {*}
 */
GGoogleBarLinkTarget.G_GOOGLEBAR_LINK_TARGET_TOP;

/** @enum */
var GGoogleBarListingTypes = {};

/**
 * @type {*}
 */
GGoogleBarListingTypes.G_GOOGLEBAR_TYPE_BLENDED_RESULTS;

/**
 * @type {*}
 */
GGoogleBarListingTypes.G_GOOGLEBAR_TYPE_KMLONLY_RESULTS;

/**
 * @type {*}
 */
GGoogleBarListingTypes.G_GOOGLEBAR_TYPE_LOCALONLY_RESULTS;

/**
 * @constructor
 */
var GGoogleBarOptions = function() {};

/**
 * @type {boolean}
 */
GGoogleBarOptions.prototype.showOnLoad;

/**
 * @type {string}
 */
GGoogleBarOptions.prototype.style;

/**
 * @type {GGoogleBarAdsOptions}
 */
GGoogleBarOptions.prototype.adsOptions;

/**
 * @type {GGoogleBarLinkTarget}
 */
GGoogleBarOptions.prototype.linkTarget;

/**
 * @type {GGoogleBarListingTypes}
 */
GGoogleBarOptions.prototype.listingTypes;

/**
 * @type {GGoogleBarResultList|Element}
 */
GGoogleBarOptions.prototype.resultList;

/**
 * @type {boolean}
 */
GGoogleBarOptions.prototype.suppressInitialResultSelection;

/**
 * @type {boolean}
 */
GGoogleBarOptions.prototype.suppressZoomToBounds;

/**
 * @type {function(...[*]):*}
 */
GGoogleBarOptions.prototype.onIdleCallback;

/**
 * @type {function(...[*]):*}
 */
GGoogleBarOptions.prototype.onSearchCompleteCallback;

/**
 * @type {function(...[*]):*}
 */
GGoogleBarOptions.prototype.onGenerateMarkerHtmlCallback;

/**
 * @type {function(...[*]):*}
 */
GGoogleBarOptions.prototype.onMarkersSetCallback;

/** @enum */
var GGoogleBarResultList = {};

/**
 * @type {*}
 */
GGoogleBarResultList.G_GOOGLEBAR_RESULT_LIST_INLINE;

/**
 * @type {*}
 */
GGoogleBarResultList.G_GOOGLEBAR_RESULT_LIST_SUPPRESS;

/**
 * @constructor
 */
var GPov = function() {};

/**
 * @type {number}
 */
GPov.prototype.yaw;

/**
 * @type {number}
 */
GPov.prototype.pitch;

/**
 * @type {number}
 */
GPov.prototype.zoom;

/**
 * @constructor
 */
var GRoute = function() {};

/**
 * @return {number}
 */
GRoute.prototype.getNumSteps = function() {};

/**
 * @param {number} i
 * @return {GStep}
 */
GRoute.prototype.getStep = function(i) {};

/**
 * @return {Object}
 */
GRoute.prototype.getStartGeocode = function() {};

/**
 * @return {Object}
 */
GRoute.prototype.getEndGeocode = function() {};

/**
 * @return {GLatLng}
 */
GRoute.prototype.getEndLatLng = function() {};

/**
 * @return {string}
 */
GRoute.prototype.getSummaryHtml = function() {};

/**
 * @return {Object}
 */
GRoute.prototype.getDistance = function() {};

/**
 * @return {Object}
 */
GRoute.prototype.getDuration = function() {};

/**
 * @constructor
 */
var GStep = function() {};

/**
 * @return {GLatLng}
 */
GStep.prototype.getLatLng = function() {};

/**
 * @return {number}
 */
GStep.prototype.getPolylineIndex = function() {};

/**
 * @return {string}
 */
GStep.prototype.getDescriptionHtml = function() {};

/**
 * @return {Object}
 */
GStep.prototype.getDistance = function() {};

/**
 * @return {Object}
 */
GStep.prototype.getDuration = function() {};

/**
 * @constructor
 */
var GStreetviewClient = function() {};

/**
 * @param {GLatLng} latlng
 * @param {function(GLatLng)} callback
 */
GStreetviewClient.prototype.getNearestPanoramaLatLng = function(latlng, callback) {};

/**
 * @param {GLatLng} latlng
 * @param {function(GStreetviewData)} callback
 */
GStreetviewClient.prototype.getNearestPanorama = function(latlng, callback) {};

/**
 * @param {string} panoId
 * @param {function(GStreetviewData)} callback
 */
GStreetviewClient.prototype.getPanoramaById = function(panoId, callback) {};

/** @enum */
GStreetviewClient.ReturnValues = {};

/**
 * @type {*}
 */
GStreetviewClient.ReturnValues.SUCCESS= 200;

/**
 * @type {*}
 */
GStreetviewClient.ReturnValues.SERVER_ERROR= 500;

/**
 * @type {*}
 */
GStreetviewClient.ReturnValues.NO_NEARBY_PANO= 600;

/**
 * @constructor
 */
var GStreetviewData = function() {};

/**
 * @type {GStreetviewLocation}
 */
GStreetviewData.prototype.location;

/**
 * @type {string}
 */
GStreetviewData.prototype.copyright;

/**
 * @type {Array.<GStreetviewLink>}
 */
GStreetviewData.prototype.links;

/**
 * @type {GStreetviewClient.ReturnValues}
 */
GStreetviewData.prototype.code;

/**
 * @constructor
 */
var GStreetviewLink = function() {};

/**
 * @type {number}
 */
GStreetviewLink.prototype.yaw;

/**
 * @type {string}
 */
GStreetviewLink.prototype.description;

/**
 * @type {string}
 */
GStreetviewLink.prototype.panoId;

/**
 * @constructor
 */
var GStreetviewLocation = function() {};

/**
 * @type {GLatLng}
 */
GStreetviewLocation.prototype.latlng;

/**
 * @type {GPov}
 */
GStreetviewLocation.prototype.pov;

/**
 * @type {string}
 */
GStreetviewLocation.prototype.description;

/**
 * @type {string}
 */
GStreetviewLocation.prototype.panoId;

/**
 * @constructor
 */
var GStreetviewOverlay = function() {};

/**
 * @param {Node} container
 * @param {GStreetviewPanoramaOptions=} opts
 * @constructor
 */
var GStreetviewPanorama = function(container, opts) {};

/**
 */
GStreetviewPanorama.prototype.remove = function() {};

/**
 * @param {Node} container
 */
GStreetviewPanorama.prototype.setContainer = function(container) {};

/**
 */
GStreetviewPanorama.prototype.checkResize = function() {};

/**
 */
GStreetviewPanorama.prototype.hide = function() {};

/**
 */
GStreetviewPanorama.prototype.show = function() {};

/**
 * @return {boolean}
 */
GStreetviewPanorama.prototype.isHidden = function() {};

/**
 * @return {GPov}
 */
GStreetviewPanorama.prototype.getPOV = function() {};

/**
 * @param {GPov} pov
 */
GStreetviewPanorama.prototype.setPOV = function(pov) {};

/**
 * @param {GPov} pov
 * @param {boolean} opt_longRoute
 */
GStreetviewPanorama.prototype.panTo = function(pov, opt_longRoute) {};

/**
 * @param {GLatLng} latlng
 * @param {GPov} opt_pov
 */
GStreetviewPanorama.prototype.setLocationAndPOV = function(latlng, opt_pov) {};

/**
 * @param {number} yaw
 */
GStreetviewPanorama.prototype.followLink = function(yaw) {};

/** @enum */
GStreetviewPanorama.ErrorValues = {};

/**
 * @type {*}
 */
GStreetviewPanorama.ErrorValues.NO_NEARBY_PANO= 600;

/**
 * @type {*}
 */
GStreetviewPanorama.ErrorValues.FLASH_UNAVAILABLE= 603;

/**
 * @constructor
 */
var GStreetviewPanoramaOptions = function() {};

/**
 * @type {GLatLng}
 */
GStreetviewPanoramaOptions.prototype.latlng;

/**
 * @type {GPov}
 */
GStreetviewPanoramaOptions.prototype.pov;

/**
 * @type {boolean}
 */
GStreetviewPanoramaOptions.prototype.enableFullScreen;

/**
 * @param {GTrafficOverlayOptions=} opts
 * @constructor
 */
var GTrafficOverlay = function(opts) {};

/**
 */
GTrafficOverlay.prototype.hide = function() {};

/**
 */
GTrafficOverlay.prototype.show = function() {};

/**
 * @constructor
 */
var GTrafficOverlayOptions = function() {};

/**
 * @type {boolean}
 */
GTrafficOverlayOptions.prototype.incidents;

/**
 * @type {boolean}
 */
GTrafficOverlayOptions.prototype.hide;

/** @enum */
var GTravelModes = {};

/**
 * @type {*}
 */
GTravelModes.G_TRAVEL_MODE_WALKING;

/**
 * @type {*}
 */
GTravelModes.G_TRAVEL_MODE_DRIVING;

var GXml = {};

/**
 * @param {string} xmltext
 * @return {Node}
 */
GXml.parse = function(xmltext) {};

/**
 * @param {Node} xmlnode
 * @return {string}
 */
GXml.value = function(xmlnode) {};

var GXmlHttp = {};

/**
 * @return {XMLHttpRequest}
 */
GXmlHttp.create = function() {};

/**
 * @constructor
 */
var GXslt = function() {};

/**
 * @param {Node} xsltnode
 * @return {GXslt}
 */
GXslt.create = function(xsltnode) {};

/**
 * @param {Node} xmlnode
 * @param {Node} htmlnode
 * @return {boolean}
 */
GXslt.transformToHtml = function(xmlnode, htmlnode) {};
