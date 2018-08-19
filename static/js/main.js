mapboxgl.accessToken = 'pk.eyJ1IjoibmFzc2FjYXJpdGFzIiwiYSI6ImNqa2FweGhqcTF2dm4zd24xa2w0c3pzNDkifQ.IIEkXeNO8hhuQZu-Mw7Frg'

var filterBtn = document.getElementById('filter-btn');
var clearBtn = document.getElementById('clear-btn');

$(document).ready(function(){

    // MAP
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9',
        // style: 'mapbox://styles/mapbox/light-v9',
        // style: {"version": 8, "name": "Satellite", "metadata": {"mapbox: autocomposite":true, "mapbox: type": "default"}, "sources": {"mapbox": {"type": "raster", "url": "mapbox:\/\/mapbox.satellite", "tileSize": 256}}, "sprite": "mapbox:\/\/sprites\/mapbox\/satellite-v9","glyphs": "mapbox:\/\/fonts\/mapbox\/{fontstack}\/{range}.pbf", "layers": [{"id": "background","type": "background", "paint": {"background-color": "rgb(4,7,14)"}}, {"id": "satellite", "type": "raster", "source": "mapbox", "source-layer": "mapbox_satellite_full"}], "created": 0, "modified": 0, "owner": "mapbox", "id": "satellite-v9", "draft":false, "visibility": "public"},
        center: [121, 14.55],
        zoom: 10,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: [[120.2, 14.15], [121.8, 14.95]]
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', function() {

        map.addSource(
            'hsrl_ncr', {
            type: 'geojson',
            data: 'static/data/hsrl_ncr_2.geojson',
            // data: 'static/data/hsrl_ncr_1.geojson',
            }
        );

        map.addLayer({
            'id': 'settlements',
            'type': 'fill-extrusion',
            'source': 'hsrl_ncr',
            'layout': {},
            'paint': {
                // 'fill-extrusion-color': 'red',
                'fill-extrusion-color': [
                    "step",
                    ["get", "PopDensity"],
                        // "#ffe6e6", 10,
                        // "#ffadad", 20,
                        // "#ff7373", 30,
                        // "#ff3939", 50,
                        // "#ff0000", 2000,
                        "#FFEDA0", 10,
                        "#FED976", 20,
                        "#FD8D3C", 30,
                        "#FC4E2A", 50,
                        "#E31A1C", 200,
                        "#800026", 2000,
                        // "#800026", 2000,
                        // "#194266", 10,
                        // "#355c7d", 20,
                        // "#916681", 30,
                        // "#d28389", 50,
                        // "#e59a8f", 200,
                        // "#c06c84", 2000,
                        ["rgba", 255, 255, 255, 0]
                ],
                'fill-extrusion-opacity': 0.75,
                'fill-extrusion-height': [
                    "interpolate", ["linear"], ["zoom"],
                    10, 0,
                    15, ["number", ["*", 10, ['get', 'PopDensity']]]
                ],
            },
        });

        // map.addSource(
        //     'brgys_ncr', {
        //     type: 'geojson',
        //     data: 'static/data/brgys_ncr.geojson',
        //     }
        // );

        // map.addLayer({
        //     'id': 'brgys',
        //     'type': 'fill',
        //     'source': 'brgys_ncr',
        //     'layout': {},
        //     'paint': {
        //         'fill-opacity': 0,
        //     },
        // });

        map.resize();

        map.on('click', 'settlements', function (e) {
            showPopup(e);
        });
        map.on('mouseenter', 'settlements', function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'settlements', function () {
            map.getCanvas().style.cursor = '';
        });

        filterBtn.onclick = function() {
            var municity = document.getElementById('municity-text').value;
            var pdNum = Number(document.getElementById('pd-num-text').value) * 9;
            var pdComp = getComp(document.getElementById('pd-comp-text').value);
            if (municity && pdNum){
                map.setFilter('settlements', ['all', ['==', 'NAME_2', municity], [pdComp, 'PopDensity', pdNum]]);
            } else if (municity && !pdNum){
                map.setFilter('settlements', ['==', 'NAME_2', municity]);
            } else if (pdNum && !municity){
                map.setFilter('settlements', [pdComp, 'PopDensity', pdNum]);
            } else {
                map.setFilter('settlements', null);
            }
        };

        clearBtn.onclick = function() {

             document.getElementById('municity-text').value = '';
             document.getElementById('pd-num-text').value = '';
             document.getElementById('pd-comp-text').value = '';

             map.setFilter('settlements', null);
        };

        var layers = ['0-1', '1-2', '2-4', '4-5', '5-20', '20+'];
        var colors = ['#FFEDA0', '#FED976', '#FD8D3C', '#FC4E2A', '#E31A1C', '#800026'];

        for (i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var color = colors[i];
            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            var value = document.createElement('span');
            value.innerHTML = layer;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }

    });

    function getComp(e) {
        if (['==', '<', '>', '<=', '>='].includes(e)) {
            return e;
        } else {
            return '<=';
        }
    };

    function showPopup(e) {
        var popUps = document.getElementsByClassName('mapboxgl-popup');
        // Check if there is already a popup on the map and if so, remove it
        if (popUps[0]) popUps[0].remove();

        var coords = e.lngLat;
        var features =  map.queryRenderedFeatures(
          e.point,
          { layers: ['settlements'] }
        );

        var popup_html = '<strong><h3>' + (features[0].properties.PopDensity/9).toFixed(2) + ' persons per 100 sqm</h3></strong>'
                         + '<p>' + features[0].properties.NAME_3
                         + '<br>' + features[0].properties.NAME_2 + '</p>'

        // var features =  map.queryRenderedFeatures(
        //   e.point,
        //   { layers: ['settlements', 'brgys'] }
        // );

        // var popup_html = '<strong><h3>' + (features[1].properties.PopDensity/9).toFixed(2) + ' persons per 100 sqm</h3></strong>'
        //                  + '<p>' + features[0].properties.NAME_3
        //                  + '<br>' + features[0].properties.NAME_2 + '</p>'

       var popup_content = document.createElement('div');

       popup_content.innerHTML = popup_html;

       var popup = new mapboxgl.Popup()
           .setLngLat(coords)
           .setDOMContent(popup_content)
           .addTo(map);

       popup_content.parentNode.parentNode.className += ' custom-popup';

    }

})
