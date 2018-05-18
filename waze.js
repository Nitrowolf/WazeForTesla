var gMap;
var gPolys = {};
var gCarPosition;
var gCarHeading = null;
var gCarSpeed = 0;
var gLastSpeedTime = 0;
var gResumeButtonDiv;
var gTrafficCameraDiv;
var gAutoUpdate = true;
var gUpdateCount = 0;
var gNoMoveCount = 0;
var gIsInAlertUpdate = false;
var gNightMode;
var gInfoWindow;
var gInfoWindowVisible = false;
var gControlTextZoomInDiv;
var gControlTextZoomOutDiv;
var gAlertLayer;
var gTrafficLayer;
var gPoiLayer;
var gPoiLastUrl;
var gChargerLayer;
var gMapCanvas;
var gRedlightQuadtree; 
var gArrowCanvas = null;
var gCarArrowIcon;
var gDpiScale;
var gUrlParams;
var gStatusDiv;
var isHttps;


//map options
var showTraffic = true;
var showTrafficJams = true;
var showAccidents = true;
var showHazzards = true;
var showClosures = true;
var showConstruction = true;
var showPolice = true;
var showPoliceHiding = true;
var showRedlightWarn = true;
var showSpeedWarn = true;

var NIGHTMODE = {
    AUTO: { value: 0, name: "Auto" },
    DAY: { value: 1, name: "Day" },
    NIGHT: { value: 2, name: "Night" }
};

var dot = {
    'url': 'icons/dot.png',
    'scaledSize': new google.maps.Size(32, 32),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(16, 16)
};
var arrow = {
    'url': 'icons/arrow.png',
    'scaledSize': new google.maps.Size(32, 32),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(16, 16)
};

var hazard = {
    'url': 'icons/hazzard.png',
    'scaledSize': new google.maps.Size(40, 40),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(20, 20)
};

var hazard_flood = {
    'url': 'icons/hazzard_flood.png',
    'scaledSize': new google.maps.Size(40, 40),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(20, 20)
};

var hazard_fog = {
    'url': 'icons/hazzard_fog.png',
    'scaledSize': new google.maps.Size(40, 40),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(20, 20)
};

var police = {'url': 'icons/police.png',
              'scaledSize': new google.maps.Size(32, 32),
              'origin': new google.maps.Point(0,0),
              'anchor': new google.maps.Point(16, 16)
};
var police_old = {
    'url': 'icons/police_t.png',
    'scaledSize': new google.maps.Size(32, 32),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(16, 16)
};
var police_hiding = {'url': 'icons/police_hiding.png',
              'scaledSize': new google.maps.Size(48, 48),
              'origin': new google.maps.Point(0,0),
              'anchor': new google.maps.Point(24, 24)
              };

var accident = {
    'url': 'icons/accident.png',
    'scaledSize': new google.maps.Size(40, 40),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(20, 20)
};

var accident_major = {
    'url': 'icons/accident_major.png',
    'scaledSize': new google.maps.Size(48, 48),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(24, 24)
};

var construction = {
    'url': 'icons/construction.png',
    'scaledSize': new google.maps.Size(40, 40),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(20, 20)
};

var closedIcon = {
    'url': 'icons/closed.png',
    'scaledSize': new google.maps.Size(40, 40),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(20, 20)
};

var jam = {
    'url': 'icons/jam.png',
    'scaledSize': new google.maps.Size(32, 32),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(16, 16)
};

var redlightCamera = {
    'url': 'icons/camera.png',
    'scaledSize': new google.maps.Size(16, 16),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(8, 8)
};

var redlightCamera_n = {
    'url': 'icons/camera_n.png',
    'scaledSize': new google.maps.Size(16, 16),
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(8, 8)
};

var TeslaCharger = {
    'url': 'icons/teslacharger.png',
    'scaledSize': new google.maps.Size(16, 23),  // 46, 66
    'origin': new google.maps.Point(0, 0),
    'anchor': new google.maps.Point(7, 10)
};

var linePathJam = {
    path: 'M 1,1 0,-2 -1,1',
    strokeOpacity: 1,
    scale: 1.8,
    strokeColor: '#FFD0D0'
};

var linePathClosure = {
    path: 'M 0,-1 0,1 ',
    strokeOpacity: 1,
    scale: 5,
    strokeColor: '#F0F000'
};


