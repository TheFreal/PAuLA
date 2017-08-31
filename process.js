// THIS MODULE IS THE "SMARTS" OF PAULA. IT RECEIVES WIT'S JSON OBJECTS, FORMUALTES REPLIES WITH SOME API CALLS AND BUILD THEM INTO FACEBOOK MESSAGE OBJECTS

const Api = require('./api.js');
const phrases = require('./phrases');
const request = require('request');
const moment = require('moment-timezone');

function createMessage(understood, id, callback) {

    console.log('Message creation starting...');
    const intent = understood.entities.intent ? understood.entities.intent[0].value : '';

    // calls the related message.building function for each intent, if there is one. This is where you have to add new intents
    switch (intent) {

        case 'eventplan':
            events(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'profsuche':
            profsuche(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'raumsuche':
            raumsuche(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'stundenplan':
            stundenplan(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'feierabend':
            feierabend(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'tagesbeginn':
            tagesbeginn(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'nextlecture':
            nextlecture(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'nextlecture-room':
            nextlectureroom(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'lecture-place':
            lecturePlace(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'lecture-prof':
            lectureProf(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'lecture-ects':
            lectureECTS(understood, id, (m) => {
                callback(m, true)
            });
            break;

        case 'essensplan':
            essensplan(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'öffnungszeiten':
            openingtimes(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'efa':
            efa(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'wetter':
            weather(understood, (m) => {
                callback(m, true);
            });
            break;

        case 'test':
            randomize("test", (m) => {
                callback(m, true)
            });
            break;

        case 'laune':
            randomize("laune", (m) => {
                callback(m, true)
            });
            break;

        case 'noten':
            noten((m) => {
                callback(m, true)
            });
            break;

        case 'spo':
            spo((m) => {
                callback(m, true)
            });
            break;

        case 'funfact':
            randomize("funfact", (m) => {
                callback(m, true)
            });
            break;

        case 'whoami':
            whoami(id, (m) => {
                callback(m, true)
            });
            break;

        case 'gruss':
            greet((m) => {
                callback(m)
            });
            break;

        case 'nsfw':
            randomize("badanswers", (m) => {
                callback(m, true)
            });
            break;

        case 'showoff':
            sendSuggestions("", (m) => {
                callback(m)
            });
            break;

        case 'appreciate':
            randomize("appreciate", (m) => {
                callback(m, true)
            });
            break;

        case 'insult':
            randomize("beleidigt", (m) => {
                callback(m, true)
            });
            break;

        case 'introduce':
            randomize("introduce", (m) => {
                callback(m, true)
            });
            break;

        case 'age':
            age((m) => {
                callback(m, true)
            });
            break;

        case 'hdm-age':
            hdm_age((m) => {
                callback(m, true)
            });
            break;

        case 'hdm-size':
            size((m) => {
                callback(m, true)
            });
            break;

        case 'anzahl-studiengänge':
            courses((m) => {
                callback(m, true)
            });
            break;

        case 'eröffnung':
            opening(understood, (m) => {
                callback(m, true)
            });
            break;

        case 'rektoren':
            rektoren((m) => {
                callback(m, true)
            });
            break;

        case 'login':
            generateLogin(id, (m) => {
                callback(m, true)
            });
            break;

        case 'credits':
            randomize("credits", (m) => {
                callback(m, true)
            });
            break;

        case 'sorry':
            randomize("apologies", (m) => {
                callback(m, true)
            });
            break;

        case 'loveyou':
            randomize("loveyou", (m) => {
                callback(m, true)
            });
            break;

        case 'sinndeslebens':
            randomize("sinndeslebens", (m) => {
                callback(m, true)
            });
            break;

        case 'sass':
            randomize("sass", (m) => {
                callback(m, true)
            });
            break;

        case 'bye':
            callback({
                text: "Alles klar, sag einfach Bescheid wenn ich irgendwie helfen kann ^^"
            }, false);
            break;

        default:
            console.log('no intent found, sorry');
            randomize("confusion", (m) => {
                callback(m, true)
            });
            break;

    }


}

// no smarts required, pick a random phrase from phrases.json
function randomize(phrase, callback) {
    let message = randomMessage(phrases[phrase]);
    callback({
        text: message
    });
}

// greeting the user, give him quick replies right away
function greet(callback) {
    let message = randomMessage(phrases.greetings);
    sendSuggestions(message, (m) => callback(m));
}

// once the grading system is migrated to the new server and up again
function noten(callback) {
    let reply = "Die Funktion ist fest in Planung, leider bekomm ich aktuell keinen Zugriff auf die Notenserver :/";
    callback({
        text: reply
    });
}

function spo(callback) {
    let reply = "Die SPO findest du mit vielen anderen Dokumenten hier:";
    const spodomain = "https://www.hdm-stuttgart.de/studenten/spo_pruefungsinfos/spo";
    callback({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": reply,
                "buttons": [{
                    "type": "web_url",
                    "url": spodomain,
                    "title": "Studien- und Prüfungsordnungen / SPO"
                }]
            }
        }
    });
}

// hardcoded opening times, if you have a better idea let me know
function openingtimes(understood, callback) {
    var query = "null";
    if (typeof understood.entities.place !== 'undefined') {
        query = understood.entities.place[0].value;
    }
    query = query.toLowerCase();
    switch (query) {
        case "lernwelt":
            reply = "Du willst die Öffnungzeiten der Lernwelt wissen, und ich arbeite daran sie schon bald zu kennen!";
            break;
        case "bibliothek":
            reply = "Wochentags hat die Bücherei von 9 bis 20.30 Uhr geöffnet. Samstags 10-16 Uhr. Sonn- und Feiertags hat sie ganztägig geschlossen.";
            break;
        case "eatntalk":
            reply = "Die muss ich leider erst noch rausfinden :/";
            break;
        case "mensa":
            reply = "Die Mensa ist Montag bis Freitag von 11.15 bis 14.15 Uhr offen, auch in der vorlesungsfreien Zeit.";
            break;
        case "hdm":
            reply = "Wochentags ist die HdM von 6-21 Uhr für alle und von 21 Uhr bis Mitternacht nur für Studenten. " +
                "Samstags ist die HdM von 8 bis 16 Uhr geöffnet und dann bis Mitternacht nur für Studenten. " +
                "Sonn- und Feiertags ist die HdM von 8 Uhr bis Mitternacht für Stundenten zugänglich.";
            break;
        case "null":
            reply = "Den Ort konnte ich gar nicht finden :/";
            break;
        default:
            reply = "Zu dem Ort habe ich leider keine Öffnungzeiten gefunden :/";
    }
    callback({
        text: reply
    });
}

// if we know the event, hardcoded replies. If now, consult the API.
function events(understood, callback) {
    var reply = "";
    var daysuntil = 0;
    var query = "null";
    if (typeof understood.entities.event !== 'undefined') {
        query = understood.entities.event[0].value;
    }
    query = query.toLowerCase();
    switch (query) {

        case "brett vorm kopf":
            reply = "Der Brettspielabend 'Brett vorm Kopf' ist jeden Donnerstag um 19.30 in Raum 016b, also ";
            daysuntil = daysUntilDow(3);
            if (daysuntil == 0) {
                reply = reply + "heute!";
            } else if (daysuntil == 1) {
                reply = reply + "morgen!";
            } else {
                reply = reply + "in " + daysuntil + " Tagen!";
            }
            callback({
                text: reply
            });
            break;

        case "filmrausch":
            reply = "Das Studentenkino 'Filmrausch' ist jeden Mittwoch um 19.30 im Treppenstudio.";
            if (typeof understood.entities.datetime !== 'undefined') {
                console.log("Datum gegeben");
                let date = understood.entities.datetime[0].value;
                Api.getSpecificFilmrausch(date, (error, movie) => {
                    console.log("API Antwort bekommen!");
                    if (!error) {
                        reply = reply + " Am " + movie.date + " läuft " + movie.name + " (" + movie.year + ")! " + movie.intro;
                    }
                    else {
                        reply = "Filmrausch ist jeden Mittwoch um 19.30 Uhr. Leider ist zu diesem Zeitpunkt in nächster Zeit keine Vorstellung mehr :/";
                    }
                    callback({
                        text: reply
                    });
                });
            }
            else {
                console.log("Kein Datum gegeben");
                Api.getNextFilmrausch((error, movie) => {
                    console.log("API Antwort bekommen!");
                    if (!error) {
                        reply = reply + " Am " + movie.date + " läuft " + movie.name + " (" + movie.year + ")! " + movie.intro;
                    }
                    else {
                        reply = "Filmrausch ist jeden Mittwoch um 19.30 Uhr. Leider ist die nächsten Wochen vorerst keine Vorstellung mehr :/";
                    }
                    callback({
                        text: reply
                    });
                });
            }
            break;

        case "unterbelichtet":
            reply = "Die Fotoinitiative 'Unterbelichtet' ist jeden Dienstag um 19.30 am Grünen Ei, also ";
            daysuntil = daysUntilDow(1);
            if (daysuntil == 0) {
                reply = reply + "heute!";
            } else if (daysuntil == 1) {
                reply = reply + "morgen!";
            } else {
                reply = reply + "in " + daysuntil + " Tagen!";
            }
            callback({
                text: reply
            });
            break;

        case "vorlesungsfrei":
            reply = "Die Vorlesungsfreie Zeit geht vom 30. Juni bis zum 9. Oktober 2017!";
            callback({
                text: reply
            });
            break;

        case "impro theater":
            reply = "Kanonenfutter kündigen ihre nächsten Auftritte immer auf ihrer Facebook-Seite an, schau da mal vorbei!";
            const facebookdomain = "https://www.facebook.com/kanonenfutter/";
            callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": reply,
                        "buttons": [{
                            "type": "web_url",
                            "url": facebookdomain,
                            "title": "Kanonenfutter auf Facebook"
                        }]
                    }
                }
            });
            break;

        default:
            Api.searchEvents(query, (error, events) => {
                if (error) {
                    reply = randomMessage(phrases.noevent);
                }
                else {
                    let start = new Date(events[0].start);
                    let end = new Date(events[0].end);
                    let name = events[0].name;
                    reply = name + " ist am " + start.getDate() + ". " + monthToName(start.getMonth()) + " " + start.getFullYear();
                }
                callback({
                    text: reply
                });
            });
            break;

    }
}

function whoami(senderId, callback) {
    request({
        url: 'https://graph.facebook.com/v2.6/' + senderId,
        qs: {
            access_token: process.env.PAGE_ACCESS_TOKEN,
            fields: 'first_name'
        },
        method: 'GET'
    }, function (error, response, body) {
        var name = "mein Meister";
        if (!error) {
            var bodyObj = JSON.parse(body);
            name = bodyObj.first_name;
        }
        let reply = "Du bist natürlich " + name + "! :D";
        callback({
            text: reply
        });
    });
}

// TODO: "days since" returns incorrect amount
function age(callback) {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var medianightDate = new Date(2017, 06, 29);
    var currentDate = new Date();
    var diffDays = Math.round(Math.abs((currentDate.getTime() - medianightDate.getTime()) / (oneDay))); // this SHOULD be the age in days
    let message = "Ich wurde auf der MediaNight im Sommer 2017 vorgestellt!";
    callback({
        text: message
    });
}

// info intents, thx to Annika
function hdm_age(callback) {
    let message = phrases.infos[1];
    callback({
        text: message
    });
}

function size(callback) {
    let message = phrases.infos[2];
    callback({
        text: message
    });
}

function courses(callback) {
    let message = phrases.infos[3];
    callback({
        text: message
    });
}

function initiativen(callback) {
    let message = phrases.infos[4];
    callback({
        text: message
    });
}

function rektoren(callback) {
    let message = phrases.infos[5];
    callback({
        text: message
    });
}

// efa = Elektronische Fahrplan Auskunft
// first consult the API, then use formatEfa to build a nice message
function efa(understood, callback) {
    if (typeof understood.entities.train === 'undefined') {
        formatEfa(null, (m) => {
            callback(m)
        });
    } else {
        let name = understood.entities.train[0].value;
        formatEfa(name, (m) => {
            callback(m)
        });
    }
}

function formatEfa(name, callback) {
    if (name === null) {
        //general s-bahn departures
        Api.getDepartures((error, departures) => {
            let reply = "Die nächsten Abfahrten an 'Universität' sind: \n \n";
            if (error) {
                reply = "Sorry, der Fahrplan scheint gerade down zu sein. Ich schiebs auf die Deutsche Bahn." // happens way too often
            }
            else {
                for (var i = 0; i < 6; i++) {
                    let minute = departures[i].departureTime.minute;
                    if (minute.length == 1) {
                        minute = "0" + minute;
                    }
                    let delayMsg = "";
                    let delaytime = departures[i].delay;
                    if (delaytime !== "0") {
                        delayMsg = "(" + delaytime + " min verspätet)";
                    }
                    reply = reply + departures[i].number + " nach " + departures[i].direction +
                        " um " + departures[i].departureTime.hour + ":" + minute + " Uhr " + delayMsg + "\n";
                }
            }
            callback({
                text: reply
            });
        });
    } else {
        //specific s-bahn departures
        Api.getSpecificDepartures(name, (error, departures) => {
            let reply = "Die nächsten Abfahrten an 'Universität' sind: \n \n";
            if (error) {
                reply = "Sorry, der Fahrplan scheint gerade down zu sein. Ich schiebs auf die Deutsche Bahn."
            }
            else {
                for (var i = 0; i < 4; i++) {
                    let minute = departures[i].departureTime.minute;
                    if (minute.length == 1) {
                        minute = "0" + minute;
                    }
                    let delayMsg = "";
                    let delaytime = departures[i].delay;
                    if (delaytime !== "0") {
                        delayMsg = "(" + delaytime + " min verspätet)";
                    }
                    reply = reply + departures[i].number + " nach " + departures[i].direction +
                        " um " + departures[i].departureTime.hour + ":" + minute + " Uhr " + delayMsg + "\n";
                }
            }
            callback({
                text: reply
            });
        });
    }
}

// again, hardcoded events and replies here
// this is not used for opening times, but when something first opened.
function opening(understood, callback) {
    var reply = "";
    var query = "null";
    if (typeof understood.entities.initiative !== 'undefined') {
        query = understood.entities.initiative[0].value;
    }
    query = query.toLowerCase();
    switch (query) {

        case "hdm":
            reply = phrases.infos[1];
            break;

        case "filmrausch":
            reply = "Den Filmrausch gibt es schon seit 2010.";
            break;

        case "horads":
            reply = phrases.infos[0];
            break;

        case "sketchjam":
            reply = "Den SketchJam gibt es seit dem Sommersemester 2016.";
            break;

        default:
            reply = "Ich konnte leider keine Initiative mit diesem Namen finden :/";
            break;
    }
    callback({
        text: reply
    });
}

// return plans for either one or both cafeterias, either today or on a specific date, depending on what's specified or not
function essensplan(understood, callback) {

    let reply = "Fehler! Irgendwas fehlt da!";

    if (typeof understood.entities.datetime !== 'undefined') {
        var dow = daytoDOW(understood.entities.datetime[0].value);
    } else {
        var dow = getCurrentDOW();
    }

    if (typeof understood.entities.place !== 'undefined') {
        var place = understood.entities.place[0].value;
    } else {
        var place = "both";
    }

    let day = dowtoName(dow);

    if (place === "eatntalk") {
        formatSBar(dow, day, (reply) => {
            const orderdomain = "https://essen.vs-hdm.de/"; // you're welcome for the advertising Manuel!
            callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": reply,
                        "buttons": [{
                            "type": "web_url",
                            "url": orderdomain,
                            "title": "Essen bestellen"
                        }]
                    }
                }
            });
        });
    } else if (place === "mensa") {
        formatMensa(dow, (reply) => {
            const orderdomain = "https://essen.vs-hdm.de/";
            callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": reply,
                        "buttons": [{
                            "type": "web_url",
                            "url": orderdomain,
                            "title": "Essen bestellen"
                        }]
                    }
                }
            });
        });
    } else {
        //both locations
        formatMensa(dow, (mensaReply) => {
            reply = "Hier dein Essensplan für " + day + ": \n \n";
            reply = reply + mensaReply;
            formatSBar(dow, day, (sbarReply) => {
                reply = reply + "\n \n" + sbarReply;
                const orderdomain = "https://essen.vs-hdm.de/";
                callback({
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": reply,
                            "buttons": [{
                                "type": "web_url",
                                "url": orderdomain,
                                "title": "Essen bestellen"
                                // Get ready for callback hell! Still way better than what used to be here though. 3...2...1...
                            }]
                        }
                    }
                });
            });
        });
    }
}

