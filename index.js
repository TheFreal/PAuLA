// THIS IS THE MAIN MODULE

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const url = require('url');
const Api = require('./api.js');
const Bot = require('./bot.js');
const Process = require('./process.js');
const phrases = require('./phrases');
const favicon = require('serve-favicon');


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: true
}));

// Process application/json
app.use(bodyParser.json());

// statically host login page
app.use('/login', express.static(__dirname + '/website'));

app.use(favicon(__dirname + '/website/favicon.ico'));

// Index route
app.get('/', function (req, res) {
	res.send('Hi there, I am PAuLA!')
})

// open PAuLA API, still WiP but promising
app.get('/api', function (req, res) {
	var queryObject = url.parse(req.url, true).query;
	if(typeof queryObject.msg !== 'undefined'){
		var msg = queryObject.msg;
	}
	else{
		res.sendStatus(400);
		return;
	}
	var id = "";
	if(typeof queryObject.id !== 'undefined'){
		id = queryObject.id;
	}
	var formattedMsg = msg.toLowerCase().trim(); //to make everything from here on out case insensitive
	formattedMsg = ' ' + formattedMsg + ' '; //to recognize words more easily
	formattedMsg = replaceAll(formattedMsg, "feierabend", "schluss"); //solving a bug where wit would misinterpret "feierabend" as a time unit instead of an intent
	Bot.understand(formattedMsg)
		.then((understood) => {
			console.log('Understood: ' + JSON.stringify(understood));
			Process.createMessage(understood, id, (message, followup) => {
				res.send(message);
			})
		})
		.catch((err) => {
			console.log('oops that didn\'t work: ' + err)
		});
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'))
})

//WEBHOOK ACTIONS BELOW

// All callbacks for Messenger will be POST-ed here
app.post('/webhook', function (req, res) {
	// Make sure this is a page subscription
	if (req.body.object == 'page') {
		// Iterate over each entry
		// There may be multiple entries if batched
		req.body.entry.forEach(function (entry) {
			// Iterate over each messaging event
			entry.messaging.forEach(function (event) {
				if (event.postback) {
					processPostback(event);
				} else if (event.message) {
					processMessage(event);
				}
			});
		});

		res.sendStatus(200);
	}
});

// for mail links, just send users to https://paulaandyou.herokuapp.com/mailtool?mail=...
// screw you, facebook, for not being able to handle these links yourself :P
app.get('/mailtool', function (req, res) {
	var queryObject = url.parse(req.url, true).query;
	var mail = queryObject.mail;
	console.log(mail);
	res.writeHead(302, {
		'Location': 'mailto:' + mail + '?body=Gefunden%20mit%20PAuLA' // adding a nice little signature because we can
	});
	res.end();
});

//ONLY for important PSAs!
app.get('/messageall', function (req, res) {
	var queryObject = url.parse(req.url, true).query;
	var token = queryObject.token;
	var msg = queryObject.msg;
	var followup = queryObject.followup;
	var followBool = (followup == 'true');
	if (token == process.env.ADMIN_TOKEN) {
		//correct token
		Api.getAllUsers((ids) => {
			let reply = "Messages sent";
			if (followBool) {
				reply = reply + " with followup";
			}
			for (var i = 0; i < ids.length; i++) {
				let testId = parseInt(ids[i]);
				console.log(testId);
				sendMessage(testId, {
					text: msg
				}, followBool);
			}
			res.send(reply);
		})
	}
	else {
		res.send("Incorrect or missing token!");
	}
});

// called from the login page, checks shorts and passwords, stores timetables if both match
app.post("/authservice", function (req, res) {
	var body = req.body;
	var id = body.id;
	var short = body.short;
	var pass = body.pass;
	console.log("Short: " + short);
	//console.log("Pass: " + pass);
	Api.getTimeTable(short, pass, function (error, timetable) {

		console.log('getTimeTable was called');
		console.log('error: ' + error);

		if (error) {
			console.log("INCORRECT PASSWORD!");
			res.sendStatus(401);
		} else {

			try {
				JSON.parse(timetable);

				Api.storeTimeTable(timetable, id);
				res.contentType('json');
				res.send({ error: false });
				let confirmation = "Alles klar, hab den Stundenplan mit dem Kürzel " + short +
					" mit deinem Profil verknüpft! Ab jetzt kannst du mich z.B. fragen, wann du morgen die erste Vorlesung hast!";
				sendMessage(id, {
					text: confirmation
				});

			} catch (e) {
				console.log("INCORRECT PASSWORD!");
				res.sendStatus(401);
			}


		}
	});
});