function getLocation(callBack, errorCallback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callBack);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function alertClick(event) {

    var titleString;
    var type = event.feature.getProperty("type");
    var subtype = event.feature.getProperty("subtype");

    if (type == "ROAD_CLOSED") {
        type = "ROAD CLOSED";
    }

    if (subtype == "") {
        titleString = type;
    } else {
        var subtypeString = subtype;
        if (subtype == "POLICE_HIDING") {
            subtypeString = "Hiding"
        } else if (subtype == "POLICE_VISIBLE") {
            subtypeString = "Visible"
        } else if (subtype == "POLICE_VISIBLE") {
            subtypeString = "Visible"
        } else if (subtype == "HAZARD_ON_SHOULDER_ANIMALS") {
            subtypeString = "Animal on Shoulder"
        } else if (subtype == "HAZARD_ON_SHOULDER_MISSING_SIGN") {
            subtypeString = "Missing Sign on Shoulder"
        } else if (subtype == "HAZARD_ON_ROAD") {
            subtypeString = "Hazard on Road"
        } else if (subtype == "HAZARD_ON_ROAD_ROAD_KILL") {
            subtypeString = "Dead Animal on Road"
        } else if (subtype == "HAZARD_ON_ROAD_OBJECT") {
            subtypeString = "Object on Road"
        } else if (subtype == "HAZARD_ON_ROAD_ICE") {
            subtypeString = "Ice on Road"
        } else if (subtype == "HAZARD_ON_ROAD_CAR_STOPPED") {
            subtypeString = "Car Stopped on Road"
        } else if (subtype == "HAZARD_ON_ROAD_CONSTRUCTION") {
            subtypeString = "Construction on Road"
        } else if (subtype == "HAZARD_ON_SHOULDER") {
            subtypeString = "Object on Shoulder"
        } else if (subtype == "HAZARD_WEATHER") {
            subtypeString = "Weather"
        } else if (subtype == "HAZARD_WEATHER_FLOOD") {
            subtypeString = "Flood"
        } else if (subtype == "HAZARD_WEATHER_FOG") {
            subtypeString = "Fog"
        } else if (subtype == "ACCIDENT_MAJOR") {
            subtypeString = "Major"
        } else if (subtype == "ACCIDENT_MINOR") {
            subtypeString = "Minor"
        } else if (subtype == "ROAD_CLOSED_CONSTRUCTION") {
            subtypeString = "Construction"
        } else if (subtype == "ROAD_CLOSED_EVENT") {
            subtypeString = "Event"
        }
        titleString = type + ': ' + subtypeString;
    }

    var eventTimeSpan = (new Date() - new Date(event.feature.getProperty("pubMillis"))) / 60 / 1000;
    if (eventTimeSpan < 2 * 60) {
        eventTimeSpan = eventTimeSpan.toFixed(0)  + " min ago";
    } else if (eventTimeSpan < 2 * 60 * 60) {
        eventTimeSpan = (eventTimeSpan / 60).toFixed(0) + " hours ago";
    } else {
        eventTimeSpan = (eventTimeSpan / 60 / 60).toFixed(0) + " days ago";
    }

    var icon = event.feature.getProperty("iconInfo");
    var contentNode = document.createElement('div');
    contentNode.id = "InfoWindow";
            
    var nComments = 0;
    var comments = event.feature.getProperty("comments");
    if (comments != null) {
        for (var i = 0; i < comments.length; ++i) {
            if (comments[i].isThumbsUp == false && comments[i].text != null) {
                nComments++;
            }
        }
    }


    var infoHTML;
    infoHTML = "<table border='0'>" +
        "<td valign='top'><img src='" + icon.url + "' style='margin-left:-7px;margin-top:-5px;width:" + icon.scaledSize.width * 1.5 + "px;height:" + icon.scaledSize.height * 1.5 + "px'></td>" +
        "<td style='padding:0px'>" +
        "<b>" + titleString + "</b><br>" +
        "<span style='font-size:90%'>" + event.feature.getProperty("street") + "</span><br>" +
        "<b><small>" + eventTimeSpan + "</small></b><br>" +
        "<div style='padding-top:15px;font-size:250%;zoom:40%'>" +
          "<b><span style='padding-top:7px;padding-right:9px;";

    if (nComments > 0) {
        infoHTML += "background-color:#DDDDDD;padding-bottom:15px;padding-left:8px";
    } 

    infoHTML += "'><img src='icons/comments.png'> " + nComments + "</span>" +
          "&nbsp;&nbsp;&nbsp;<img src='icons/likes.png'> " + event.feature.getProperty("nThumbsUp");

    if (nComments > 0) {
        var commentsHTML = "";
        var commentsProcessed = 0;
        for (var i = 0; i < comments.length; ++i) {
            if (comments[i].isThumbsUp == false && comments[i].text != null) {
                commentsProcessed++;
                if (commentsProcessed < nComments) {
                    commentsHTML += "<div style='border-bottom-color:#B0B0B0;border-bottom-style:solid;border-bottom-width:2px;'>" + comments[i].text + "</div>";
                } else {
                    commentsHTML += "<div style='border-bottom-style:none'>" + comments[i].text + "</div>";
                }
            }
        }

        infoHTML += "<div id='commentsDiv' style='max-height:150px;overflow:auto;font-size:70%;font-weight:200;padding-left:9px;padding-top:5px;padding-bottom:6px;padding-right:9px;background-color:#DDDDDD;'>" + commentsHTML + "</div>";
    }

    infoHTML += "</div>" +
                "</td></table>";

    contentNode.innerHTML = infoHTML;


    gInfoWindowVisible = false;
    gInfoWindow.setContent(contentNode);
    var anchor = new google.maps.MVCObject();
    anchor.set("position", event.latLng);
    gInfoWindow.open(gMap, anchor);
}

function chargerClick(event) {
    var infoHTML = "<b>Supercharger</b><br>" +
                   "<span style='font-size:90%'>" + event.feature.getProperty("name") + "</span><br>" +
                   "<div style='font-size:72%;margin-top:5px;margin-bottom:5px;padding-top:5px;padding-bottom:5px;border-color:#B0B0B0;border-bottom-style:solid;border-bottom-width:1px;border-top-style:solid;border-top-width:1px;'>" +
                   "<table style='border-spacing:0px'><tbody>" +
                   "<tr><th style='text-align:right;padding-right:5px'>Date Opened</th><td>" + event.feature.getProperty("dateOpened") + "</td>" + "</tr>" +
                   "<tr><th style='text-align:right;padding-right:5px'>Elevation</th><td>" + (parseInt(event.feature.getProperty("elevationMeters"), 10) * 3.2808399).toFixed() + " ft</td>" + "</tr>" +
                   "<tr><th style='text-align:right;padding-right:5px'>Stalls</th><td>" + event.feature.getProperty("stallCount") + "</td>" + "</tr>" +
                   "</table><tbody>" +
                   "</div>" +
                   "<a href='https://www.tesla.com/findus/location/supercharger/" + event.feature.getProperty("locationId") + "' style='font-size:70%'>web page</a>";

    var contentNode = document.createElement('div');
    contentNode.id = "InfoWindow";
    contentNode.innerHTML = infoHTML;

    gInfoWindowVisible = false;
    gInfoWindow.setContent(contentNode);
    var anchor = new google.maps.MVCObject();
    anchor.set("position", event.latLng);
    gInfoWindow.open(gMap, anchor);
}

