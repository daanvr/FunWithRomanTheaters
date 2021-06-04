// includes Mapbox .js file

var geojsonCamera = {
    type: "FeatureCollection",
    features: []
};
var geojsonLineOfSight = {
    type: "FeatureCollection",
    features: []
};

mapboxgl.accessToken = "pk.eyJ1IjoiZ291ZGFwcGVsIiwiYSI6ImNqeXprc3phbjAybTEzZGxqZzR1OHZqOWEifQ.jRzPHdAKKUmyL72_8-2glw";
var map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/mapbox/satellite-v9", // style URL
    center: [15, 38],
    zoom: 4.5,
    pitch: 0,
    bearing: 0,
    hash: true
});

map.addControl(new MapboxGeocoder({ accessToken: mapboxgl.accessToken, mapboxgl: mapboxgl }));
map.addControl(new mapboxgl.FullscreenControl());
map.doubleClickZoom.disable();
map.addControl(new mapboxgl.NavigationControl());// Add zoom and rotation controls to the map.
// map.addControl(new MapboxStyleSwitcherControl());


$(document).ready(function () {
    getImagesFromWikiCommons();
});

function getImagesFromWikiCommons() {
    let canvas = map.getCanvas();
    let w = canvas.width;
    let h = canvas.height;
    let cUL = map.unproject([0, 0]).toArray();
    let cLR = map.unproject([w, h]).toArray();
    var bbox = cUL[1] + "|" + cUL[0] + "|" + cLR[1] + "|" + cLR[0];
    // console.log(bbox);
    $.ajax({
        url: "https://commons.wikimedia.org/w/api.php",
        data: {
            action: "query",
            format: "json",
            prop: "coordinates",
            generator: "geosearch",
            utf8: 1,
            colimit: "500",
            coprop: "type|name",
            coprimary: "all",
            ggsbbox: bbox,
            ggslimit: "500",
            ggsnamespace: "6|14",
            ggsprop: "type|name",
            ggsprimary: "all"
        },
        dataType: "jsonp",
        success: processResult
    });
}

function processResult(apiResult) {
    console.log(apiResult.query.pages);
    $.each(apiResult.query.pages, function (key, value) {

        var prop = {
            title: value.title.replace("File:", ""),
            url: "http://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(value.title),
        }

        if (value.coordinates != undefined) { //if there are any coordinates
            for (i in value.coordinates) { // look throug all coordinates 
                if (value.coordinates[i].type == "camera") { // if type is camera
                    prop.cameraLonLat = [value.coordinates[i].lon, value.coordinates[i].lat] // save camera coordinats
                } else if (value.coordinates[i].type == "object") { // if type is object 
                    prop.subjectLonLat = [value.coordinates[i].lon, value.coordinates[i].lat] // save subject coordinats
                }
            }
        }

        if (prop.cameraLonLat != undefined && prop.subjectLonLat != undefined) {
            addPointTogeojsonCamera(prop);
            addLineOfSightToGeojson(prop);
        } else if (prop.cameraLonLat != undefined) {
            addPointTogeojsonCamera(prop);
        }

    });
}

function addPointTogeojsonCamera(prop) {
    for (i in geojsonCamera.features) {
        if (geojsonCamera.features[i].properties.title === prop.title) {
            return;
        }

    }
    var feature = {
        type: "Feature",
        properties: prop,
        geometry: {
            type: "Point",
            coordinates: prop.cameraLonLat
        }
    };
    geojsonCamera.features.push(feature);
    updatesgeojsonCamera();

    // var alreadyExists = jQuery.inArray(url, geojsonCamera.features);

    // var alreadyExists = $.grep(geojsonCamera.features, function(n) { return n.properties.url == url; })
    // console.log(alreadyExists)

    // if(alreadyExists.lenght == 0) {
    // }
}

function addLineOfSightToGeojson(prop) {
    geojsonLineOfSight.features.push({
        type: "Feature",
        properties: prop,
        geometry: {
            type: "LineString",
            coordinates: [
                prop.cameraLonLat,
                prop.subjectLonLat
            ]
        }
    });
    updatesgeojsonLineOfSight();
}

