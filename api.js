// THIS MODULE HANDLES API CALLS

const request = require('request');
const cheerio = require('cheerio');
const ical = require('ical');
const stringSimilarity = require('string-similarity');
const levenshtein = require('levenshtein');

// get train departures for station "Universität" (5006008) from metaEFA (https://github.com/opendata-stuttgart/metaEFA)
function getDepartures(callback) {
	const apidomain = "https://efa-api.asw.io/api/v1/station/5006008/departures/?format=json"
	request(apidomain, function (error, response, body) {
		console.log("Error - " + error);
		if(response.statusCode != 200){
			callback(true, null);
		}
		else{
			let trains = [];
			let departures = JSON.parse(body);
			for (var i = 0; i < departures.length; i++) {
				let testname = departures[i].number;
				let testident = testname.charAt(0);
				if (testident == "S") {
					trains.push(departures[i]);
					console.log(testname);
				}
			}
			callback(false, trains);
		}
	});
}

// same, but filter departures for a specific train. TODO: Remove redundant code
function getSpecificDepartures(name, callback) {
	const apidomain = "https://efa-api.asw.io/api/v1/station/5006008/departures/?format=json"
	request(apidomain, function (error, response, body) {
		console.log("Error - " + error);
		if(response.statusCode != 200){
			callback(true, null);
		}
		else{
			let trains = [];
			let departures = JSON.parse(body);
			for (var i = 0; i < departures.length; i++) {
				let testname = departures[i].number;
				if (testname == name.toUpperCase()) {
					trains.push(departures[i]);
					console.log(testname);
				}
			}
			callback(false, trains);
		}
	});
}

// used to fetch senderIDs of all PAuLA users for PSA messages
function getAllUsers(callback) {
	const apidomain = "http://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@paula.mi.hdm-stuttgart.de/users/";
	request(apidomain, function (error, response, body) {
		console.log("Error - " + error);
		let ids = [];
		let reply = JSON.parse(body);
		for (var i = 0; i < reply.users.length; i++) {
			let testId = reply.users[i];
			if (testId.length > 6) {
				ids.push(testId);
			}
		}
		callback(ids);
	});
}

// search for a professor's ID by name, then return details of that prof
function getProfRoom(profname, callback) {

	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	profname.replace(" ", "+");
	const searchBase = 'https://hdmapp.mi.hdm-stuttgart.de/search/anonymous/persons?q=';
	const searchUrl = searchBase + profname;
	let profID = 0;
	let proffound = true;


	request(searchUrl, function (error, response, body) {


		console.log(error);
		console.log('statusCode:', response && response.statusCode);
		console.log('body:', body);

		if(response.statusCode != 200){
			callback(true, {});
		}
		else{

			const searchresults = JSON.parse(body);
			if (searchresults.length === 0){
				proffound = false;
			}
			else{
				profID = searchresults[0].id;
				proffound = true;
			}

			console.log('id:', JSON.stringify(profID));

			const detailBase = "https://hdmapp.mi.hdm-stuttgart.de/details/anonymous/person/";
			const detailDomain = detailBase + profID;

			if(proffound){
				request(detailDomain, function (error, response, body) {

					console.log(error);
					console.log('statusCode:', response && response.statusCode);
					console.log('body:', body);

					const details = JSON.parse(body);
					const profRoom = details.room;
					const profName = details.name;
					const profTime = details.officehours;
					const profMail = details.email;
					const profJob = details.job;
					const profDepartment = details.department;

					callback(profRoom, profName, profTime, profMail, profJob, profDepartment);

				});
			}
			else{
				callback(null, null, null, null, null, null);
			}
		}
	});

}