// handles postbacks with payload
function processPostback(event) {

	var senderId = event.sender.id;
	var payload = event.postback.payload;

	switch (payload) {
		case 'Greeting':
			console.log('Greeting coming in');
			// Get user's first name from the User Profile API
			// and include it in the greeting
			Api.storeUser(senderId);
			request({
				url: 'https://graph.facebook.com/v2.6/' + senderId,
				qs: {
					access_token: process.env.PAGE_ACCESS_TOKEN,
					fields: 'first_name'
				},
				method: 'GET'
			}, function (error, response, body) {
				var greeting = '';
				if (error) {
					console.log('Error getting user\'s name: ' + error);
					var name = "";
				} else {
					var bodyObj = JSON.parse(body);
					var name = bodyObj.first_name;
				}
				var greeting = 'Hey ' + name + '! ';
				var msgNr = 1;
				// loops through messages by sendGreeting to stage a nice little welcome procedure in the correct order and timing
				(function myLoop(i) {
					setTimeout(function () {
						sendGreeting(msgNr, name, senderId);
						msgNr++;
						console.log("message number is " + msgNr); //  your code here
						if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
					}, 2000)
				})(5); //  pass the number of iterations as an argument
			});
			break;
	}

}

// serves all stages of the greeting procedure to processPostback
function sendGreeting(msgNr, name, senderId) {
	var reply;
	if (msgNr == 1) {
		reply = "Hey " + name + "! :D";
		sendMessage(senderId, {
			text: reply
		});
	} else if (msgNr == 2) {
		reply = "Ich bin dein neuer Persönlicher Ansprechpartner und Lernassistent, aber du kannst mich einfach PAuLA nennen!";
		sendMessage(senderId, {
			text: reply
		});
	} else if (msgNr == 3) {
		reply = "Ich kann dir Infos rund um die HdM und deinen Hochschulalltag geben. Professoren, Räume, Essenspläne, Vorlesungen - finde ich alles!";
		sendMessage(senderId, {
			text: reply
		});
	} else if (msgNr == 4) {
		reply = "Damit ich dir Auskünfte zu deinem Stundenplan geben kann, müsste ich da einmal kurz reingucken. Keine Sorge, ich merke mir dein Passwort nicht. " +
			"Drück zum Anmelden einfach hier:";
		const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
		sendMessage(senderId, {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "button",
					"text": reply,
					"buttons": [{
						"type": "web_url",
						"url": logindomain,
						"title": "Zum Login"
					}]
				}
			}
		});
	} else if (msgNr == 5) {
		Process.sendSuggestions("Ansonsten kannst du auch direkt mit diesen Fragen loslegen!", (m) => sendMessage(senderId, m));
	}
}