function processAlerts(map, alerts) {
    gIsInAlertUpdate = true;

    if (gAlertLayer == null) {
        gAlertLayer = new google.maps.Data();
        gAlertLayer.setStyle(function (feature) {
       
            if (feature.getId() == "CarArrow") {
                var carIcon = dot;
                if (gCarHeading !== null && (!isNaN(gCarHeading)))
                {
                    updateArrow(gCarHeading, function (newMarker) {
                        carIcon = newMarker;
                    });
                }

                return {
                    icon: carIcon,
                    zIndex: 2001,
                    clickable: true,
                    draggable: true,
                    crossOnDrag: false
                };
            }

            return {
                icon: feature.getProperty('icon'),
                title: feature.getProperty('title'),
                zIndex: feature.getProperty('zIndex'),
                clickable: true,
                draggable: true,
                crossOnDrag: false,
                label: "Hello",
                visible: feature.getProperty('visible')
            };
        });

        gAlertLayer.addListener('click', alertClick);

        // google maps can't handle click with a div zoom style without enabling marker drag
        // so add a listener to cancel the drag event
        gAlertLayer.addListener('setgeometry', function (event) {
            if (gIsInAlertUpdate == false) {
                var feature = event.feature;
                gAlertLayer.remove(feature);
                feature.setGeometry(event.oldGeometry);
                gAlertLayer.add(feature);
            }
        });

        gAlertLayer.setMap(map);
    }

    var carArrow;
    featuresToRemove = {};
    gAlertLayer.forEach(function (feature) {
        if (feature.getId() != "CarArrow") {
            featuresToRemove[feature.getId()] = feature;
        } else {
            carArrow = feature;
        }
    });



    for (var i = 0; i < alerts.length; ++i) {
        var alert = alerts[i];
        var latlng = new google.maps.LatLng(alert.location.y, alert.location.x);

        if (alert.subtype == "HAZARD_ON_ROAD_CONSTRUCTION") {
            alert.type = 'CONSTRUCTION';
        }

        var zIndex = 10;
        var iconObj = null;
        var iconInfoObj = null;
        switch (alert.type) {
            case 'HAZARD':
                if (showHazzards == false) continue;
                if ((alert.subtype.indexOf('HAZARD_ON_SHOULDER_CAR') != -1) ||
                   (alert.subtype.indexOf('POT_HOLE') != -1)) {
                    continue;
                }
                if (alert.subtype.indexOf('HAZARD_WEATHER_FLOOD') != -1) {
                    iconObj = hazard_flood;
                } else if (alert.subtype.indexOf('HAZARD_WEATHER_FOG') != -1) {
                    iconObj = hazard_fog;
                } else {
                    iconObj = hazard;
                }
                iconInfoObj = hazard;
                break;
            case 'POLICE':
            case 'POLICEMAN':  
                if (alert.subtype == 'POLICE_HIDING') {
                    if (showPoliceHiding == false) continue;
                    iconObj = police_hiding;
                    zIndex = 20;
                } else {
                    if (showPolice == false) continue;
                    // police reports older than 20 mins are grayed out
                    var eventTimeSpan = (new Date() - new Date(alert.pubMillis)) / 60 / 1000;
                    if (eventTimeSpan < 20) {
                        iconObj = police;
                    } else {
                        iconObj = police_old;

                        // update the icon if it passed the 20 min duration
                        if (featuresToRemove[alert.id] != null) {
                            currentIcon = featuresToRemove[alert.id].getProperty("icon");
                            if (currentIcon != police_old) {
                                delete featuresToRemove[alert.id];
                            }
                        }
                    }
                }
                break;
            case 'ACCIDENT':
                if (showAccidents == false) continue;
                if (alert.subtype == 'ACCIDENT_MAJOR') {
                    iconObj = accident_major;  
                } else {
                    iconObj = accident;  
                }
                iconInfoObj = accident;
                break;
            case 'CONSTRUCTION':
                if (showConstruction == false) continue;
                iconObj = construction;
                break;

            case 'JAM':
                //iconObj = jam;
                continue;
                break;
            case 'ROAD_CLOSED':
                if (showClosures == false) continue;
                iconObj = closedIcon;
                break;
            case 'CHIT_CHAT':
            default:
                continue;
        }

        if (iconInfoObj == null) {
            iconInfoObj = iconObj;
        }

        var oldLatLng = null;
        if (featuresToRemove[alert.id] != null) {
            oldLatLng = featuresToRemove[alert.id].getGeometry().get();
            delete featuresToRemove[alert.id];
        }

        if (oldLatLng == null || oldLatLng.lat() != latlng.lat() || oldLatLng.lng() != latlng.lng()) {
            var streetString;
            if (alert.street) {
                streetString = alert.street;
            } else {
                streetString = "";
            }

            gAlertLayer.add(new google.maps.Data.Feature({
                geometry: latlng,
                id: alert.id,
                properties: {
                    type: alert.type,
                    subtype: alert.subtype,
                    street: streetString,
                    pubMillis: alert.pubMillis,
                    nComments: alert.nComments,
                    nThumbsUp: alert.nThumbsUp,
                    comments: alert.comments,
                    icon: iconObj,
                    iconInfo: iconInfoObj,
                    zIndex: zIndex,
                    visible: true
                }
            }));
        }
    }

    for (var feature in featuresToRemove) {
        gAlertLayer.remove(featuresToRemove[feature]);
    }

    if (!gInfoWindowVisible && gAutoUpdate)  // don't auto pan the map if an info win is displayed
    {
        map.panTo(gCarPosition);
    }

    console.log("Arrow= lat:" + gCarPosition.lat().toFixed(4) + ", lng:" + gCarPosition.lng().toFixed(4));
    if (carArrow != null) {
        carArrow.setGeometry(gCarPosition);
        carArrow.setProperty("visible", true);  // need to do this for set style to be called
    } else {
        gAlertLayer.add(new google.maps.Data.Feature({
            geometry: gCarPosition,
            id: "CarArrow"
        }));
    }

    
    ////////////////////////////////////////////////////////////////////////////////
    // tesla browser throws away the tiles after it sleeps
    // detect of there are any tiles, if none force a refreash

    var numTiles = 0;
    var foundTile = false;
    var imgs = document.getElementsByTagName('img');
    for (index = 0; index < imgs.length; ++index) {
        var img = imgs[index];
        if (img == null) continue;

        if (img.height == 256) {
            numTiles++;
            if (numTiles >= 6) {
                foundTile = true;
                break;
            }
        }
    }

    if (foundTile == false && imgs.length > 6 && document.body.clientWidth > 800 && gUpdateCount > 1 && gAutoUpdate) {
        gStatusDiv.innerHTML = "No Tiles, refreashing (" + imgs.length + ")";
        window.location.replace(window.location.href);
    }

    gIsInAlertUpdate = false;
}

function processJams(map, jams) {
    var newPolys = {}
    var i;
    for (i = 0; i < jams.length; ++i) {
        var jam = jams[i];
        var line = jam.line;
        var j;
        var path;
        if (jam.severity < 2) {
            continue;
        }
        path = [];
        //console.log('Street: '+jam.street+' speed:' + jam.speed+ ' delay: '+jam.delay+' severity:' + jam.severity);
        for (j = 0; j < line.length; ++j) {
            path.push(new google.maps.LatLng(line[j].y, line[j].x));
        }
        var poly = gPolys[jam.id];
        if (!poly) {
            var lineSymbol = linePathJam;
            var pathColor = 'red';
            var repeat = '20px';

            var isBlocking = (typeof jam.blockType != "undefined");
            if (isBlocking) {

                if (map.getZoom() > 13) {
                    repeat = '25px';
                    linePathClosure.scale = 4;
                } else {
                    repeat = '13px';
                    linePathClosure.scale = 2.5;
                }

                lineSymbol = linePathClosure;
                pathColor = '#404040';
            }

            poly = new google.maps.Polyline({
                geodesic: true,
                strokeColor: pathColor,
                strokeOpacity: 1.0,
                strokeWeight: 5 * gDpiScale,
                icons: [{
                    icon: lineSymbol,
                    offset: '0',
                    repeat: repeat
                }]
            });
            poly.setMap(map);

        } else {
            delete gPolys[jam.id];
        }

        poly.setPath(path);
        newPolys[jam.id] = poly;
    }

    for (var key in gPolys) {
        gPolys[key].setMap(null);
    }
    gPolys = newPolys;
}