function formatSBar(dow, day, callback) {
    console.log("Today is dow " + getCurrentDOW() + ", requested day is dow " + dow);
    if (getCurrentDOW() > dow) {
        //wants to see next week
        console.log("Error: day is in the past or not published yet");
        reply = "Die Pläne für das Eat'n'talk werden leider immer erst am Montag veröffentlicht :/"
        callback(reply);
    } else {
        reply = "Im Eat'n'talk gibt es am " + day + " entweder ";
        Api.getSBar((days) => {
            if (typeof days[dow] === 'undefined') {
                //kein Essen für diesen Tag
                reply = "Am " + day + " hat das Eat'n'Talk leider geschlossen :/";
                callback(reply);
            } else {

                if (typeof days[dow].meals === 'undefined') {
                    //kein Essen für diesen Tag
                    reply = "Am " + day + " hat das Eat'n'Talk leider geschlossen :/";
                    callback(reply);
                } else {
                    for (var i = 0; i < days[dow].meals.length; i++) {
                        let splitmeal = days[dow].meals[i].split(": ");
                        let justmeal = splitmeal[1];
                        console.log(justmeal);
                        if (i === (days[dow].meals.length - 1)) {
                            reply = reply + "oder " + justmeal;
                        } else if (i !== 0) {
                            reply = reply + ", " + justmeal;
                        } else {
                            reply = reply + justmeal;
                        }
                    }
                    const orderdomain = "https://essen.vs-hdm.de/";
                    callback(reply);
                }
            }
        });
    }
}

