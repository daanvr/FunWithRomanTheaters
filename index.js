// includes Mapbox .js file

var geojsonCamera = {
    type: "FeatureCollection",
    features: []
  };
  var geojsonLineOfSight = {
    type: "FeatureCollection",
    features: []
  };
  
  mapboxgl.accessToken =  "pk.eyJ1IjoiZ291ZGFwcGVsIiwiYSI6ImNqeXprc3phbjAybTEzZGxqZzR1OHZqOWEifQ.jRzPHdAKKUmyL72_8-2glw"; 
  var map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/mapbox/satellite-v9", // style URL
    center: [5.735978, 36.32068], 
    zoom: 16,
    pitch: 45,
    bearing: 0 
  });
  
  
  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
  );
  
  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());
  
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
    $("#jsonresults").append("testing");
    // console.log(apiResult.query.pages);
  
    $.each(apiResult.query.pages, function (key, value) {
      // console.log(value);encodeURI(value.title)
      var url =
        "http://commons.wikimedia.org/wiki/Special:FilePath/" +
        encodeURIComponent(value.title);
      // console.log(url);
      if (value.coordinates != undefined) {
        if (value.coordinates.length == 1) {
          if (value.coordinates[0].type == "camera") {
            addPointTogeojsonCamera(
              value.coordinates[0].lon,
              value.coordinates[0].lat,
              url
            );
          }
        } else if (value.coordinates.length > 1) {
          addLineOfSightToGeojson(
            value.coordinates[0].lon,
            value.coordinates[0].lat,
            value.coordinates[1].lon,
            value.coordinates[1].lat,
            url
          );
          for (i in value.coordinates) {
            if (value.coordinates[0].type == "camera") {
              addPointTogeojsonCamera(
                value.coordinates[0].lon,
                value.coordinates[0].lat,
                url
              );
            }
          }
        }
      }
    });
  }
  
  function addPointTogeojsonCamera(lon, lat, url) {
    var feature = {
      type: "Feature",
      properties: {
        url: url
      },
      geometry: {
        type: "Point",
        coordinates: [lon, lat]
      }
    };
  
    // var alreadyExists = jQuery.inArray(url, geojsonCamera.features);
  
    // var alreadyExists = $.grep(geojsonCamera.features, function(n) { return n.properties.url == url; })
    // console.log(alreadyExists)
  
    // if(alreadyExists.lenght == 0) {
    geojsonCamera.features.push(feature);
    // }
    updatesgeojsonCamera();
  }
  
  function addLineOfSightToGeojson(lon1, lat1, lon2, lat2, url) {
    geojsonLineOfSight.features.push({
      type: "Feature",
      properties: {
        url: url
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [lon1, lat1],
          [lon2, lat2]
        ]
      }
    });
    updatesgeojsonLineOfSight();
  }
  
  map.on("load", function () {
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
  
    map.on("mousemove", "camerasLayer", function (e) {
      if (e.features.length > 0) {
        url = e.features[0].properties.url;
        filterBy(url);
        preview(url);
      }
    });
    map.on("mouseleave", "camerasLayer", function () {
      filterBy();
      preview();
    });
    map.on("click", "camerasLayer", function (e) {
      if (e.features.length > 0) {
        url = e.features[0].properties.url;
        displayImage(url);
      }
    });
  
    map.on("mousemove", "lineOfSightLayer", function (e) {
      if (e.features.length > 0) {
        url = e.features[0].properties.url;
        filterBy(url);
        preview(url);
      }
    });
    map.on("mouseleave", "lineOfSightLayer", function () {
      filterBy();
      preview();
    });
    map.on("click", "lineOfSightLayer", function (e) {
      if (e.features.length > 0) {
        url = e.features[0].properties.url;
        displayImage(url);
      }
    });
    map.on("moveend", function () {
      getImagesFromWikiCommons();
    });
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
  
    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
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
  
  function displayImage(url) {
    if (url != undefined) {
      var html =
        '<img id="fullSizeImg" onclick="displayImage()" src="' +
        url +
        '?width=1920px" alt="">';
      $("body").append(html);
      $("#map").addClass("blur");
    } else {
      $("#fullSizeImg").remove();
      $("#map").removeClass("blur");
    }
  }
  
  