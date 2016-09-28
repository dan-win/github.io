    define(['durandal/composition','jquery','leaflet'], function(composition, $, L) {

        var ctor = function() {   };
     
        ctor.prototype.activate = function(settings) {
            this.settings = settings;

        };
     
        ctor.prototype.getHeaderText = function(item) {
            if (this.settings.headerProperty) {
                return this.settings.headerProperty;
            }
     
            return 'Your Map';
        };

        ctor.prototype.compositionComplete = function () {
            // body...
            console.log('compositionComplete: map-view:::::', $('#map-view'));
            this.map = new L.Map('map-view');

            // create the tile layer with correct attribution
            var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
            var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 12, attribution: osmAttrib, subdomains: 'abc'});       

            // start the map in Sweden:
            this.map.setView(new L.LatLng(63, 17),4);
            this.map.addLayer(osm);

        }
          
        return ctor;
    });

