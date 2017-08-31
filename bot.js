// THIS MODULE HANDLES NATURAL LANGUAGE PROCESSING/UNDERSTANDING

const Wit = require('node-wit').Wit;
const client = new Wit({
	accessToken: process.env.WIT_TOKEN
});

//get a pre-prepared message from the index module (all lowercase, critical words replaced) and return it parsed by AI
function understand(messageString) {

	return new Promise(
		(resolve, reject) => {
			client.message(messageString, {})
				.then((data) => {
					console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
					resolve(data);
				})
				.catch((error) => {
					console.log('We got an error: ' + error);
					reject(data);
				});
		});

}

module.exports = {
	understand: understand
}