function formatMensa(dow, callback) {
    reply = "Mensadaten kann ich noch nicht ausgeben, aber das Datum hab ich erkannt!";
    Api.getMensa((days) => {
        //find the next day with same day of the week
        let dayfound = false;
        for (var i = 0; i < days.length; i++) {
            testingdow = (daytoDOW(days[i].date) - 1);
            if (dow == testingdow) {
                console.log("The first matching index is " + i);
                if (typeof days[i].meals[0] === 'undefined') {
                    //feiertag oder so wahrscheinlich
                } else {
                    reply = "Vorspeise: " + days[i].meals[0].meal +
                        "\nHauptgericht 1: " + days[i].meals[1].meal +
                        "\nHauptgericht 2: " + days[i].meals[2].meal +
                        "\nBio-Gericht: " + days[i].meals[3].meal +
                        "\nHauptgericht 4: " + days[i].meals[4].meal;
                    const orderdomain = "https://essen.vs-hdm.de/";
                    callback(reply);
                    dayfound = true;
                }
                break;
            } else {
                console.log("Index " + i + " is " + testingdow + ", not " + dow);
            }
        }
        if (!dayfound) {
            reply = "Am " + dowtoName(dow) + " hat die Mensa geschlossen :/";
            callback(reply);
        }
    });
}