// fetch HTML of the public eatntalk plan, parse meals
// thx to the HdM-Guide App project for the base code
function getSBar(callback) {
	const sbardomain = "http://www.s-bar.de/ihr-betriebsrestaurant/aktuelle-speiseplaene.html"
	request(sbardomain, function (error, response, body) {

		console.log("Error - " + error);

		// Clean HTML
		let text = body; //
		text = text.replace(/&[a-z]+;/g, " ") // replace html-entitiy-space with default space
		text = text.replace(/<\/?(b|br)>/ig, " ");
		text = text.replace(/\s{2,}/ig, " ");
		text = text.replace(/<span[^>]*>/ig, "<span>");
		text = text.replace(/<br[^>]*>/ig, "\n");
		text = text.replace(/<[^>]*>/ig, "");

		// Slice Eat'n'Talk
		var entMarker = "Wochenkarte des Eat 'n' Talk";
		text = text.substring(text.indexOf(entMarker) + entMarker.length + 6);
		var lines = text.split("\n");

		var datePattern = /^([a-z]+),\s+(\d{2})\.\s+([a-zäÄöÖüÜ]+)\s+(\d{4})$/ig;

		// Return array
		var days = [];
		var dayIter = 0;

		for (var i = 0; i < lines.length; i++) {
			// Remove leading and tailing whitespaces
			var line = lines[i].trim();
			//console.log("ARRAY:" +  line + "#####################END###########################");

			// Check if it's a date line
			if (datePattern.exec(line)) {
				console.log(line + " --- is day number " + dayIter);


				var meals = [];
				// Looking for meals
				for (var j = 0; j < 2; j++) {

					i++
					var meal = lines[i].substring(lines[i].indexOf("\n") + 1).trim();

					// Removing additives
					meal = meal.replace(/\([^\)]*\)/ig, "");
					console.log("Day " + dayIter + ", Meal " + j + ": " + meal);
					meals.push(meal);
					//days[dayIter].food[j] = meal;
					//currentMealArray.push(meal);

				}
				days.push({
					"date": line,
					meals
				});
				dayIter++;
			}
		}
		callback(days);
	});
}

// fetch mensa RSS feed and parse meals
// again, thx to the HdM-Guide App project
function getMensa(callback) {
	const mensadomain = "http://www.studierendenwerk-stuttgart.de/speiseangebot_rss"
	request(mensadomain, function (error, response, body) {
		var $ = cheerio.load(body, {
			xmlMode: true
		});


		var dates = [];
		$('item').each(function () {
			var dateArray = /(\d+). ([a-zäöü]+) (\d+)/i.exec($(this).find('title').text()); // finds and captures the date
			var day = dateArray[1];
			var monthname = dateArray[2];
			var year = dateArray[3];
			var month;
			switch (monthname) {
				case "Januar":
					month = 1;
					break;
				case "Februar":
					month = 2;
					break;
				case "März":
					month = 3;
					break;
				case "April":
					month = 4;
					break;
				case "Mai":
					month = 5;
					break;
				case "Juni":
					month = 6;
					break;
				case "Juli":
					month = 7;
					break;
				case "August":
					month = 8;
					break;
				case "September":
					month = 9;
					break;
				case "Oktober":
					month = 10;
					break;
				case "November":
					month = 11;
					break;
				case "Dezember":
					month = 12;
					break;
				default:
					month = 0;
					break;
			}
			var date = new Date(year, month - 1, day); // creating date object

			var description = $(this).find('description').text(); // the rest is a html cdata inside the description XML tag
			var $_ = cheerio.load(description);
			var date_entry = {};
			date_entry.date = date;
			date_entry.meals = [];

			var lastType = "";

			$_('tr').each(function () { // everything is in a messy html table
				var meal = $_(this).find('td:not([class])').text().replace(/(\r\n|\n|\r)/gm, "").trim(); // a tr without class contains the meal name
				var type = $_(this).find('td.name').text().replace(/(\r\n|\n|\r)/gm, "").trim(); // a tr with name class containts type or menu name (if there are also price tags)
				var price_stud = $_(this).find('td.price-student').text(); // trs with prices
				var price = $_(this).find('td.price-guest').text();



				// three cases of trs are to be distinguished: tr opening a new type group, tr containing a meal, and tr containing an additional meal (menu name in name tag in this case)
				if (price == "") { // new type
					lastType = type;
				} else {
					if (meal == "") { // second meal for type
						meal = type;
					} else { // first meal for type
						// nothing to prepare
					}
					type = lastType;
					var meal_entry = {};
					meal_entry.type = type;
					meal_entry.meal = meal;
					meal_entry.price_stud = parseFloat(price_stud);
					meal_entry.price = parseFloat(price);
					date_entry.meals.push(meal_entry);
				}

			});
			dates.push(date_entry);
		});
		callback(dates);
	});
}