function updateFeatures(map) {
    var i;
    if (!gInfoWindow) {
        gInfoWindow = new google.maps.InfoWindow();
        google.maps.event.addDomListener(gMapCanvas, 'click', function () {
            // allow clicking anywhere to dismiss the info windows
            if (gInfoWindowVisible)
            {
                gInfoWindowVisible = false;
                if (document.getElementById('InfoWindow') != null)
                {
                    gInfoWindow.close();
                    updateMap(map);
                }
            }
        });
        google.maps.event.addListener(gInfoWindow, 'domready', function () {
            gInfoWindowVisible = true;
        });
        google.maps.event.addListener(gInfoWindow, 'closeclick', function () {
            gInfoWindowVisible = false;
            updateMap(map);
        });
    }

    if (map.getBounds() != null)
    {
        var lat0 = map.getBounds().getNorthEast().lat();
        var lng0 = map.getBounds().getNorthEast().lng();
        var lat1 = map.getBounds().getSouthWest().lat();
        var lng1 = map.getBounds().getSouthWest().lng();

        var boundsString = 'left=' + lng1 + '&right=' + lng0 + '&bottom=' + lat1 + '&top=' + lat0 + '&_=1428266437353&track=' + gAutoUpdate;
        var reqString = '../proxy.php?' + boundsString;

        $.ajax({
            'url': reqString, 'dataType': 'json', 'success': function (data) {
                if (data.jams && showTrafficJams) {
                    processJams(map, data.jams);
                }

                var alerts = data.alerts
                if (alerts == null) {
                    alerts = {};
                }
                processAlerts(map, alerts);
                declutterMap(map);
            }, 'error': function (error, status, errorString) {
                console.log(error + status + errorString);
            }
        });
    }

}


function updateMap(map) {

    // see if we need to load a new tile for the camera POI database
    var poiTile = tileProject(map.getCenter(), 8);
    var poiUrl = 'GeoJson/poi_z8x' + poiTile.x + 'y' + poiTile.y + '.json';
    var superchargersUrl = 'GeoJson/sc_poi_z8x' + poiTile.x + 'y' + poiTile.y + '.json';
    if (gPoiLastUrl != poiUrl) {

        // add redlight cameras
        if (gPoiLayer != null && gPoiLayer.map != null) {
            gPoiLayer.map = null;
        }

        gPoiLayer = new google.maps.Data();
        gPoiLayer.setStyle(function (feature) {
            gRedlightQuadtree.add(feature);
            return {
                icon: map.getMapTypeId() == "map_day" ? redlightCamera : redlightCamera_n,
                zIndex: 1,
                clickable: false,
                draggable: false,
                visible: feature.getProperty('type') != 5
            };
        });

        gRedlightQuadtree = d3.quadtree().x(function (feature) {
            return feature.getGeometry().get().lng();
        }).y(function (feature) {
            return feature.getGeometry().get().lat();
        });

        gPoiLastUrl = poiUrl;
        gPoiLayer.loadGeoJson(poiUrl);
        gPoiLayer.setMap(map);


        // add tesla superchargers
        gChargerLayer = new google.maps.Data();
        gChargerLayer.setStyle(function (feature) {
            return {
                icon: TeslaCharger,
                zIndex: 1,
                clickable: false,
                draggable: true
            };
        });

        gChargerLayer.loadGeoJson(superchargersUrl);
        gChargerLayer.addListener('click', chargerClick);

        // google maps can't handle click with a div zoom style without enabling marker drag
        // so add a listener to cancel the drag event
        gChargerLayer.addListener('setgeometry', function (event) {
            if (gIsInAlertUpdate == false) {
                var feature = event.feature;
                gChargerLayer.remove(feature);
                feature.setGeometry(event.oldGeometry);
                gChargerLayer.add(feature);
            }
        });
        gChargerLayer.setMap(map);
    }

    if (showTraffic) {
        gTrafficLayer.setMap(null);
        gTrafficLayer = new google.maps.TrafficLayer();
        gTrafficLayer.setMap(map);
    }

    // update zoom button states
    gControlTextZoomOutDiv.style.color = 'black';
    if (map.minZoom >= map.getZoom()) {
        gControlTextZoomOutDiv.style.color = 'LightGray';
    }

    gControlTextZoomInDiv.style.color = 'black';
    if (map.maxZoom <= map.getZoom()) {
        gControlTextZoomInDiv.style.color = 'LightGray';
    }

    setMapDayNight(map);
    updateFeatures(map);
    declutterMap(map);

    // show redlight/camera alerts
    if (gAutoUpdate && (showRedlightWarn || showSpeedWarn)) {
        var findClosestCamera = gRedlightQuadtree.find(gCarPosition.lng(), gCarPosition.lat(), .003);
        if (findClosestCamera != null) {

            // compute of we are heading to or from the camera (angle greater than 100 is assumed away)
            var headingToFromCamera = 0;
            if (gCarHeading != null) {
                var lngdiff = findClosestCamera.getGeometry().get().lng() - gCarPosition.lng();
                var latdiff = findClosestCamera.getGeometry().get().lat() - gCarPosition.lat();
                var headingCamera = heading(latdiff, lngdiff);
                headingToFromCamera = Math.abs(gCarHeading - headingCamera);
            }

            // did the light address change or are we heading away from the camera?
            if (gTrafficCameraDiv != null && 
                (findClosestCamera.getProperty("address") != document.getElementById('addressCamera').innerText || headingToFromCamera > 100)) {
                gMap.controls[google.maps.ControlPosition.TOP_CENTER].clear();
                gTrafficCameraDiv = null;
            }

            // show the traffic alert
            cameraType = findClosestCamera.getProperty("type");

            // don't show redlight warnings if going over 61 MPH, this advoids false warnings on side roads next to the freeways
            if ((gCarSpeed < 61 || cameraType != 1) &&
                headingToFromCamera < 100 &&
                gTrafficCameraDiv == null &&
                ((cameraType == 1 && showRedlightWarn) || (cameraType != 1 && showSpeedWarn))) {

                gTrafficCameraDiv = document.createElement('div');
                createTrafficCameraDiv(gTrafficCameraDiv, findClosestCamera.getProperty("address"), cameraType);
                gTrafficCameraDiv.style.width = "345";
                gTrafficCameraDiv.id = "trafficAlertDiv";
                gMap.controls[google.maps.ControlPosition.TOP_CENTER].push(gTrafficCameraDiv);
            }
        } else if (gTrafficCameraDiv != null) {
            gMap.controls[google.maps.ControlPosition.TOP_CENTER].clear();
            gTrafficCameraDiv = null;
        }
    } else if (gTrafficCameraDiv != null) {
        gTrafficCameraDiv.style.display = "none";
    }
}

function setMapDayNight(map) {
    //auto day/night map
    if (gNightMode == NIGHTMODE.AUTO) {
        var date = new Date();
        var timesSun = SunCalc.getTimes(date, gCarPosition.lat(), gCarPosition.lng());

        if (timesSun.sunrise < date && date < timesSun.sunset) {
            setMapMode(map, NIGHTMODE.DAY)
        }
        else {
            setMapMode(map, NIGHTMODE.NIGHT)
        }
    } else {
        setMapMode(map, gNightMode)
    }
}

function setMapMode(map, mode) {
    document.cookie = "nightMode=" + gNightMode.value + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (mode == NIGHTMODE.DAY) {
        if (map.getMapTypeId() != "map_day") {
            map.setMapTypeId('map_day');
            gMapCanvas.style.backgroundColor = "#EAE6DD";
            gPoiLastUrl = "";
        }
    } else {
        if (map.getMapTypeId() != "map_night") {
            map.setMapTypeId('map_night');
            gMapCanvas.style.backgroundColor = "#191926";
            gPoiLastUrl = "";
        }
    }
}