// ending times of last lecture of the day
function feierabend(understood, senderId, callback) {
    let reply = "Irgendwas fehlt hier. Hab aber immerhin einen Stundenplan zu dir gefunden.";
    Api.fetchTimeTable(senderId, (error, body) => {
        if (error) {
            reply = randomMessage(phrases.loginpls);
            const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
            callback({
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
        } else { //timetable found
            var dow;
            if (typeof understood.entities.datetime !== 'undefined') {
                //date given
                dow = daytoDOW(understood.entities.datetime[0].value);
            } else {
                //TODO: this seems to be somehow broken or not called:
                dow = getCurrentDOW();

                console.log("Today's dow is " + dow);
            }
            var timetable = JSON.parse(body);
            if (timetable[dow].schedule.length == 0) {
                reply = "Du hast am " + dowtoName(dow) + " keine Vorlesungen :D"
            } else {
                let last = (timetable[dow].schedule.length - 1);
                let lastlecture = timetable[dow].schedule[last];
                let endtime = datetoTime(lastlecture.end);
                reply = "Deine letzte Vorlesung am " + dowtoName(dow) + " ist " + lastlecture.name + " bis " + endtime + " Uhr";
            }
            callback({
                text: reply
            });
        }
    });
}

// starting time of first kecture of the day
function tagesbeginn(understood, senderId, callback) {
    let reply = "Irgendwas ist schiefgelaufen, die Nachricht hier solltest du niemals sehen :/";
    Api.fetchTimeTable(senderId, (error, body) => {
        if (error) {
            reply = randomMessage(phrases.loginpls);
            const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
            callback({
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
        } else { //timetable found
            var dow;
            if (typeof understood.entities.datetime !== 'undefined') {
                //date given
                dow = daytoDOW(understood.entities.datetime[0].value);
            } else {
                //TODO: this seems to be somehow broken or not called:
                dow = getCurrentDOW();
                console.log("Today's dow is " + dow);
            }
            var timetable = JSON.parse(body);
            if (timetable[dow].schedule.length == 0) {
                reply = "Du kannst ausschlafen, du hast " + dowtoName(dow) + "s keine Vorlesungen! :D"
            } else {
                let firstlecture = timetable[dow].schedule[0];
                let begintime = datetoTime(firstlecture.begin);
                reply = "Deine erste Vorlesung am " + dowtoName(dow) + " ist " + firstlecture.name + " um " + begintime + " Uhr";
            }
            callback({
                text: reply
            });
        }
    });
}

// user requested feature, returns the next lecture wehn aked things like "wann gehts weiter" or "wann hab ich vorlesung"
function nextlecture(understood, senderId, callback) {
    let reply = "Irgendwas ist schiefgelaufen, die Nachricht hier solltest du niemals sehen :/";
    Api.fetchTimeTable(senderId, (error, body) => {
        if (error) {
            reply = randomMessage(phrases.loginpls);
            const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
            callback({
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
        } else { //timetable found
            var dow = getCurrentDOW();
            console.log("Today's dow is " + dow);

            var timetable = JSON.parse(body);
            if (timetable[dow].schedule.length == 0) {
                reply = "Du hast heute gar keine Vorlesungen! :D"
            } else {
                let lecturefound = false;
                for (var i = 0; i < timetable[dow].schedule.length; i++) {
                    if (isPast(timetable[dow].schedule[i].begin)) {
                        console.log(timetable[dow].schedule[i].name + " has already begun earlier");
                    }
                    else {
                        //next not-started lecture found
                        lecturefound = true;
                        let nextlecture = timetable[dow].schedule[i];
                        let begintime = datetoTime(nextlecture.begin);
                        console.log(nextlecture.name + " is the next lecture!");
                        reply = "Deine nächste Vorlesung, " + nextlecture.name + ", beginnt um " + begintime + " Uhr!";
                        break;
                    }
                }
                if (!lecturefound) {
                    reply = "Du hast heute keine Vorlesungen (mehr)!"
                }
            }
            callback({
                text: reply
            });
        }
    });
}

// deatils of that same next lecture. TODO: Redundancy
function nextlectureroom(understood, senderId, callback) {
    let reply = "Irgendwas ist schiefgelaufen, die Nachricht hier solltest du niemals sehen :/";
    Api.fetchTimeTable(senderId, (error, body) => {
        if (error) {
            reply = randomMessage(phrases.loginpls);
            const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
            callback({
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
        } else { //timetable found
            var dow = getCurrentDOW();
            console.log("Today's dow is " + dow);

            var timetable = JSON.parse(body);
            if (timetable[dow].schedule.length == 0) {
                reply = "Du hast heute gar keine Vorlesungen! :D"
            } else {
                let lecturefound = false;
                for (var i = 0; i < timetable[dow].schedule.length; i++) {
                    if (isPast(timetable[dow].schedule[i].begin)) {
                        console.log(timetable[dow].schedule[i].name + " has already begun earlier");
                    }
                    else {
                        //next not-started lecture found
                        lecturefound = true;
                        let nextlecture = timetable[dow].schedule[i];
                        let begintime = datetoTime(nextlecture.begin);
                        console.log(nextlecture.name + " is the next lecture!");
                        let room = nextlecture.room;
                        reply = "Deine nächste Vorlesung, " + nextlecture.name + ", ist in Raum " + room + ".";
                        break;
                    }
                }
                if (!lecturefound) {
                    reply = "Du hast heute keine Vorlesungen (mehr)!"
                }
            }
            callback({
                text: reply
            });
        }
    });
}

// huge timetable function, handles everything regarding that
function stundenplan(understood, senderId, callback) {
    let reply = "Ich kenn deinen Stundenplan, das ist schonmal was. Aber frag mich doch bitte nach einem bestimmten Tag oder einer bestimmten Vorlesung!";
    Api.fetchTimeTable(senderId, (error, body) => {
        if (error) {
            reply = randomMessage(phrases.loginpls);
            const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
            callback({
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
        } else {
            if (typeof understood.entities.lecture !== 'undefined') {
                //If there is a lecture but no day given
                let query = "null";
                let reply;
                query = understood.entities.lecture[0].value;
                //TODO: opportunity for big optimization if we could write another function that filters an already fetched timetable!
                Api.getFilteredTimetable(senderId, query, (error, filteredschedule) => {
                    let reply = query + " ist: ";
                    let lecturefound = false;
                    if (!error) {
                        for (var i = 0; i < 7; i++) {
                            if (filteredschedule[i].length > 0) {
                                console.log("Tag mit gewünschter Vorlesung");
                                lecturefound = true;
                                reply = reply + "\n" + dowtoName(i) + " um ";
                                let times = [];
                                for (var j = 0; j < filteredschedule[i].length; j++) {
                                    let begintime = datetoTime(filteredschedule[i][j].begin);
                                    if (!times.includes(begintime)) {
                                        times.push(begintime);
                                    }
                                }
                                reply = reply + times.join(" und ") + " Uhr";
                            }
                        }
                        if (lecturefound) {
                            callback({
                                text: reply
                            });
                        } else {
                            reply = "Hmm, da ist was schiefgelaufen :/. Ich konnte keine Vorlesung mit dem Namen in deinem Stundenplan finden.";
                            callback({
                                text: reply
                            });
                        }
                    } else {
                        reply = "Hmm, da ist was schiefgelaufen, konnte nix dazu finden :/. Sicher, dass du angemeldet bist?";
                        const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
                        callback({
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
                    }
                });
            } else if (typeof understood.entities.datetime !== 'undefined' && typeof understood.entities.lecture === 'undefined') {
                //If there is a day but no specific lecture given
                let dow = daytoDOW(understood.entities.datetime[0].value);
                reply = "Du willst wissen was du am " + dowtoName(dow) + " hast";

                console.log("Timetable fetched successfully");
                timetable = JSON.parse(body);

                if (timetable[dow].schedule.length == 1) {
                    reply = "Deine einzige Vorlesung am " + dowtoName(dow) + " ist "
                } else if (timetable[dow].schedule.length == 0) {
                    reply = "Du hast am " + dowtoName(dow) + " keine Vorlesungen :D"
                } else {
                    reply = "Deine Vorlesungen am " + dowtoName(dow) + " sind: \n"
                }
                var lastbegin = "Irgendein Indikator für doppelte Vorlesungen, den ich noch finden muss";
                for (var i = 0; i < timetable[dow].schedule.length; i++) {
                    let begin = timetable[dow].schedule[i].begin;
                    if (lastbegin != begin) {
                        if (i == (timetable[dow].schedule.length - 2)) {
                            reply = reply + timetable[dow].schedule[i].name + " um " + datetoTime(begin) + " Uhr und \n";
                        } else if (i == (timetable[dow].schedule.length - 1)) {
                            reply = reply + timetable[dow].schedule[i].name + " um " + datetoTime(begin) + " Uhr.";
                        } else {
                            reply = reply + timetable[dow].schedule[i].name + " um " + datetoTime(begin) + " Uhr, \n";
                        }
                    }
                }

                callback({
                    text: reply
                });


            } else {
                console.log("Weder lecture noch zeit gegeben...");
                callback({
                    text: reply
                });
            }
        }
    });
}

// who gives what lecture
function lectureProf(understood, id, callback) {
    let query;
    let reply;
    if (typeof understood.entities.lecture !== 'undefined') {
        query = understood.entities.lecture[0].value;
        Api.getLectureDetails(id, query, (error, details) => {
            if (!error) {
                var name = details.name;
                if (details.lecturer === null) {
                    reply = "Für " + name + " ist leider kein Prof hinterlegt :/";
                }
                else {
                    reply = name + " wird unterrichtet von " + details.lecturer;
                }
                callback({
                    text: reply
                });
            } else {
                reply = randomMessage(phrases.nolecture) + " Bist du sicher, dass sie so heißt und du angemeldet bist?";
                const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + id;
                callback({
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
            }
        });
    }
    else {
        callback({
            text: "Hmm, habe nicht ganz verstanden welche Vorlesung du meinst :/"
        });
    }
}

// what lecture gives how many credits.
function lectureECTS(understood, id, callback) {
    let query;
    let reply;
    if (typeof understood.entities.lecture !== 'undefined') {
        query = understood.entities.lecture[0].value;
        Api.getLectureDetails(id, query, (error, details) => {
            if (!error) {
                var name = details.name;
                if (details.ects === "") {
                    reply = "Für " + name + " sind leider keine ECTS hinterlegt :/";
                }
                else {
                    reply = name + " gibt " + details.ects + " ECTS!";
                }
                callback({
                    text: reply
                });
            } else {
                reply = randomMessage(phrases.nolecture) + " Bist du sicher, dass sie so heißt und du angemeldet bist?";
                const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + id;
                callback({
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
            }
        });
    }
    else {
        callback({
            text: "Hmm, habe nicht ganz verstanden welche Vorlesung du meinst :/"
        });
    }
}

// yadda yadda yadda, self-explanatory
function lecturePlace(understood, id, callback) {
    let query = "null";
    let reply;
    if (typeof understood.entities.lecture !== 'undefined') {
        query = understood.entities.lecture[0].value;
    }
    Api.getFilteredTimetable(id, query, (error, filteredschedule) => {
        let reply = query + " ist: ";
        let lecturefound = false;
        if (!error) {
            for (var i = 0; i < 7; i++) {
                if (filteredschedule[i].length > 0) {
                    console.log("Tag mit gewünschter Vorlesung");
                    lecturefound = true;
                    reply = reply + "\n" + dowtoName(i) + " in Raum ";
                    let rooms = [];
                    for (var j = 0; j < filteredschedule[i].length; j++) {
                        console.log(filteredschedule[i][j].room);
                        if (!rooms.includes(filteredschedule[i][j].room)) {
                            rooms.push(filteredschedule[i][j].room);
                        }
                    }
                    reply = reply + rooms.join(" und ");
                }
            }
            if (lecturefound) {
                callback({
                    text: reply
                });
            } else {
                Api.getLectureDetails(id, query, (error, details) => {
                    if (error) {
                        reply = randomMessage(phrases.nolecture);
                    }
                    else {
                        if (details.room == null) {
                            reply = "Zu der Vorlesung ist leider kein Raum hinterlegt :/";
                        }
                        else {
                            let room = details.room;
                            reply = details.name + " ist in Raum " + room;
                        }
                    }
                    callback({
                        text: reply
                    });
                });
            }
        } else {
            reply = randomMessage(phrases.nolecture) + " Bist du sicher, dass sie so heißt und du angemeldet bist?";
            const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + id;
            callback({
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
        }
    });
}

// returns details and office hours of employees.
// we have discussed using public timetables to always track where a prof is on multiple occasions, but have always dropped it due to privacy concerns
function profsuche(understood, callback) {

    let prof = "null";
    if (typeof understood.entities.prof !== 'undefined') {
        prof = understood.entities.prof[0].value;
    };
    let reply;
    let result;

    Api.getProfRoom(prof, (room, name, time, mail, job, department) => {

        //TODO: fix this and add a quick reply for the room!
        if (name === null) {
            reply = "Den Prof konnte ich leider nicht finden :/"; //TODO: Variable error messages
        }
        else {
            if (time === null) {
                time = 'manchmal';
            }
            if (room === null) {
                reply = name + ' erreichst du per Mail unter ' + mail;
            }
            if (department === null) {
                reply = name + ' ist ' + job + ' an der HdM und ' + time + ' anzutreffen in Raum ' + room + '. ' + ((mail) ? ' Ansonsten versuchs per Mail an ' + mail : '');
            } else {
                reply = name + ' ist ' + job + ' in ' + department + ' und ' + time + ' anzutreffen in Raum ' + room + '. ' + ((mail) ? ' Ansonsten versuchs per Mail an ' + mail : '');
            }
        }

        const maildomain = 'https://paulaandyou.herokuapp.com/mailtool?mail=' + mail;

        if (mail !== null) {
            callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": reply,
                        "buttons": [{
                            "type": "web_url",
                            "url": maildomain,
                            "title": "Mail schreiben"
                        }]
                    }
                }
            });
        } else {
            callback({
                text: reply
            });
        }

    })
}

function raumsuche(understood, callback) {

    console.log("Entities: " + understood.entities);
    console.log("Room: " + understood.entities.room);
    console.log("Room 0: " + understood.entities.room[0]);
    console.log("Room value: " + understood.entities.room[0].value);
    let raum = "null";
    if (typeof understood.entities.room !== 'undefined') {
        raum = understood.entities.room[0].value;
    };
    let reply;
    let firstletter = raum.charAt(0);

    Api.getRoomDetails(raum, (name, type, level, lat, long, error) => {

        const horstadd = randomMessage(phrases.horst);
        if (error) {
            if (firstletter == "s") {
                reply = "Sorry, dieser Raum ist noch nicht im System. Räume mit 's' am Anfang sind aber für gewöhnlich im Erweiterungsbau Süd, dem grauen Würfel. Such vielleicht dort mal."
            } else {
                reply = randomMessage(phrases.noroom) + " " + horstadd;
            }

            callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": reply,
                        "buttons": [{
                            "type": "web_url",
                            "url": "https://www.hdm-stuttgart.de/horst",
                            "title": "HoRsT"
                        }]
                    }
                }
            });
        } else {
            let building = "Hauptgebäudes";
            if (firstletter == "i") {
                building = "Neubau Nobelstraße 8 (silberne Zitronenscheibe)";
            } else if (firstletter == "s") {
                building = "Erweiterungsbau Süd (grauer Würfel)";
            }

            if (name == "" || name == null) {
                reply = "Raum " + raum + " (" + type + ") ist irgendwo im " + level + " des " + building + ". " + horstadd;
            } else {
                reply = "Raum " + raum + " (" + name + ") ist irgendwo im " + level + " des " + building + ". " + horstadd;
            }
            const mapsDomain = "https://www.google.com/maps/place/" + lat + "," + long;
            callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "text": reply,
                        "buttons": [{
                            "type": "web_url",
                            "url": "https://www.hdm-stuttgart.de/horst",
                            "title": "HoRsT"
                        },
                        {
                            "type": "web_url",
                            "url": mapsDomain,
                            "title": "Auf Karte zeigen"
                        }
                        ]
                    }
                }
            });
        }

    });

}

function weather(understood, callback) {
    if (typeof understood.entities.datetime !== 'undefined') {
        var dow = daytoDOW(understood.entities.datetime[0].value);
    } else {
        var dow = getCurrentDOW();
    }
    Api.getWeather(dow, (result) => {
        var reply;
        if (result == null) {
            //can't see how this would ever happen, but let's handle it.
            reply = "Huch, irgendwie konnte ich keine Wettervorhersage zu dem Tag gefunden :/";
        }
        else {
            let dayname = result.title;
            let forecast = result.fcttext_metric;
            reply = dayname + " wird es " + forecast + " Danke an Weather Underground für die Infos!";
        }
        callback({
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": reply,
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.wunderground.com/?apiref=67580151348b9acc",
                        "title": "Weather Underground"
                    }
                    ]
                }
            }
        });
    });
}

// Add quick replies and helpful message right to a given text. TODO: Redundancy here
function sendSuggestions(text, callback) {
    message = text + " " + randomMessage(phrases.helping);
    callback({
        "text": message,
        "quick_replies": [{
            "content_type": "text",
            "title": "Raumsuche",
            "payload": "SUGGEST_ROOM"
        },
        {
            "content_type": "text",
            "title": "Profsuche",
            "payload": "SUGGEST_PROF"
        },
        {
            "content_type": "text",
            "title": "Stundenplan",
            "payload": "SUGGEST_TIMETABLE"
        },
        {
            "content_type": "text",
            "title": "Essensplan",
            "payload": "SUGGEST_MENSA"
        },
        {
            "content_type": "text",
            "title": "Fahrplan",
            "payload": "SUGGEST_TRAIN"
        },
        {
            "content_type": "text",
            "title": "Vorlesungsinfos",
            "payload": "SUGGEST_LECTURES"
        },
        {
            "content_type": "text",
            "title": "Eventsuche",
            "payload": "SUGGEST_EVENT"
        },
        {
            "content_type": "text",
            "title": "Öffnungszeiten",
            "payload": "SUGGEST_OPENING"
        },
        {
            "content_type": "text",
            "title": "HdM Wetter",
            "payload": "SUGGEST_WEATHER"
        },
        {
            "content_type": "text",
            "title": "Fun",
            "payload": "SUGGEST_FUN"
        }
        ]
    });
}

// Followup main menu with just a random helpful message
function sendFollowup(callback) {
    message = randomMessage(phrases.nowwhat);
    callback({
        "text": message,
        "quick_replies": [{
            "content_type": "text",
            "title": "Raumsuche",
            "payload": "SUGGEST_ROOM"
        },
        {
            "content_type": "text",
            "title": "Profsuche",
            "payload": "SUGGEST_PROF"
        },
        {
            "content_type": "text",
            "title": "Stundenplan",
            "payload": "SUGGEST_TIMETABLE"
        },
        {
            "content_type": "text",
            "title": "Essensplan",
            "payload": "SUGGEST_MENSA"
        },
        {
            "content_type": "text",
            "title": "Fahrplan",
            "payload": "SUGGEST_TRAIN"
        },
        {
            "content_type": "text",
            "title": "Vorlesungsinfos",
            "payload": "SUGGEST_LECTURES"
        },
        {
            "content_type": "text",
            "title": "Eventsuche",
            "payload": "SUGGEST_EVENT"
        },
        {
            "content_type": "text",
            "title": "Öffnungszeiten",
            "payload": "SUGGEST_OPENING"
        },
        {
            "content_type": "text",
            "title": "HdM Wetter",
            "payload": "SUGGEST_WEATHER"
        },
        {
            "content_type": "text",
            "title": "Fun",
            "payload": "SUGGEST_FUN"
        },
        {
            "content_type": "text",
            "title": "Lass mich in Ruhe",
            "payload": "SUGGEST_SHUTUP"
        }
        ]
    });
}

// generates a login link with the senderID encoded as a querystring, returns a message linking to it
function generateLogin(senderId, callback) {
    reply = "Speichere und aktualisiere deinen Stundenplan hier:";
    const logindomain = 'https://paulaandyou.herokuapp.com/login?id=' + senderId;
    callback({
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
}

// HELPER FUNCTIONS FROM HERE ON

function randomMessage(messageArray) {
    return messageArray[Math.floor(Math.random() * (messageArray.length))];
}

function datetoTime(dateString) {
    let fulltime = dateString.split(" ");
    let times = fulltime[1].split(":");
    if (times[1] == "00") {
        return times[0];
    } else {
        return times[0] + ":" + times[1];
    }
}

function daytoDOW(dateString) {

    let dateObj = new Date(dateString);
    let day = dateObj.getDay();
    return day;

}

function getCurrentDOW() {
    let today = new Date();
    let day = today.getDay();
    if (day == 0) {
        day = 6;
    } else {
        day--;
    }
    return day;
}

function daysUntilDow(dow) {
    var currentDow = getCurrentDOW();
    if (currentDow < dow) {
        return (dow - currentDow);
    } else if (currentDow > dow) {
        let daysuntil = (6 - currentDow) + dow;
        return daysuntil;
    } else {
        return 0;
    }
}

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

function monthToName(month) {
    switch (month) {
        case 0:
            return "Januar";
            break;
        case 1:
            return "Februar";
            break;
        case 2:
            return "März";
            break;
        case 3:
            return "April";
            break;
        case 4:
            return "Mai";
            break;
        case 5:
            return "Juni";
            break;
        case 6:
            return "Juli";
            break;
        case 7:
            return "August";
            break;
        case 8:
            return "September";
            break;
        case 9:
            return "Oktober";
            break;
        case 10:
            return "November";
            break;
        case 11:
            return "Dezember";
            break;
    }
}

function crapTimeToDateString(crapString) { // I think there was an easier way to do this
    // reformats 20170612 08:15:00 to a valid, parseable string
    return crapString.slice(0, 4) + "-" + crapString.slice(4, 6) + "-" + crapString.slice(6, 8) + "T" + crapString.slice(9);
}

// now this was a pain in the neck! We can't make any assumptions about time zones, as the heroku server is in the US and because of daylight savings time.
// https://www.youtube.com/watch?v=-5wpm-gesOY
function isPast(dbTimestring) {
    var hour = dbTimestring.slice(9, 11);
    var minute = dbTimestring.slice(12, 14);
    var currentGMT = moment();
    var currentHDM = currentGMT.clone().tz("Europe/Berlin");
    var checkTime = moment.tz(hour + ":" + minute, "HH:mm", "Europe/Berlin");
    console.log(checkTime.format() + " is the lecture being checked");
    console.log(currentHDM.format() + " is the current time.");
    var result = currentHDM.isAfter(checkTime);
    return result;
}

module.exports = {
    createMessage: createMessage,
    sendSuggestions: sendSuggestions,
    sendFollowup: sendFollowup
}