// search personal timetable for lecture name and return details
// if no lecture is found, search globally
function getLectureDetails(id, query, callback) {
	fetchTimeTable(id, (error, days) => {
		if (!error) {
			days = JSON.parse(days);
			var filteredschedule = [];
			//fist off, iterate through every day
			for (var i = 0; i < 7; i++) {
				let todaysschedule = days[i].schedule;
				if (typeof todaysschedule !== 'undefined') {
					//then, iterate through the schedule of that day
					for (var j = 0; j < todaysschedule.length; j++) {
						let checkedlesson = todaysschedule[j].name.toLowerCase();
						if (checkedlesson.includes(query.toLowerCase())) {
							filteredschedule.push(todaysschedule[j]);
						};
					}
				}
			}
			if (filteredschedule.length > 0) {
				var lectureID = filteredschedule[0].lectureID;
				const detailBase = "https://hdmapp.mi.hdm-stuttgart.de/details/anonymous/lecture/";
				const detailDomain = detailBase + lectureID;

				request(detailDomain, function (error, response, body) {

					console.log(error);
					console.log('statusCode:', response && response.statusCode);
					console.log('body:', body);

					if(response.statusCode != 200){
						callback(true, null);
					}
					else{

						const details = JSON.parse(body);

						callback(false, details);

					}

				});
			} else {
				//no lecture found
				searchLectureDetails(query, (globalError, globalDetails) => {
					if(globalError){
						//no lecture found globally either
						callback(true, null);
					}
					else{
						callback(false, globalDetails);
					}
				});
			}
		} else {
			//no timetable found for this person
			//question: should we keep 'offline' search disabled to encourage logging in?
			callback(true, null);
		}
	});
}

// global search for lectures by name using the HdM API
function searchLectureDetails(query, callback) {

	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	query = query.toLowerCase();
	const searchBase = 'https://hdmapp.mi.hdm-stuttgart.de/search/anonymous/lectures?q=';
	const searchUrl = searchBase + query;
	console.log("Requesting " + searchUrl);
	let lectureID = 0;
	let lecturefound = true;

	request(searchUrl, function (error, response, body) {

		console.log(error);
		console.log('statusCode:', response && response.statusCode);
		console.log('body:', body);

		if(response.statusCode != 200){
			callback(true, {});
		}
		else{

			const searchresults = JSON.parse(body);
			if (searchresults.length === 0){
				lecturefound = false;
			}
			else{
				lecturefound = true;
				var results = searchresults.sort(function(a,b) {
					// sort results by levenshtein proximity to original query, as the API doesn't do this
					return new levenshtein(query, a.title).distance - new levenshtein(query, b.title).distance;
				});
				lectureID = results[0].id;
			}

			// fetch details with the found ID
			const detailBase = "https://hdmapp.mi.hdm-stuttgart.de/details/anonymous/lecture/";
			const detailDomain = detailBase + lectureID;

			if(lecturefound){
				request(detailDomain, function (error, response, body) {

					console.log(error);
					console.log('statusCode:', response && response.statusCode);
					console.log('body:', body);

					const details = JSON.parse(body);
					callback(false, details);
				});
			}
			else{
				//lecture not found globally
				callback(true, null);
			}
		}
	});
}

