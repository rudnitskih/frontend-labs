/*
 * Весь код обвернут в анонимную функцию для создания пространство имен, 
 * подробнее о патерне модуль 
 * "http://frontender.info/the-design-of-code-organizing-javascript/" 
 */
(function() {	
	/* 
	 * Подробнее о директиве "use strict"
	 * https://learn.javascript.ru/strict-mode
	 */
	"use strict";
	
	/*
	 * Если все таки необходимо создать переменную в глобальном
	 * пространство имен можно использовать свойство объекта window
	 */
	window.app = window.app || {};

	/*
	 * Функция для генерации боковой панели
	 * поскольку сезоны задаються в другом файле, мы можем получить 
	 * эти данные с помощью объекта "leagueData" и его соотвествуещего интерфейса  
	 */
	function renderSidebar() {
		var seasons = window.app.leagueData.getYears(),
			navSidebar = document.querySelector(".nav-sidebar"),
			liTemplate = navSidebar.querySelector("script[name='nav-years']"),
			navItems = "";

		if (Array.isArray(seasons) && liTemplate){
			liTemplate = liTemplate.innerHTML;
			/*
			 * Пример использования простой шаблонизации  
			 */
			seasons.forEach(function(season, i){
				navItems += liTemplate.replace('<%=years%>', season); 
			});
		}

		navSidebar.innerHTML = navItems;
		/*
		 * Добавление обратчика события по клику на панель навигации. 
		 */
		navSidebar.addEventListener("click", sidebarClickHandler);
		setPickedSeason();
	}

	function sidebarClickHandler(e){
		e = e || Event;
		var target = e.target;
		/*
		 * Когда происходит клик по событию, первым аргументом 
		 * функции обработчика есть объект Event, у которого есть свойство target
		 * которое указывает на Node элемент.
		 */
		while (target !== this) {
			if (target.classList.contains("nav-sidebar-item")) {
				setPickedSeason(target.outerText.trim());
			}
			target = target.parentNode;
		}

	}

	/*
	 * Функция, которая устанавливает активный сезон по клику 
	 * или при иницилизации приложения.
	 */
	function setPickedSeason(season){
		var seasons = window.app.leagueData.getYears(),
			i;
		if (!season) {
			season = localStorage.season;
			/*
			 * Если значения в localStorage отсутсвует, 
			 * сделать активным первый сезон из доступных
			 */
			if (!season) {
				season = seasons[0];
			}
		}
		i = seasons.indexOf(season);
		/*
		 * Управлениями классами в элементах навигации
		 */
		if (season && i > -1) {
			var items = document.querySelectorAll(".nav-sidebar-item");
			localStorage.setItem("season", season);
			window.app.currentSeason = season;
			for (var j = 0; j < items.length; j++) {
				var classList = items[j].classList;
				if (j === i) {
					classList.add("active");
				} else {
					classList.remove("active");
				}
			}
			
			/*
			 * Получения необходимых матчей согласно сезону
			 */
			window.app.leagueData.getMatches(season, renderMatches);
		}
	}

	function renderMatches (matches, season) {
		if (!Array.isArray(matches)) return;
		var matchesBody = document.getElementsByClassName("matches-results__body")[0],	
			matchesHtml = "",
			res = "";
			
		/*
		 * Другой способ генерации разметки и спользованиям строк
		 */
		matches.forEach(function(round){
			matchesHtml += "<tr class='mathes-results__round-name'><td colspan='3'>" + round.name + "</td></tr>";
			round.matches.forEach(function(match){
				matchesHtml += "<tr>" +
					"<td>" + match.date + "</td>" +
					"<td>" + match.team1.name + " - " + match.team2.name + "</td>" +
					"<td>" + match.score1 + " - " + match.score2 + "</td>" +
				"</tr>";
			});
		});

		matchesBody.innerHTML = matchesHtml;
		window.app.leagueData.getLeagueResults(matches, season, renderChampions);
	}

	function renderChampions (results) {
		var key,
			teamsArray = [],
			length = 3,
			i = 0,
			team,
			champions = document.getElementsByClassName("champions")[0],
			championsInnerHtml = "",
			championTemplate = document.querySelector("script[name='champion']").innerHTML;

		for (key in results ){
			teamsArray.push(results[key]);
		}
		teamsArray = teamsArray.sort(function(a, b){
			return b.totalScore - a.totalScore;
		});

		while (i < length) {
			team = teamsArray[i],
			championsInnerHtml += championTemplate
				.replace('<%=championName%>', team.name)
				.replace('<%=championPlace%>', romanize(i+1))
				.replace('<%=championScore%>', team.totalScore);
			i++;
		}
		champions.innerHTML = championsInnerHtml;
		
	}

	/*
	 * Функция первода десятичных чисел в римские
	 */
	function romanize (num) {
		if (!+num) return false;
		var	digits = String(+num).split(""),
			key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
			       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
			       "","I","II","III","IV","V","VI","VII","VIII","IX"],
			roman = "",
			i = 3;
		while (i--)
			roman = (key[+digits.pop() + (i * 10)] || "") + roman;
		return Array(+digits.join("") + 1).join("M") + roman;
	}

	renderSidebar();
	
})();