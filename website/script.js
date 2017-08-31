var shortfield = document.getElementById("shorthand");
var passfield = document.getElementById("pass");
var button = document.getElementById("Savebutton");

// fetch and validate entries, then show a popup and/or call sendInput
function testResults() {
    var shorthand = document.getElementById("shorthand").value;
    var pass = document.getElementById("pass").value;
    var id = getUrlParameter("id");

    if (!shorthand && !pass) { // No data entered
        showPopup("Bitte gib dein Kürzel und dein HdM-Passwort ein!");
        shortfield.style.backgroundColor = "rgba(210,13,68,0.15)";
        passfield.style.backgroundColor = "rgba(210,13,68,0.15)";
    }
    else if (shorthand && !pass) { // No password entered
        showPopup("Bitte gib dein HdM-Passwort ein!");
        shortfield.style.backgroundColor = "transparent";
        passfield.style.backgroundColor = "rgba(210,13,68,0.15)";
    }
    else if (pass && !shorthand) { //no shorthand entered
        showPopup("Bitte gib dein HdM-Kürzel ein!");
        shortfield.style.backgroundColor = "rgba(210,13,68,0.15)";
        passfield.style.backgroundColor = "transparent";
    }
    else { // both fields entered
        button.style.background = "url(loading_dots.gif)";
        button.style.backgroundSize = "cover";
        button.style.backgroundRepeat = "no-repeat";
        button.style.backgroundPosition = "center";
        button.value = "";
        sendInput(shorthand, pass, id);
        shortfield.style.backgroundColor = "transparent";
        passfield.style.backgroundColor = "transparent";
    }
}

$(document).ready(function () {

	// "enter" key submits results
    $(document).keypress(function (e) {
        if (e.which == 13) {
            testResults();
        }
    });

    $('#Savebutton').click(function () {
        testResults();
    });

});

function sendInput(short, pass, id) {

	// The unique facebook senderID is is used as a key for the database and should be encoded into the URL by PAuLA
    if (!id) {
        showPopup('error, id fehlt!');
        button.style.background = "";
        button.value = "Synchronisieren";
    } else {
        $.ajax({
            type: 'POST',
            url: 'https://paulaandyou.herokuapp.com/authservice',
            dataType: "json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify({ id: id, short: short, pass: pass }),
            success: function () {
                showPopup('Daten aktualisiert!');
                shortfield.style.backgroundColor = "transparent";
                passfield.style.backgroundColor = "transparent";
                button.style.background = "";
                button.value = "Synchronisieren";

            },
            error: function () {
                showPopup('Passwort falsch / Verbindungsfehler!');
                shortfield.style.backgroundColor = "transparent";
                passfield.style.backgroundColor = "rgba(210,13,68,0.15)";
                button.style.background = "";
                button.value = "Synchronisieren";
            }
        });
    }

}

function showPopup(text) {
    document.getElementById("popuptext").innerHTML = text;
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

function getUrlParameter(name) {
	// doing this the hard way
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