// fetch public event plan, get iCal files for each event and return an array with all event details
function getEvents(callback) {
	request('https://www.hdm-stuttgart.de/hochschule/aktuelles/terminkalender', function (error, response, html) {
		if (!error && response.statusCode == 200) {

			var $ = cheerio.load(html);
			let links = [];

			$('table a').each(function (i, elem) {
				let link = $(elem).attr('href');
				if (link && link.startsWith('/termine/')) {
					links.push(link);
				}
			});

			let events = [];
			let counter = 0;

			//TODO: Replace ugly counter implementation with async

			links.forEach((link) => {
				ical.fromURL('https://www.hdm-stuttgart.de' + link, {}, function (err, data) {

					if (err) {

						console.log('error parsing events: ' + err)
						callback(false);

					} else {

						let e = data[Object.keys(data)[0]];
						let event = {
							name: e.summary.val,
							start: new Date(e.start),
							end: new Date(e.end),
							location: e.location.val
						}
						events.push(event);
						counter++;
						if (counter == links.length) {
							events.sort((a, b) => {
								return a.start - b.start;
							})
							callback(events);
						}
					}
				});
			});
		} else {
			console.log('error parsing events: ' + error)
			callback(false);
		}
	});
}

// search event array for a specific event by name, return details
function searchEvents(query, callback){
	getEvents((events) => {
		let filtered = [];
        for (var i = 0; i < events.length; i++) {
            var testname = JSON.stringify(events[i].name).toLowerCase();
            if(testname.includes(query.toLowerCase())){
                filtered.push(events[i]);
            }
        }
        if (filtered.length > 0) {
            callback(false, filtered);
        } else {
            callback(true, null);
        }
	});
}

// call filmrausch API (thx to Mark) and return the next running movie and its details, if there is one
function getNextFilmrausch(callback) {
    const filmrauschDomain = "http://filmrausch.hdm-stuttgart.de/about/movies.json";
    request(filmrauschDomain, (error, response, body) => {
        let movies = JSON.parse(body);
        let today = new Date();
        let moviefound = false;
        for (var i = 0; i < movies.length; i++){
            var testdate = new Date(movies[i].date);
            if (+testdate <= +today){
                console.log(movies[i].name + " ist schon vorbei");
            }
            else{
                console.log(movies[i].name + " ist der nächste Film");
                moviefound = true;
                callback(false, movies[i]);
                break;
            }
        }
		if(!moviefound){
			callback(true, null);
		}
    });
}

// given date usually represents a week (e.g. first of next week), so return the firt movie running after this date
// date is created by wit.ai when prompted with requests like "what movie is running in three weeks?"
function getSpecificFilmrausch(date, callback) {
    const filmrauschDomain = "http://filmrausch.hdm-stuttgart.de/about/movies.json";
    request(filmrauschDomain, (error, response, body) => {
        let movies = JSON.parse(body);
        let givendate = new Date(date);
        let moviefound = false;
        for (var i = 0; i < movies.length; i++){
            var testdate = new Date(movies[i].date);
            if (+testdate <= +givendate){
                console.log(movies[i].name + " ist schon vorbei");
            }
            else{
                console.log(movies[i].name + " ist der nächste Film");
                moviefound = true;
                callback(false, movies[i]);
                break;
            }
        }
		if(!moviefound){
			callback(true, null);
		}
    });
}

