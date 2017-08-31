var expect = require('chai').expect;
var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.use(require('chai-json'));
const Bot = require('../bot.js');


describe('test for correct intents', function() {
  it('returns expected intent "eröffnung"', function(done) {
    this.timeout(5000);
    var message = 'wie lange gibt es den filmrausch schon?';
    Bot.understand(message).then((understood) => {
      console.log(JSON.stringify(understood))
      var intent = understood.entities ? understood.entities.intent[0].value : '';
      expect(intent).to.equal('eröffnung');
      done();
    });
  });

  it('returns expected intent "eventplan"', function(done) {
    this.timeout(5000);
    var message = 'wann ist das nächste mal improtheater?';
    Bot.understand(message).then((understood) => {
      console.log(JSON.stringify(understood))
      var intent = understood.entities ? understood.entities.intent[0].value : '';
      expect(intent).to.equal('eventplan');
      done();
    });
  });

  it('returns expected intent "lecture-ects"', function(done) {
    this.timeout(5000);
    var message = 'wie viel ects gibt it projektmanagment ?';
    Bot.understand(message).then((understood) => {
      console.log(JSON.stringify(understood))
      var intent = understood.entities ? understood.entities.intent[0].value : '';
      expect(intent).to.equal('lecture-ects');
      done();
    });
  });

  it('returns expected intent "raumsuche"', function(done) {
    this.timeout(5000);
    var message = 'Ich habe mich verlaufen';
    Bot.understand(message).then((understood) => {
      console.log(JSON.stringify(understood))
      var intent = understood.entities ? understood.entities.intent[0].value : '';
      expect(intent).to.equal('raumsuche');
      done();
    });
  });
});
