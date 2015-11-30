(function() {
	"use strict";

	function LeagueData(){
		var config = {
			dataUrl: "../../football_data",
			league: "en",
			years: [
				"2012-13",
				"2013-14",
				"2014-15",
				"2015-16"
			],
		};

		function getDataByYears(years){
			var xhr = new XMLHttpRequest()
			xhr.open('GET', 'phones.json', false);
		}

		return {
			config: config
		}

	}

	window.leagueData = new LeagueData();
	
})();