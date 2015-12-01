(function() {
	"use strict";
	
	window.app = window.app || {};

	function renderSidebar() {
		var seasons = window.app.leagueData.getYears(),
			navSidebar = document.querySelector(".nav-sidebar"),
			liTemplate = navSidebar.querySelector("script[name='nav-years']"),
			navItems = "";

		if (Array.isArray(seasons) && liTemplate){
			liTemplate = liTemplate.innerHTML;
			seasons.forEach(function(season, i){
				navItems += liTemplate.replace('<%=years%>', season); 
			})
		}

		navSidebar.innerHTML = navItems;
		navSidebar.addEventListener("click", sidebarClickHandler);
		setPickedSeason();
	}

	function sidebarClickHandler(e){
		e = e || Event;
		var target = e.target;
		while (target !== this) {
			if (target.classList.contains("nav-sidebar-item")) {
				setPickedSeason(target.outerText.trim());
			}
			target = target.parentNode;
		}

	}

	function setPickedSeason(season){
		var seasons = window.app.leagueData.getYears(),
			i;
		if (!season) {
			season = localStorage["season"];
			if (!season) {
				season = seasons[0]
			}
		};
		i = seasons.indexOf(season);
		if (season && i > -1) {
			var items = document.querySelectorAll(".nav-sidebar-item");
			localStorage.setItem("season", season);
			window.app.currentSeason = season;
			for (var j = 0; j < items.length; j++) {
				var classList = items[j].classList;
				j === i ? classList.add("active") : classList.remove("active");
			};
			
			renderMatches(season);
		}
	}
	function renderMatches (season) {
		var matches = window.app.leagueData.getMatches(season),
			matchesBody = document.getElementsByClassName("matches-results__body")[0],	
			matchesHtml = "",
			res = "";

		if (Array.isArray(matches)) {
			matches.forEach(function(round){
				matchesHtml += "<tr class='mathes-results__round-name'><td colspan='3'>" + round.name + "</td></tr>";
				round.matches.forEach(function(match){
					matchesHtml += "<tr>" +
						"<td>" + match.date + "</td>" +
						"<td>" + match.team1.name + " - " + match.team2.name + "</td>" +
						"<td>" + match.score1 + " - " + match.score2 + "</td>" +
					"</tr>";
				});
			})
			matchesBody.innerHTML = matchesHtml;
			window.app.currentRes = window.app.leagueData.getLeagueResults(matches, season);
			renderChampions();
		}
	}

	function renderChampions () {
		var key,
			teamsArray = [],
			length = 4,
			i = 0,
			team,
			champions = document.getElementsByClassName("champions")[0],
			championsInnerHtml = "",
			championTemplate = document.querySelector("script[name='champion']").innerHTML;

		for (key in window.app.currentRes ){
			teamsArray.push(window.app.currentRes[key])
		}
		teamsArray = teamsArray.sort(function(a, b){
			return b.totalScore - a.totalScore;
		})
		while (i < length) {
			team = teamsArray[i],
			championsInnerHtml += championTemplate
				.replace('<%=championName%>', team.name)
				.replace('<%=championScore%>', team.totalScore)
			i++;
		}
		champions.innerHTML = championsInnerHtml;
		
	};

	renderSidebar()
	
})();