function createResumeDiv(parentDiv) {
    var controlUIClick = document.createElement('div');
    controlUIClick.className = 'controlClickArea';
    parentDiv.appendChild(controlUIClick);

    var containerElement = document.createElement('div');
    containerElement.className = 'controlOuter';
    containerElement.id = 'resumeBtn';
    containerElement.style.display = 'none';

    var textElement = document.createElement('div');
    textElement.innerHTML = 'Resume Tracking';
    textElement.className = 'controlText';
    containerElement.appendChild(textElement);

    google.maps.event.addDomListener(controlUIClick, 'click', function () {
        enableUpdate();
        hideTrackingButton();
        updateMap(gMap);
    });
    controlUIClick.appendChild(containerElement);
    return containerElement;
}

function createTrafficCameraDiv(parentDiv, address, type) {
    var controlUIClick = document.createElement('div');
    controlUIClick.className = 'controlClickArea';
    parentDiv.appendChild(controlUIClick);

    var containerElement = document.createElement('div');
    containerElement.className = 'controlOuter';
    containerElement.id = 'trafficAlert';
    containerElement.style.opacity = "1";

    var textElement = document.createElement('div');
    var innerHTML = '<div style="line-height:normal"><table style="padding-top:8px;margin-bottom:-20px"><tr><td style="padding-right:25px">';

    if (type == "4") {
        innerHTML += '<img src="icons/speed_camera.png" height="96">';
    } else {
        innerHTML += '<img src="icons/redlight_sign.png" height="96">';
    }

    innerHTML += '</td><td valign="top">' +
                 '<div style="font-size:50px">';
    
    if (type == "4") {
        innerHTML += 'Speed Camera';
    } else {
        innerHTML += 'Traffic Camera';
    }

    innerHTML += '</div>' +
                 '<div id="addressCamera" style="font-size:20px">' + address + '</div>' +
                 '</td></tr></table>' + 
                 '<img src="icons/flashing_red.gif" width="500px" height="10px"></div>';

    textElement.innerHTML = innerHTML;
    textElement.className = 'controlText';
    containerElement.appendChild(textElement);

    google.maps.event.addDomListener(controlUIClick, 'click', function () {
        gTrafficCameraDiv.style.display = "none";
    });
    controlUIClick.appendChild(containerElement);
    return containerElement;
}

function disableUpdate() {
    gAutoUpdate = false;
}

function enableUpdate() {
    gAutoUpdate = true;
}

function showTrackingButton() {
    $(gResumeButtonDiv).css('display', 'block');
}

function hideTrackingButton() {
    $(gResumeButtonDiv).css('display', 'none');
}


function setMapTimer(map) {

    var updateFunc = function (position) {
        console.log('interval autoUpdate=' + gAutoUpdate);

        // compute cars new position and direction
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var prevPosition = gCarPosition;
        gCarPosition = new google.maps.LatLng(latitude, longitude);


        if (position.coords.speed != null) {
            gCarSpeed = position.coords.speed;
        } else {
            var date = new Date();
            var currentTime = date.getTime();

            // compute speed from last update position
            var dist = distanceMeters(latitude, longitude, prevPosition.lat(), prevPosition.lng());
            gCarSpeed = (dist * 0.00062137) * 3600 / ((currentTime - gLastSpeedTime) / 1000);   // to MPH
            gLastSpeedTime = currentTime;
        }


        if (position.coords.heading != null) {
            gCarHeading = position.coords.heading;
        } else if (prevPosition != null && gUpdateCount > 0) {
            var lngdiff = longitude - prevPosition.lng();
            var latdiff = latitude - prevPosition.lat();

            // set a new heading only if the car moved
            if (Math.abs(lngdiff) > .000001 || Math.abs(latdiff) > .000001) {
                gCarHeading = heading(latdiff, lngdiff);
                document.cookie = "gCarHeading=" + gCarHeading + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
                gNoMoveCount = 0;
            } else {
                gNoMoveCount++;
            }
        }

        // Tesla browser is still active even if it looks off (out of the car)
        // limit the calls after 20 mins of not moving and fallback to 15min updates

        if (gNoMoveCount < 40 || (gNoMoveCount % 30) == 0) {
            updateMap(map);
        }

        gUpdateCount++;
    }

    // Set GPS timer callback
    if (navigator.geolocation) {

        if (navigator.userAgent.match(/CarBrowser/i)) {

            // tesla browser will call this every 30 sec
            navigator.geolocation.watchPosition(updateFunc, function () {
                console.log('GPS error');
            }, { 'enableHighAccuracy': true, 'timeout': 30000, 'maximumAge': 30000 });

        } else {
            // for non-tesla browsers
            lastTimeout = window.setInterval(function () {
                navigator.geolocation.getCurrentPosition(updateFunc);
            }, 15000);
        }

    } else {
        console.log("Geolocation is not supported by this browser.");
    }

}

