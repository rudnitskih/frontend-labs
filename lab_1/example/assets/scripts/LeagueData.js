/*
* В JS нет такого понятие как класс, но очень часто его сравнивают
* с функцией конструктором - это обычная функция 
* методы которые начинаються с _ - называються приватными и не должны
* использоваться в не "класса" 
*/
function LeagueData(){
	/*
	 * Конфигурация "класса"
	*/

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

	/*
	 * Формирования URL для получения необходимых файлов с сервера
	*/
	function _getJsonUrl(season, clubs){
		url = config.dataUrl + season + "/" + config.league +  ".1."; 
		url += clubs ? "clubs." : "";
		return url += "json";
	}

	/*
	 * Получение необходимых данных по URL, поскольку запрос 
	 * выполняеться асинхронно, необходимо передать функцию обратного
	 * вызова, которая выполниться в случае удачного запроса
	 */
	function _getString(url, successHandler) {
		/*
		 * "localStorage" - свойство глобального объеекта, которая дает 
		 * возможность сохранять данные на стороне клиента. Подробнее 
		 */
		if (localStorage[url]) {
			if (successHandler) {
				successHandler(localStorage[url]);
			}
		} else {
			/*
			 * Создание AJAX запроса и обработка результатов
			 */
			var xhr = typeof XMLHttpRequest != 'undefined' ?
				new XMLHttpRequest() :
				new ActiveXObject('Microsoft.XMLHTTP');
			xhr.open('get', url);
			xhr.send();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == XMLHttpRequest.DONE ) {
					if(xhr.status == 200 || xhr.status == 304){
						data = xhr.responseText;
						if (successHandler) {
							successHandler(data);	
						}
						localStorage.setItem(url, data);
					}
				}
			};
		}
	}

	function getMatches(season, successCb){
		var url = _getJsonUrl(season),
			matches;

		_getString(url, function(data){
			successCb(JSON.parse(data).rounds, season);
		}, function(status){
			alert(status);
		});
	}

	function getYears(){
		return config.years;
	} 

	function getClubs(season, successCB) {
		var url = _getJsonUrl(season, true);

		_getString(url, function(data){
			successCB(JSON.parse(data).clubs);
		});
	}
	/*
	 * Функция расчета результатов турнира
	 */
	function _calcResults (teams, matches) {
		var res = {};
		if (!Array.isArray(teams)) return;
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
			};
		});
		matches.forEach(function(round){
			round.matches.forEach(function(match){
				if (match.score1 > match.score2) {
					res[match.team1.code].win += 1;
				} else if (match.score1 < match.score2) {
					res[match.team2.code].win += 1;
				} else {
					res[match.team1.code].draw += 1;
					res[match.team2.code].draw += 1;
				}
				res[match.team1.code].matches += 1;
				res[match.team2.code].matches += 1;
				res[match.team1.code].scoredGoals += match.score1;
				res[match.team1.code].goalsAgainst += match.score2;
				res[match.team2.code].scoredGoals += match.score2;
				res[match.team2.code].goalsAgainst += match.score1;

			});
		});

		for (var key in res) {
			team = res[key];
			team.diff = team.scoredGoals - team.goalsAgainst;
			team.totalScore = team.win * 3 + team.draw;
			team.loss = team.matches - team.win - team.draw;
		}
		return res;
	}

	function getLeagueResults(matches, season, successCB) {
		var teams = getClubs(season, function(teams) {
			successCB(_calcResults(teams, matches));
		});
	} 
	/*
	 * Функция возвращает публичные методы, тем самым создавая замыкание
	 */
	return {
		getYears: getYears,
		getMatches: getMatches,
		getClubs: getClubs,
		getLeagueResults: getLeagueResults
	};

}

window.app = window.app || {};
/*
 * иницилизация класса
 */
window.app.leagueData = new LeagueData();