// messages enter here
function processMessage(event) {
	if (!event.message.is_echo) {
		var message = event.message;
		var senderId = event.sender.id;

		showTyping(senderId);

		console.log('Received message from senderId: ' + senderId);
		console.log('Message is: ' + JSON.stringify(message));

		// You may get a text or attachment but not both
		if (message.text) { // phew, we can handle this!

			var formattedMsg = message.text.toLowerCase().trim(); //to make everything from here on out case insensitive
			formattedMsg = ' ' + formattedMsg + ' '; // to recognize words more easily
			formattedMsg = replaceAll(formattedMsg, "feierabend", "schluss"); // solving a bug where wit would misinterpret "feierabend" as a time unit instead of an intent

			if (formattedMsg.includes("kommunismus")) { // intially only used this to test recognition of single words, bypassing NLU. Keeping it in for lulz and for Mark :D
				sendMessage(senderId, {
					text: "☭ yay! ☭"
				});
			} else if (formattedMsg.includes(":(")) { // another example
				sendMessage(senderId, {
					text: "Sei nicht traurig :)"
				});
			// usually, quick replies come with a payload for easier recognition.
			// Sometimes, users try to write out those quickreplies instead, this is used to ensure we still recognize them in that case
			} else if (formattedMsg == " raumsuche " || formattedMsg == " raum suche ") {
				showMenu("SUGGEST_ROOM", senderId, formattedMsg);
			} else if (formattedMsg == " profsuche " || formattedMsg == " prof suche ") {
				showMenu("SUGGEST_PROF", senderId, formattedMsg);
			} else if (formattedMsg == " stundenplan ") {
				showMenu("SUGGEST_TIMETABLE", senderId, formattedMsg);
			} else if (formattedMsg == " fahrplan ") {
				showMenu("SUGGEST_TRAIN", senderId, formattedMsg);
			} else if (formattedMsg == " fun ") {
				showMenu("SUGGEST_FUN", senderId, formattedMsg);
			} else if (formattedMsg == " vorlesungsinfos ") {
				showMenu("SUGGEST_LECTURES", senderId, formattedMsg);
			} else if (formattedMsg == " eventsuche ") {
				showMenu("SUGGEST_EVENT", senderId, formattedMsg);
			} else if (formattedMsg == " zurück ") {
				showMenu("SUGGEST", senderId, formattedMsg);
			} else if (typeof message.quick_reply !== 'undefined') { // this is a quick reply, therefore there is a payload we can handle
				var payload = message.quick_reply.payload;
				showMenu(payload, senderId, formattedMsg);
			} else { // this is the raw core which handles 99% of all messages.
				// send message body to AI, receive it parsed as a JSON object
				Bot.understand(formattedMsg)
					.then((understood) => {
						console.log('Understood: ' + JSON.stringify(understood));
						Process.createMessage(understood, senderId, (message, followup) => { // send that object with its intent and entities to Process module, receive a finished message object
							sendMessage(senderId, message, followup); // send that message, either with or without "what's next" followup message
						})

					})
					.catch((err) => {
						console.log('oops that didn\'t work: ' + err)
					});
			}

		} else if (message.attachments) { // there is an attachment, we can't handle those. smartass your way out of this one.
			var message = randomMessage(phrases.attachmentMessages);
			sendMessage(senderId, {
				text: message
			});
			// I think it would be really cool to use the Google vision API in future builds. "Cool, that's a nice landscape!" or "Wow, check out that building!" would be THE best way to reply.
		}
	}
}

// this used to check if the message included curse words. This work is now done by the AI instead to catch more broad insults and to differentuate bettween rudeness and insults.
function profanityFilter(text, source) {
	var badwords = phrases.badwords;
	var clear = true;
	for (var i = 0; i < badwords.length; i++) {
		if (text.includes(badwords[i])) {
			clear = true; //set to false to reactivate
		}
	}
	if (!clear) {
		//Answer right away
		var message = randomMessage(phrases.badanswers);
		sendMessage(source, {
			text: message
		});
	}
	return true;
	//return clear to re-activate this filter at any point
}