function initialize() {

    getLocation(function (position) {
        gCarPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var nightMapStyle = [
            {
                featureType: "all",
                elementType: "all",
                stylers: [
                    { invert_lightness: true },
                    { hue: "#0800ff" }
                ]
            }, {
                elementType: "labels.icon",
                stylers: [
                    { invert_lightness: true },
                    { hue: "none" },
                ]
            }, {
                featureType: "water",
                stylers: [
                    { lightness: "-80" }
                ]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                  { "color": "#808080" },
                  { "lightness": -100 },
                  { "weight": 1 }
                ]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                  { "color": "#66658e" }
                ]
            }, {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [
                  { "color": "#3b3855" }
                ]
            }, {
                "featureType": "road.local",
                "elementType": "geometry.fill",
                "stylers": [
                  { "color": "#454646" }
                ]
            },{
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [
                  { "lightness": 100 }
                ]
            },{
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [
                  { "weight": 3 },
                  { "color": "#000000" }
                ]
            },{
                "featureType": "landscape",
                "stylers": [
                  { "lightness": -20 }
                ]
            },{
                "featureType": "administrative",
                "elementType": "labels.text.stroke",
                "stylers": [
                    { "color": "#000000" },
                    { "weight": 4 }
                ]
            }

        ];

        var styledMapTypeNight = new google.maps.StyledMapType(nightMapStyle, { name: "Night" });

        var dayMapStyle = [
            {
                // right now use default style for day maps       
            }];
        var styledMapTypeDay = new google.maps.StyledMapType(dayMapStyle, { name: "Day" });


        var myZoom = 12;  
        var cookieZoom = getCookieInt("zoom");
        if (!isNaN(cookieZoom))
        {
            myZoom = parseInt(cookieZoom);
        }
        else if (gUrlParams["zoom"] != null)
        {
            myZoom = parseInt(gUrlParams["zoom"], 10);
        }

        var mapOptions = {
            center: gCarPosition,
            mapTypeControlOptions: {
                mapTypeIds: ['map_day', 'map_night']
            },
            mapTypeControl: false,
            zoomControl: false,
            panControl: false,
            streetViewControl: false,
            minZoom: 10,
            maxZoom: 18,
            zoom: myZoom
        }


        gMapCanvas = document.getElementById('map-canvas')

        // set high DPI for google maps
        gDpiScale = 1 / window.getComputedStyle(gMapCanvas, null).zoom;
        window.devicePixelRatio = 1.0 / gDpiScale;

        gMap = new google.maps.Map(gMapCanvas, mapOptions);
        gMap.setClickableIcons(false);

        var carHeading = getCookieInt("gCarHeading");
        if (!isNaN(carHeading)) {
            gCarHeading = parseFloat(carHeading);
        } 
        
        var traffic = getCookieInt("trafficMode");
        if (!isNaN(traffic) && traffic == 0) {
            showTraffic = false;
        } else if (gUrlParams["traffic"] != null && gUrlParams["traffic"] == "off") {
            showTraffic = false;
        }

        if (showTraffic) {
            gTrafficLayer = new google.maps.TrafficLayer();
            gTrafficLayer.setMap(gMap);
        }

        var trafficJams = getCookieInt("trafficJamMode");
        if (!isNaN(trafficJams) && trafficJams == 0) {
            showTrafficJams = false;
        } else if (gUrlParams["trafficJams"] != null && gUrlParams["trafficJams"] == "off") {
            showTrafficJams = false;
        }

        var accidents = getCookieInt("showAccidents");
        if (!isNaN(accidents) && accidents == 0) {
            showAccidents = false;
        } else if (gUrlParams["showAccidents"] != null && gUrlParams["showAccidents"] == "off") {
            showAccidents = false;
        }

        var hazzards = getCookieInt("showHazzards");
        if (!isNaN(hazzards) && hazzards == 0) {
            showHazzards = false;
        } else if (gUrlParams["showHazzards"] != null && gUrlParams["showHazzards"] == "off") {
            showHazzards = false;
        }

        var closures = getCookieInt("showClosures");
        if (!isNaN(closures) && closures == 0) {
            showClosures = false;
        } else if (gUrlParams["showClosures"] != null && gUrlParams["showClosures"] == "off") {
            showClosures = false;
        }

        var construction = getCookieInt("showConstruction");
        if (!isNaN(construction) && construction == 0) {
            showConstruction = false;
        } else if (gUrlParams["showConstruction"] != null && gUrlParams["showConstruction"] == "off") {
            showConstruction = false;
        }

        var police = getCookieInt("showPolice");
        if (!isNaN(police) && police == 0) {
            showPolice = false;
        } else if (gUrlParams["showPolice"] != null && gUrlParams["showPolice"] == "off") {
            showPolice = false;
        }

        var policeHiding = getCookieInt("showPoliceHiding");
        if (!isNaN(policeHiding) && policeHiding == 0) {
            showPoliceHiding = false;
        } else if (gUrlParams["showPoliceHiding"] != null && gUrlParams["showPoliceHiding"] == "off") {
            showPoliceHiding = false;
        }

        var redlightWarn = getCookieInt("showRedlightWarn");
        if (!isNaN(redlightWarn) && redlightWarn == 0) {
            showRedlightWarn = false;
        } else if (gUrlParams["showRedlightWarn"] != null && gUrlParams["showRedlightWarn"] == "off") {
            showRedlightWarn = false;
        }

        var speedWarn = getCookieInt("showSpeedWarn");
        if (!isNaN(speedWarn) && speedWarn == 0) {
            showSpeedWarn = false;
        } else if (gUrlParams["showSpeedWarn"] != null && gUrlParams["showSpeedWarn"] == "off") {
            showSpeedWarn = false;
        }

        gNightMode = NIGHTMODE.AUTO;
        var cookieMode = getCookieInt("nightMode");
        if (!isNaN(cookieMode)) {
            for (mode in NIGHTMODE) {
                if (NIGHTMODE[mode].value == cookieMode) {
                    gNightMode = NIGHTMODE[mode];
                    break;
                }
            }
        } else {
            if (gUrlParams["display_mode"] != null)
            {
                for (mode in NIGHTMODE) {
                    if (NIGHTMODE[mode].name == gUrlParams["display_mode"]) {
                        gNightMode = NIGHTMODE[mode];
                        break;
                    }
                }
            }
        }

        gMap.mapTypes.set('map_day', styledMapTypeDay);
        gMap.mapTypes.set('map_night', styledMapTypeNight);
        setMapDayNight(gMap);

        containerDiv = document.createElement('div');
        gResumeButtonDiv = createResumeDiv(containerDiv);
        containerDiv.style.width = (400 * gDpiScale).toString() + 'px';
        gMap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(containerDiv);

        controlsDiv = document.createElement('div');
        AddZoomControls(controlsDiv, gMap);
        gMap.controls[google.maps.ControlPosition.TOP_LEFT].push(controlsDiv);

        controlsDiv = document.createElement('div');
        AddOptionsControl(controlsDiv, gMap);
        gMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlsDiv);

        gCarArrowIcon = document.createElement("img");
        gCarArrowIcon.src = "icons/arrow.png";

        gStatusDiv = document.createElement('div');
        gStatusDiv.style.color = "#C0C0C0";
        gStatusDiv.style.backgroundColor = "#404040";
        gMap.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(gStatusDiv);

        // unzoom the google copyright text/icon
        google.maps.event.addListenerOnce(gMap, 'idle', function () {
            var googleElements = document.getElementsByTagName("div");
            for (var i = 0; i < googleElements.length; i++) {
                var zIndex = googleElements[i].style.zIndex;
                if (zIndex && (zIndex == 1000000 || zIndex == 1000001)) {
                    googleElements[i].style.zoom = (gDpiScale * 100).toString() + "%";
                }
            }
        });

        google.maps.event.addListenerOnce(gMap, 'tilesloaded', function () {
            // handle first update of the map after all tiles has been loaded
            updateMap(gMap);
        });
        google.maps.event.addListener(gMap, 'dragend', function () {
            console.log('dragend');
            updateMap(gMap);
            showTrackingButton();
        });
        google.maps.event.addListener(gMap, 'dragstart', function () {
            disableUpdate();
        });

        google.maps.event.addListener(gMap, 'zoom_changed', function () {
            console.log('zoom');
            updateMap(gMap);
        });
        /*google.maps.event.addListener(gMap,'center_changed',function() {
            updateMap(gMap);
        });
        */
        window.onresize = function () {
            //gStatusDiv.innerHTML = "onresize()";
            console.log('resize');
            updateMap(gMap);     
        }

        setMapTimer(gMap);
        //https://www.waze.com/rtserver/web/GeoRSS?os=60&atof=false&format=XML&ma=200&mj=100&mu=100&sc=216672&jmu=0&types=alerts%2Cusers%2Ctraffic&left=-122.0604314804077&right=-121.85622310638428&bottom=37.7150633814107&top=37.815700449595646&_=1428266437353

    });
}

