function LeagueData(){
	var config = {
		dataUrl: "http://rudnitskih.github.io/frontend-labs/lab_1/football_data/",
		league: "en",
		years: [
			"2012-13",
			"2013-14",
			"2014-15",
			"2015-16"
		],
	};

	function _getJsonUrl(season, clubs){
		url = config.dataUrl + season + "/" + config.league +  ".1."; 
		url += clubs ? "clubs." : "";
		return url += "json"
	}

	function _getString(url, successHandler, errorHandler) {
		if (localStorage[url]) {
			successHandler && successHandler(localStorage[url]);
		} else {
			var xhr = typeof XMLHttpRequest != 'undefined'
				? new XMLHttpRequest()
				: new ActiveXObject('Microsoft.XMLHTTP');
			xhr.open('get', url, false);
			xhr.send();
			status = xhr.status;
			if (status == 200) {
				data = xhr.responseText;
				successHandler && successHandler(data);
				localStorage.setItem(url, data)
			} else {
				errorHandler && errorHandler(status);
			}
		}
	};

	function getMatches(season){
		var url = _getJsonUrl(season),
			matches;

		_getString(url, function(data){
			matches = data;
		}, function(status){
			alert(status);
		});

		return JSON.parse(matches).rounds;
	}

	function getYears(){
		return config.years;
	} 

	function getClubs(season) {
		var url = _getJsonUrl(season, true),
			clubs;


		_getString(url, function(data){
			clubs = data;
		}, function(status){
			alert(status);
		});
		return JSON.parse(clubs).clubs;
	}

	function getLeagueResults (matches, season) {
		var teams = getClubs(season),
			res = {};
		if (Array.isArray(teams)) {
			teams.forEach(function (team) {
				res[team.code] = {
					name: team.name,
					win: 0,
					loss: 0,
					draw: 0,
					matches: 0,
					scoredGoals: 0,
					goalsAgainst: 0,
					diff: 0,
					totalScore: 0
				}
			});
			matches.forEach(function(round){
				round.matches.forEach(function(match){
					if (match.score1 > match.score2) {
						res[match.team1.code].win += 1
					} else if (match.score1 < match.score2) {
						res[match.team2.code].win += 1
					} else {
						res[match.team1.code].draw += 1
						res[match.team2.code].draw += 1
					}
					res[match.team1.code].matches += 1
					res[match.team2.code].matches += 1
					res[match.team1.code].scoredGoals += match.score1
					res[match.team1.code].goalsAgainst += match.score2
					res[match.team2.code].scoredGoals += match.score2
					res[match.team2.code].goalsAgainst += match.score1

				});
			})
			for (var key in res) {
				team = res[key];
				team.diff = team.scoredGoals - team.goalsAgainst;
				team.totalScore = team.win * 3 + team.draw;
				team.loss = team.matches - team.win - team.draw;
			}
		}
		return res;
	} 

	return {
		getYears: getYears,
		getMatches: getMatches,
		getClubs: getClubs,
		getLeagueResults: getLeagueResults
	}

}
if (!window.app) {
	window.app = {};
}
window.app.leagueData = new LeagueData();