// show quick reply main menu
function showMenu(payload, senderId, formattedMsg) {
	switch (payload) {
		case "SUGGEST_ROOM":
			sendMessage(senderId, {
				"text": "Klar, ich helfe dir gerne dich an der HdM zurecht zu finden! Frag mich zum Beispiel einfach 'Wo ist Raum 011', oder 'Wo ist das Audimax'!",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wo ist i003?",
					"payload": "raumsample1"
				},
				{
					"content_type": "text",
					"title": "Wo ist Raum 135?",
					"payload": "raumsample2"
				},
				{
					"content_type": "text",
					"title": "Wo ist das Audimax?",
					"payload": "raumsample3"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_TRAIN":
			sendMessage(senderId, {
				"text": "Ich kann dir gerne die nächsten Abfahrten an der Haltestelle 'Universität' sagen! 😊 Frag mich einfach 'Wann kommt die nächste Bahn?' oder 'Wann kommt die nächste S2?'",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wann kommt die Bahn?",
					"payload": "bahnsample1"
				},
				{
					"content_type": "text",
					"title": "Wann kommt die S1?",
					"payload": "bahnsample2"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_MENSA":
			sendMessage(senderId, {
				"text": "Gerne sag ich dir die kommenden Essenspläne - aus dem Eat'n'Talk oder der Mensa! 🍽 Frag mich zum Beispiel einfach 'Was gibt es morgen in der Mensa' oder 'Was gibt es am Freitag in der sbar?'!",
				"quick_replies": [{
					"content_type": "text",
					"title": "Was gibts zu essen?",
					"payload": "essensample1"
				},
				{
					"content_type": "text",
					"title": "Heute in der Mensa",
					"payload": "essensample2"
				},
				{
					"content_type": "text",
					"title": "Heute im Eat'n'Talk",
					"payload": "essensample2"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_TIMETABLE":
			Api.fetchTimeTable(senderId, (error, schedule) => {
				//TODO: We should probably generate some of these lectures dynamically without hittling the length limit
				if (error) { // not logged in
					sendMessage(senderId, {
						"text": "Ich helfe dir gerne mit deinem Stundenplan, dazu musst du mich allerdings einmal kurz drüber schauen lassen. Schreib einfach 'Login' um deinen Stundenplan hinzuzufügen oder zu aktualisieren!",
						"quick_replies": [{
							"content_type": "text",
							"title": "Login",
							"payload": "loginsample1"
						},
						{
							"content_type": "text",
							"title": "Zurück",
							"payload": "SUGGEST"
						}
						]
					});
				} else { // logged in
					sendMessage(senderId, {
						"text": "Ich helfe dir gerne mit deinem Stundenplan! Frag mich zum Beispiel 'Was hab ich heute', 'Wann hab ich Mathe', 'Was hab ich am Dienstag' oder 'Was hab ich morgen als erstes'. Oder, wenn der Tag sich mal wieder zieht, 'Wann hab ich Feierabend' 😅",
						"quick_replies": [{
							"content_type": "text",
							"title": "Was hab ich heute?",
							"payload": "schedulesample1"
						},
						{
							"content_type": "text",
							"title": "Was hab ich morgen?",
							"payload": "schedulesample2"
						},
						{
							"content_type": "text",
							"title": "Wann hab ich Schluss",
							"payload": "schedulesample3"
						},
						{
							"content_type": "text",
							"title": "Aktualisieren",
							"payload": "schedulesample4"
						},
						{
							"content_type": "text",
							"title": "Zurück",
							"payload": "SUGGEST"
						}
						]
					});
				}
			});
			break;
		case "SUGGEST_PROF":
			sendMessage(senderId, {
				"text": "Ich kenne alle Professor*innen - persönlich! Frag mich einfach 'Wo finde ich Professor Gerlicher', 'Wer ist Tobias Jordine' oder 'Wie erreiche ich Prof. Charzinski'!",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wo ist Herr Hahn?",
					"payload": "profsample1"
				},
				{
					"content_type": "text",
					"title": "Wer ist Dr. Schmitz",
					"payload": "profsample2"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_LECTURES":
			sendMessage(senderId, {
				"text": "So viele Vorlesungen, so wenig Überblick! Aber dafür bin ich ja da, ich kenne nämlich ALLE. Zum Beispiel kannst du mich fragen 'Wer unterrichtet Web Development', 'Wie viele ECTS gibt Compositing' oder 'Wo ist Analysis'",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wer gibt Analysis?",
					"payload": "lecturesample1"
				},
				{
					"content_type": "text",
					"title": "Wo ist IT-Recht?",
					"payload": "lecturesample2"
				},
				{
					"content_type": "text",
					"title": "ECTS von E-Business",
					"payload": "lecturesample3"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_OPENING":
			sendMessage(senderId, {
				"text": "Wenns mal wieder länger dauert sag ich dir auch die Öffnungszeiten! Keine Sorge, ich habe 24/7 geöffnet! ;)",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wann ist die HdM zu?",
					"payload": "openingsample1"
				},
				{
					"content_type": "text",
					"title": "Wann öffnet die Bib?",
					"payload": "openingsample2"
				},
				{
					"content_type": "text",
					"title": "Öffnungszeiten Mensa",
					"payload": "openingsample3"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_FUN":
			sendMessage(senderId, {
				"text": "Ein klein bisschen Plaudern kann ich auch!",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wer bist du?",
					"payload": "funsample1"
				},
				{
					"content_type": "text",
					"title": "Gut gemacht!",
					"payload": "funsample2"
				},
				{
					"content_type": "text",
					"title": "Wie gehts?",
					"payload": "funsample3"
				},
				{
					"content_type": "text",
					"title": "Funfact bitte!",
					"payload": "funsample4"
				},
				{
					"content_type": "text",
					"title": "Hast du Eltern?",
					"payload": "funsample5"
				},
				{
					"content_type": "text",
					"title": "Blöde Kuh!",
					"payload": "funsample6"
				},
				{
					"content_type": "text",
					"title": "Test Test 123",
					"payload": "funsample7"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_EVENT":
			sendMessage(senderId, {
				"text": "Ein paar Events und Termine kenn ich auch!",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wann ist Filmrausch?",
					"payload": "eventsample1"
				},
				{
					"content_type": "text",
					"title": "Wann ist MediaNight?",
					"payload": "eventsample2"
				},
				{
					"content_type": "text",
					"title": "Wann ist conmedia?",
					"payload": "eventsample3"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_WEATHER":
			sendMessage(senderId, {
				"text": "Wie wird das Wetter an der HdM? Ich weiß es!",
				"quick_replies": [{
					"content_type": "text",
					"title": "Wie wird das Wetter?",
					"payload": "weathersample1"
				},
				{
					"content_type": "text",
					"title": "Wetter am Sonntag",
					"payload": "weathersample2"
				},
				{
					"content_type": "text",
					"title": "Zurück",
					"payload": "SUGGEST"
				}
				]
			});
			break;
		case "SUGGEST_SHUTUP":
			sendMessage(senderId, {
				"text": "Alles klar, meld dich einfach wenn du eine Frage hast 😅"
			});
			break;
		case "SUGGEST":
			Process.sendSuggestions("", (m) => sendMessage(senderId, m));
			break;
		default:
			Bot.understand(formattedMsg)
				.then((understood) => {
					console.log('Understood: ' + JSON.stringify(understood));
					Process.createMessage(understood, senderId, (message, followup) => {
						sendMessage(senderId, message, followup);
					})

				})
				.catch((err) => {
					console.log('oops that didn\'t work: ' + err)
				});
			break;
	}
}

// sends message to user, wither with or without followup
function sendMessage(recipientId, message, followup) {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: process.env.PAGE_ACCESS_TOKEN
		},
		method: 'POST',
		json: {
			recipient: {
				id: recipientId
			},
			message: message,
		}
	}, function (error, response, body) {
		if (error) {
			console.log('Error sending message: ' + response.error);
		}
	});
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: process.env.PAGE_ACCESS_TOKEN
		},
		method: 'POST',
		json: {
			recipient: {
				id: recipientId
			},
			"sender_action": "typing_off"
		}
	}, function (error, response, body) {
		if (error) {
			console.log('Error hiding typing: ' + response.error);
		}
	});
	if (typeof followup !== 'undefined') {
		if (followup) {
			setTimeout(function () {
				Process.sendFollowup((m) => {
					sendMessage(recipientId, m, false)
				});
			}, 1500);
		}
	} else {
		console.log("Followup is undefined"); // some of our older code might now include the followup boolean, just don't send one in this case
	}
}

// making it more natural
function showTyping(recipientId) {
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: process.env.PAGE_ACCESS_TOKEN
		},
		method: 'POST',
		json: {
			recipient: {
				id: recipientId
			},
			"sender_action": "typing_on"
		}
	}, function (error, response, body) {
		if (error) {
			console.log('Error showing typing: ' + response.error);
		}
	});
}

// helper function
function randomMessage(messageArray) {
	return messageArray[Math.floor(Math.random() * (messageArray.length))];
}

// another useful helper function, thank you stackoverflow for this one!
function replaceAll(str, find, replace) {
	return str.replace(new RegExp(find, 'g'), replace);
}