//google.load("feeds", "1");
google.maps.event.addDomListener(window, 'load', initialize);


function AddOptionsControl(controlDiv, map) {

    var controlUIClick = document.createElement('div');
    controlUIClick.className = 'controlClickArea';
    controlDiv.appendChild(controlUIClick);

    var controlUI = document.createElement('div');
    controlUI.className = 'controlOuter';
    controlUIClick.appendChild(controlUI);

    var controlImage = document.createElement('img');
    controlImage.src = 'icons/options.png';
    controlImage.className = 'controlOptions';
    controlUI.appendChild(controlImage);

    google.maps.event.addDomListener(controlUIClick, 'click', function () {
        var divGray = document.createElement('div');
        divGray.id = 'darkGrayOverlay';
        document.body.appendChild(divGray);
        

        var divoptionsDialogTop = document.createElement('div');
        divoptionsDialogTop.id = "optionsTopID";
        divoptionsDialogTop.className = "optionsDialogTop";
        var topHtml = "<div style='display:block;margin-left:17px;margin-top:18px;float:left'><img src='icons/";
        if (map.getMapTypeId() == "map_night") {
            topHtml += "close_btn_n.png";
        } else {
            topHtml += "close_btn.png";
        }
        topHtml += "' width='20px' style='vertical-align:sub'></div>" +
            "<div style='display:block;margin-right:30px;margin-top:18px;font-family:sans-serif;font-size:14px;font-style:italic;float:right;color:#707070'>" +
            "<img src='icons/info.png' width='18' style='vertical-align:sub'> add the new URL to favorites to save these settings</div>";
        divoptionsDialogTop.innerHTML = topHtml;
        divoptionsDialogTop.style.textAlign = "right";
        if (map.getMapTypeId() == "map_night") divoptionsDialogTop.className += " optionsDialogTopNight";
        document.body.appendChild(divoptionsDialogTop);

        var divOptions = document.createElement('div');
        divOptions.id = 'optionsDialogId';
        var className = "optionsDialog";  
        if (map.getMapTypeId() == "map_night") className += " optionsDialogNight";
        divOptions.className = className;
        document.body.appendChild(divOptions);
        
        var div = document.createElement('div');
        div.style.overflow = "hidden";
        divOptions.appendChild(div);
        
        var frameOptions = document.createElement('iframe');
        frameOptions.id = "optionsID";
        frameOptions.src = "options.htm?" + "maptype=" + map.getMapTypeId() + "&display_mode=" + gNightMode.value + "&traffic=" + (showTraffic ? "1" : "0") +
            "&zoom=" + (map.getZoom() - 10) + "&showAccidents=" + (showAccidents ? "1" : "0") + "&showHazzards=" + (showHazzards ? "1" : "0") +
            "&showClosures=" + (showClosures ? "1" : "0") + "&showConstruction=" + (showConstruction ? "1" : "0") +
            "&showPolice=" + (showPolice ? "1" : "0") + "&showPoliceHiding=" + (showPoliceHiding ? "1" : "0") + "&trafficJam=" + (showTrafficJams ? "1" : "0") + 
            "&redlightCamera=" + (showRedlightWarn ? "1" : "0") + "&speedCamera=" + (showSpeedWarn ? "1" : "0") +
            "&lat=" + gCarPosition.lat().toFixed(5) + "&lng=" + gCarPosition.lng().toFixed(5) + "&cameraPOI=" + encodeURIComponent(gPoiLastUrl);
        frameOptions.scrolling = "no";
        frameOptions.style.height = "100%";
        frameOptions.style.width = "100%";
        frameOptions.style.boder = "200px none";
        frameOptions.frameBorder = "0";
        divOptions.appendChild(frameOptions);
         
        divGray.onclick = OptionsClosed;
        divoptionsDialogTop.onclick = OptionsClosed;

        return;
    });
}

