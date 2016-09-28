    define(['durandal/composition', 'knockout', 'jquery','chart', 'knockout.chart'], 
    	function(composition, ko, $) {

        var ctor = function() {  
        	var self = this;

			self.ForImages = ko.observable(70);
			self.FreeSpace = ko.observable(900);
			self.ForVideo = ko.observable(30);

			self.SpaceData = [ //SpaceData
				{
					value: self.ForImages,
					color:"#464AF7",
					highlight: "#5A5EFF",
					label: "Images"
				},
				{
					value: self.FreeSpace,
					color: "#46BFBD",
					highlight: "#5AD3D1",
					label: "Free space"
				},
				{
					value: self.ForVideo,
					color: "#FDB45C",
					highlight: "#FFC870",
					label: "Video"
				}
			];

			self.legend = ko.observable('');
     
	        self.activate = function(settings) {
	            self.settings = settings;

	        };
	     
	        self.getHeaderText = function(item) {
	            if (self.settings.headerProperty) {
	                return self.settings.headerProperty;
	            }
	     
	            return 'Your Space';
	        };

	        self.compositionComplete = function () {
	            // body...
	        }
        };
          
        return ctor;
    });