// search HdM API for a room by name, return details if there is one
function getRoomDetails(roomnumber, callback) {

	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
	roomnumber.replace(" ", "");

	const searchBase = 'https://hdmapp.mi.hdm-stuttgart.de/search/anonymous/rooms?q=';
	const searchUrl = searchBase + roomnumber;
	let roomID = 0;


	request(searchUrl, function (error, response, body) {

		console.log(error);
		console.log('statusCode:', response && response.statusCode);
		console.log('body:', body);

		if(response.statusCode != 200){
			callback(null, null, null, null, null, true)
		}
		else{

		const searchresults = JSON.parse(body);
		if (typeof searchresults[0] === 'undefined') {
			console.log("Error: no room like this found!");
			error = true;
			callback(null, null, null, null, null, true)
		} else {
			console.log("Results found for query");
			roomID = searchresults[0].id;
			console.log('id:', JSON.stringify(roomID));
			const detailBase = "https://hdmapp.mi.hdm-stuttgart.de/details/anonymous/room/";
			const detailDomain = detailBase + roomID;

			request(detailDomain, function (error, response, body) {

				console.log(error);
				console.log('statusCode:', response && response.statusCode);
				console.log('body:', body);

				const details = JSON.parse(body);

				const level = details.level;
				const name = details.name;
				const type = details.type;
				const lat = details.lat;
				const long = details.long;
				callback(name, type, level, lat, long, false);

			});
		}
	}
	});

}

// fetch a users timetable. short and pass should NEVER be stored or logged!
function getTimeTable(short, pass, callback) {
	process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

	Date.prototype.yyyymmdd = function () {
		var mm = this.getMonth() + 1; // getMonth() is zero-based
		var dd = this.getDate();

		return [this.getFullYear(),
		(mm > 9 ? '' : '0') + mm,
		(dd > 9 ? '' : '0') + dd
		].join('');
	};

	var date = new Date();
	var formatdate = date.yyyymmdd();

	var searchUrl = "https://hdmapp.mi.hdm-stuttgart.de/schedule/week/" + formatdate;

	var options = {
		url: searchUrl,
		auth: {
			username: short,
			password: pass
		}
	};

	request(options, function (error, response, body) {
		if (error) {
			console.log(error);
		}

		console.log('statusCode:', response && response.statusCode);

		if(response.statusCode != 200){
			callback(true, {});
		}
		else{

			if (body == "Unauthorized") {
				console.log("Oops!");
				callback(true, {});
			} else {
				callback(false, body);
			}

		}

	});
}

// store a users timetable in the database, using his/her senderID as a unique key
function storeTimeTable(table, id) {

	var options = {
		method: 'PUT',
		url: "http://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@paula.mi.hdm-stuttgart.de/users/" + id,
		body: encodeURI('schedule=' + JSON.stringify(JSON.parse(table))),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	}

	request(options, function (error, response, body) {
		if (error) {
			console.log('Database Error: ' + error);
		} else {
			console.log(JSON.parse(body).message);
		}
	});

}

// store a users senderID in the database the first time he/she messages PAuLA, so that PSA messages also reach people who haven't synced their timetables
function storeUser(id) {

	var options = {
		method: 'PUT',
		url: "http://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@paula.mi.hdm-stuttgart.de/users/" + id,
	}

	request(options, function (error, response, body) {
		if (error) {
			console.log('Database Error: ' + error);
		} else {
			console.log(JSON.parse(body).message);
		}
	});

}

// fetch user's timetable from our database
function fetchTimeTable(id, callback) {

	var options = {
		method: 'GET',
		url: "http://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@paula.mi.hdm-stuttgart.de/users/" + id
	}

	request(options, function (error, response, body) {
		if (error) {
			console.log('Error fetching timetable: ' + error);
			//callback(error, table);
			callback(true, null);
		} else {
			if (JSON.parse(body).message == null || JSON.parse(body).message.schedule == null) {
				console.log("No timetable synchronized for this user");
				callback(true, null);
			} else {
				callback(false, JSON.parse(body).message.schedule);
			}
		}
	});

}