function OptionsClosed() {
    console.log('Options Closed');
    var optionsDlg = document.getElementById("optionsID").contentWindow;
    var displayMode = optionsDlg.displayMode;
    var trafficMode = optionsDlg.trafficMode;
    var trafficJamsMode = optionsDlg.trafficJamMode;
    var zoom = optionsDlg.zoom + 10;
    var alertAccident = optionsDlg.alertAccident;
    var alertHazzard = optionsDlg.alertHazzard;
    var alertClosed = optionsDlg.alertClosed;
    var alertConstruction = optionsDlg.alertConstruction;
    var alertPolice = optionsDlg.alertPolice;
    var alertPoliceHiding = optionsDlg.alertPoliceHiding;
    var warnRedlightCamera = optionsDlg.warnRedlightCamera;
    var warnSpeedCamera = optionsDlg.warnSpeedCamera;

    element = document.getElementById("optionsDialogId");
    element.parentNode.removeChild(element);
    element = document.getElementById("optionsTopID");
    element.parentNode.removeChild(element);

    // nothing changed in the options dialog
    if (displayMode == gNightMode.value &&
        trafficMode == showTraffic &&
        trafficJamsMode == showTrafficJams &&
        zoom == gMap.getZoom() && 
        alertAccident == showAccidents &&
        alertHazzard == showHazzards &&
        alertClosed == showClosures &&
        alertConstruction == showConstruction &&
        alertPolice == showPolice &&
        alertPoliceHiding == showPoliceHiding &&
        warnRedlightCamera == showRedlightWarn &&
        warnSpeedCamera == showSpeedWarn) {

        element = document.getElementById("darkGrayOverlay");
        element.parentNode.removeChild(element);
        return;
    }

    var url = window.location.origin + window.location.pathname + "?";

    if (displayMode == 1) {
        url += "display_mode=Day&";
    } else if (displayMode == 2) {
        url += "display_mode=Night&";
    }
    document.cookie = "nightMode=" + displayMode + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";

    if (trafficMode == 0) {
        url += "traffic=off&";
    } 
    document.cookie = "trafficMode=" + (trafficMode ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";

    if (trafficJamsMode == 0) {
        url += "trafficJams=off&";
    }
    document.cookie = "trafficJamMode=" + (trafficJamsMode ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";

    url += "zoom=" + zoom + "&";
    document.cookie = "zoom=" + zoom + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";

    document.cookie = "showAccidents=" + (alertAccident ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (alertAccident == 0)
    {
        url += "showAccidents=off&";
    }

    document.cookie = "showHazzards=" + (alertHazzard ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (alertHazzard == 0) {
        url += "showHazzards=off&";
    }

    document.cookie = "showClosures=" + (alertClosed ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (alertClosed == 0) {
        url += "showClosures=off&";
    }

    document.cookie = "showConstruction=" + (alertConstruction ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (alertConstruction == 0) {
        url += "showConstruction=off&";
    }

    document.cookie = "showPolice=" + (alertPolice ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (alertPolice == 0) {
        url += "showPolice=off&";
    }

    document.cookie = "showPoliceHiding=" + (alertPoliceHiding ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (alertPoliceHiding == 0) {
        url += "showPoliceHiding=off&";
    }

    document.cookie = "showRedlightWarn=" + (warnRedlightCamera ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (warnRedlightCamera == 0) {
        url += "showRedlightWarn=off&";
    }

    document.cookie = "showSpeedWarn=" + (warnSpeedCamera ? "1" : "0") + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    if (warnSpeedCamera == 0) {
        url += "showSpeedWarn=off&";
    }

    parent.location.replace(url);
}

function AddZoomControls(controlDiv, map) {

    // zoom in
    var controlUIZoomInClick = document.createElement('div');
    controlUIZoomInClick.className = 'controlZoomInClickArea';
    controlDiv.appendChild(controlUIZoomInClick);

    var controlUIZoomIn = document.createElement('div');
    controlUIZoomIn.className = 'controlOuter';
    controlUIZoomInClick.appendChild(controlUIZoomIn);

    gControlTextZoomInDiv = document.createElement('div');
    gControlTextZoomInDiv.className = 'controlText';
    gControlTextZoomInDiv.innerHTML = '+';
    controlUIZoomIn.appendChild(gControlTextZoomInDiv);

    google.maps.event.addDomListener(controlUIZoomInClick, 'click', function () {
        gUpdateCount = 0;

        var newZoom = map.getZoom() + 1;
        map.setZoom(newZoom)
        document.cookie = "zoom=" + map.getZoom() + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    });

    // zoom out
    var controlUIZoomOutClick = document.createElement('div');
    controlUIZoomOutClick.className = 'controlZoomOutClickArea';
    controlDiv.appendChild(controlUIZoomOutClick);

    var controlUIZoomOut = document.createElement('div');
    controlUIZoomOut.className = 'controlOuter';
    controlUIZoomOutClick.appendChild(controlUIZoomOut);

    gControlTextZoomOutDiv = document.createElement('div');
    gControlTextZoomOutDiv.className = 'controlText';
    gControlTextZoomOutDiv.innerHTML = '<B>-<B/>';
    controlUIZoomOut.appendChild(gControlTextZoomOutDiv);

    google.maps.event.addDomListener(controlUIZoomOutClick, 'click', function () {
        gUpdateCount = 0;

        var newZoom = map.getZoom() - 1;
        map.setZoom(newZoom)
        document.cookie = "zoom=" + map.getZoom() + "; expires=Thu, 18 Dec 2050 12:00:00 UTC";
    });
}

function updateArrow(rotation, callback) {

    if (gArrowCanvas == null) {
        gArrowCanvas = document.getElementById('arrow');
        gArrowCanvas.width = 160;
        gArrowCanvas.height = 160;
    }

    var context = gArrowCanvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, gArrowCanvas.width, gArrowCanvas.height);

    // translate context to center of canvas
    context.translate(gArrowCanvas.width / 2, gArrowCanvas.height / 2);
    context.rotate(rotation / 180 * Math.PI);

    context.drawImage(gCarArrowIcon, -gCarArrowIcon.width / 2, -gCarArrowIcon.width / 2);
    callback(
        {
            'url': gArrowCanvas.toDataURL(),
            'scaledSize': new google.maps.Size(40, 40),
            'origin': new google.maps.Point(0, 0),
            'anchor': new google.maps.Point(20, 20),
        });
}

function declutterMap(map) {
    
    var declutterZoomLevel = 10;

    if (map.getZoom() <= declutterZoomLevel) {
        if (gPoiLayer != null && gPoiLayer.map != null) {
            gPoiLayer.setMap(null);
        }
        if (gAlertLayer != null) {
            // hide old events
            gAlertLayer.forEach(function (feature) {
                var eventTimeSpanMins = (new Date() - new Date(feature.getProperty("pubMillis"))) / 60 / 1000;
                if (eventTimeSpanMins > 15 && feature.getProperty("subtype") != "POLICE_HIDING") {
                    feature.setProperty('visible', false);
                }
            });
        }
    }
    else {
        if (gPoiLayer != null && gPoiLayer.map == null) {
            gPoiLayer.setMap(map);
        }
        if (gAlertLayer != null) {
            gAlertLayer.forEach(function (feature) {
                if (feature.getProperty("visible") == false) {
                    feature.setProperty('visible', true);
                }
            });
        }
    }
    
}

function heading(latdiff, lngdiff) {
    var heading;
    if (lngdiff != 0) {
        var angle = Math.atan(latdiff / lngdiff) * 180 / Math.PI;
        heading = -1 * angle + 90;

        if (lngdiff < 0)
            heading += 180;

    } else {
        if (latdiff > 0)
            heading = 0;
        else 
            heading = 180;
    }
    return heading;
}

function tileProject(latLng, zoom) {
    var TILE_SIZE = 256;
    var scale = 1 << zoom;

    var siny = Math.sin(latLng.lat() * Math.PI / 180);

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);

    var x = (0.5 + latLng.lng() / 360);
    var y = (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));

    return new google.maps.Point(Math.floor(x * scale), Math.floor(y * scale));
}

function fromPixelToLatLng (map, pixel) {
    var scale = Math.pow(2, map.getZoom());
    var proj = map.getProjection();
    var bounds = map.getBounds();

    var nw = proj.fromLatLngToPoint(
      new google.maps.LatLng(
        bounds.getNorthEast().lat(),
        bounds.getSouthWest().lng()
      ));
    var point = new google.maps.Point();

    point.x = pixel.x / scale + nw.x;
    point.y = pixel.y / scale + nw.y;

    return proj.fromPointToLatLng(point);
}

function fromLatLngToPixel (map, position) {
    var scale = Math.pow(2, map.getZoom());
    var proj = map.getProjection();
    var bounds = map.getBounds();

    var nw = proj.fromLatLngToPoint(
      new google.maps.LatLng(
        bounds.getNorthEast().lat(),
        bounds.getSouthWest().lng()
      ));
    var point = proj.fromLatLngToPoint(position);

    return new google.maps.Point(
      Math.floor((point.x - nw.x) * scale),
      Math.floor((point.y - nw.y) * scale));
}

function distanceMeters(lat1, lon1, lat2, lon2) {
    /** Converts numeric degrees to radians */
    if (typeof (Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        }
    }

    var radius = 6371e3; // meters
    var dLon = (lon2 - lon1).toRad(),
        lat1 = lat1.toRad(),
        lat2 = lat2.toRad(),
        distance = Math.acos(Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon)) * radius;

    return distance;
}

function getCookieInt(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return parseInt(c.substring(name.length, c.length));
        }
    }
    return Number.NaN;
} 

(window.onpopstate = function () {
    var match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

    gUrlParams = {};
    while (match = search.exec(query))
        gUrlParams[decode(match[1])] = decode(match[2]);

    isHttps = (window.location.protocol == "https:");
})();