map.on("load", function () {
    map.addSource("AmphGeojson", {
        type: "geojson",
        data: "https://raw.githubusercontent.com/daanvr/FunWithRomanTheaters/main/AmphLocations.geojson"
    });
    map.addSource("cameras", {
        type: "geojson",
        data: geojsonCamera
    });
    map.addSource("lineOfSight", {
        type: "geojson",
        data: geojsonLineOfSight
    });
    map.addLayer({
        id: "lineOfSightLayer",
        type: "line",
        source: "lineOfSight",
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": "hsla(177, 100%, 100%, 0.5)",
            "line-width": 3
        }
    });
    map.addLayer({
        id: "camerasLayer",
        type: "circle",
        source: "cameras",
        layout: {},
        paint: {
            "circle-color": "hsla(177, 100%, 100%, 0.10)",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 5, 14, 10]
        }
    });
    map.addLayer({
        id: "AmphStyle",
        type: "circle",
        source: "AmphGeojson",
        layout: {},
        paint: {
            "circle-color": ["get", "marker-color"],
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 6, 5, 14, 10]
        }
    });

    // START testing other code:




    // END testinf other code


    map.on("dblclick", "AmphStyle", function (e) {

        console.log("DBclick");
        console.log(e.features[0].geometry.coordinates);
        map.flyTo({
            center: e.features[0].geometry.coordinates,
            // maxDuration: 1000,
            zoom: 16,
            speed: 1
        });
    });

    map.on("mousemove", "AmphStyle", function (e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on("mouseleave", "AmphStyle", function (e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on("mousemove", "camerasLayer", function (e) {
        if (e.features.length > 0) {
            url = e.features[0].properties.url;
            filterBy(url);
            preview(url + "?width=300px");
        }
    });
    map.on("mouseleave", "camerasLayer", function () {
        filterBy();
        preview();
    });
    map.on("click", "camerasLayer", function (e) {
        if (e.features.length > 0) {
            // url = e.features[0].properties.url;
            displayImage(e.features[0].properties);
        }
    });
    map.on("mousemove", "lineOfSightLayer", function (e) {
        if (e.features.length > 0) {
            url = e.features[0].properties.url;
            filterBy(url);
            preview(url + "?width=300px");
        }
    });
    map.on("mouseleave", "lineOfSightLayer", function () {
        filterBy();
        preview();
    });
    map.on("click", "lineOfSightLayer", function (e) {
        if (e.features.length > 0) {
            // url = e.features[0].properties.url;
            displayImage(e.features[0].properties);
        }
    });

    map.on("dragend", function () {
        getImagesFromWikiCommons();
    });

    map.addSource("mapbox-dem", { // Terreain level source
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14
    });
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 }); // add the DEM source as a terrain layer with exaggerated height
    map.addLayer({ // add a sky layer that will show when the map is highly pitched
        id: "sky",
        type: "sky",
        paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0.0, 0.0],
            "sky-atmosphere-sun-intensity": 15
        }
    });
});

function updatesgeojsonCamera() {
    map.getSource("cameras").setData(geojsonCamera);
}

function updatesgeojsonLineOfSight() {
    map.getSource("lineOfSight").setData(geojsonLineOfSight);
}

function filterBy(url) {
    if (url != undefined) {
        var filter = ["==", ["get", "url"], url];
        map.setFilter("lineOfSightLayer", filter);
        map.setFilter("camerasLayer", filter);
    } else {
        map.setFilter("lineOfSightLayer", null);
        map.setFilter("camerasLayer", null);
    }
}

function preview(url) {
    if (url != undefined) {
        if (!$("#preview").length) {
            var html = '<img id="preview" src="' + url + '?width=300px" alt="">';
            $("#map").append(html);
        }
    } else {
        $("#preview").remove();
    }
}


// =====================================================
// =====================================================
// ========= Use seperate .js file for Gallery  ========
// ========= Use seperate .css file for Gallery ========
// =====================================================
// =====================================================

function displayImage(prop) {

    if (prop != undefined) {
        var nearestArray = findArrayOfNearestPoints(prop);

        var imgForCarousel = [];
        for (i in nearestArray) {
            // ======== generate every new img =======
            //expecting an object with: alt, imgUrl, commonsUrl, locatorUrl, imgLng, imgLat
            var newCarousselImg = {
                title: nearestArray[i].title,
                alt: nearestArray[i].title,
                imgUrl: nearestArray[i].url + "?width=1200px",
                commonsUrl: nearestArray[i].url,
                locatorUrl: "",
                imgLng: nearestArray[i].cameraLonLat[0],
                imgLat: nearestArray[i].cameraLonLat[1]
            };
            imgForCarousel.push(newCarousselImg)

        }
        // resetCarouselContent(imgForCarousel)
        newImgBoxs(imgForCarousel);

    } else {
        galeryVieuw(false) // back to normal map mode (no blure)
        resetCarouselContent() // remove images in carousel
    }
}

function makeCarouselSectionVisible() {
    galeryVieuw(true);
}

function carouselPositionCallback(ImgLonLat) {
    map.flyTo({
        center: ImgLonLat,
        speed: 1
    });
}

function galeryVieuw(on) {
    if (on) {
        $(".mapboxgl-canvas-container").addClass("blur");
        $(".mapboxgl-control-container").addClass("blur");
        $("#carouselSection").addClass("on")
    } else {
        $(".mapboxgl-canvas-container").removeClass("blur");
        $(".mapboxgl-control-container").removeClass("blur");
        $("#carouselSection").removeClass("on")
        // ========= when gallery closed, galery should be emptied. =========
    }
}


function findArrayOfNearestPoints(prop) {
    var nearestPointsArray = [];
    var refLonLat = turf.point(JSON.parse(prop.cameraLonLat)); // make geojson point form LonLat string
    var geojsonLayerMapbox = map.getSource('cameras')._data // geojson from camera layer
    const geojsonLayer = JSON.parse(JSON.stringify(geojsonLayerMapbox));

    console.log(geojsonLayer)
    for (i in geojsonLayer.features) { // for as many thies as there are points in the layer
        var nearest = turf.nearestPoint(refLonLat, geojsonLayer).properties // Look for nearest point. and only keep properties
        nearestPointsArray.push(nearest) // save properties of nearest point to be sent back.
        geojsonLayer.features.splice(nearest.featureIndex, 1); // remove the nearest point from the layer to be able to find the next nearest
    }

    return nearestPointsArray;// retrun array of properties in order of nearest.
}