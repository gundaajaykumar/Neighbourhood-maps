// Declaring global variables now to satisfy strict mode
var graph;
var clientID;
var clientSecret;
var Location = function(stastics) {
	var self = this;
	this.name = stastics.name;
	this.lat = stastics.lat;
	this.long = stastics.long;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.phone = "";
      

	this.visible = ko.observable(true);
       

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(stastics) {
		var results =stastics.response.venues[0];
		
	self.street = results.location.formattedAddress[0];
     	self.city = results.location.formattedAddress[1];
      	
	}).fail(function() {
		alert("There was an error with the Foursquare API call. Please refresh the page to load Foursquare data.");
	});

	this.contentString = '<div class="info-window-content"><div class="title"><b>' + stastics.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";
// create a infowindow to display information about locations.
	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(stastics.lat, stastics.long),
			graph: graph,
			title: stastics.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(graph);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + stastics.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" ;

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(graph, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);
        

	graph = new google.maps.Map(document.getElementById('map'), {
			zoom: 12.4,
			center: {lat: 16.4303177, lng: 80.6644202}
	});

	// Foursquare API settings
	clientID = "V443OTCAQPJLCRY4QWBFYN3ZK5FDKGJOYDHLMI3O342IRVNN";
	clientSecret = "AK1JHLEG2D2KW14WF5HYVFNTUYFTBXYS4LDUUNRAHPR5URLB";

	trips.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var output = (string.search(filter) >= 0);
				locationItem.visible(output);
				return output;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}


function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection.");
}