// fetch a timetable, return an array with the length of 7 with only matching entries for each day of the week (to easily retain day of the week info)
// useful for queries like "where is web development on thursday?"
function getFilteredTimetable(id, query, callback) {
	fetchTimeTable(id, (error, days) => {
		if (!error) {
			days = JSON.parse(days);
			var filteredschedule = [
				[],
				[],
				[],
				[],
				[],
				[],
				[]
			];
			//fist off, iterate through every day
			for (var i = 0; i < 7; i++) {
				let todaysschedule = days[i].schedule;
				//console.log(todaysschedule);
				if (typeof todaysschedule !== 'undefined') {
					//then, iterate through the schedule of that day
					for (var j = 0; j < todaysschedule.length; j++) {
						let checkedlesson = todaysschedule[j].name.toLowerCase();
						//console.log(checkedlesson);
						if (checkedlesson.includes(query.toLowerCase())) {
							filteredschedule[i].push(todaysschedule[j]);
						};
					}
				}
			}
			if (filteredschedule.length > 0) {
				callback(false, filteredschedule);
			} else {
				callback(true, null);
			}
		} else {
			callback(true, null);
		}
	});
}

// use weatherunderground API to get the weather forecast for HdM for a specific day of the week
function getWeather(dow, callback){
    const weatherapi = "http://api.wunderground.com/api/" + process.env.WEATHER_TOKEN + "/forecast10day/lang:DL/q/germany/stuttgart.json";
    request(weatherapi, (error, response, body) => {
        let fullresult = JSON.parse(body);
        //TODO: Let's be real, we will never need to check if the API limit is reached. But who knows.
        let days = fullresult.forecast.txt_forecast.forecastday;
        //dow to name, to match later
        var dayquery = dowtoName(dow);
        //Add " Nacht" later in the day to give accurate results.
        //TODO: This should only be done if we're asking about today!
        var h = new Date().getHours();
        var currentdow = getCurrentDOW();
        console.log("Today is DOW " + currentdow);
        console.log("It's hour " + h);
        if(h > 15 && dow == currentdow){
            console.log("Searching for night forecast!");
            dayquery = dayquery + " Nacht";
        }
        var forecastfound = false;
        //find the right day by iterating through the results, one has to be right
        for(var i = 0; i < days.length; i++){
            if(days[i].title == dayquery){
                //we found it!
                forecastfound = true;
                callback(days[i]);
                break;
            }
        }
        if(!forecastfound){
            //logically, this should never occur!
            console.log("For some reason, no day was found!");
            callback(null);
        }
    });
}

// DOW = day of the week.
// i think it's incredibly stupid for getDay to return 0 on sundays, so take this, javascript!
function getCurrentDOW() {
	let day = new Date().getDay();
	if (day == 0) {
		day = 6;
	} else {
		day--;
	}
	return day;
}

// self-explanatory
function dowtoName(dow) {
	switch (dow) {
		case 0:
			return "Montag";
			break;
		case 1:
			return "Dienstag";
			break;
		case 2:
			return "Mittwoch";
			break;
		case 3:
			return "Donnerstag";
			break;
		case 4:
			return "Freitag";
			break;
		case 5:
			return "Samstag";
			break;
		case 6:
			return "Sonntag";
			break;
	}
}


module.exports = {

	getProfRoom: getProfRoom,
	getEvents: getEvents,
	getRoomDetails: getRoomDetails,
	getTimeTable: getTimeTable,
	storeTimeTable: storeTimeTable,
	fetchTimeTable: fetchTimeTable,
	getSBar: getSBar,
	getMensa: getMensa,
	getDepartures: getDepartures,
	getSpecificDepartures: getSpecificDepartures,
	getFilteredTimetable: getFilteredTimetable,
	getLectureDetails: getLectureDetails,
	getAllUsers: getAllUsers,
	storeUser: storeUser,
	searchEvents: searchEvents,
	searchLectureDetails: searchLectureDetails,
	getNextFilmrausch: getNextFilmrausch,
	getSpecificFilmrausch: getSpecificFilmrausch,
	getWeather: getWeather

}
