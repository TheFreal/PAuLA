var expect = require('chai').expect;
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
chai.use(chaiHttp);
chai.use(require('chai-json'));
var supertest = require("supertest");
var should = require("should");
var getDepartures = require('../api').getDepartures;
var searchLectureDetails = require('../api').searchLectureDetails;
var getEvents = require('../api').getEvents;
var getNextFilmrausch = require('../api').getNextFilmrausch;
var getSBar = require('../api').getSBar;
var getMensa = require('../api').getMensa;
var getWeather = require('../api').getWeather;

describe('efa-api test', function() {
  it('returns statusCode 200', function(done) {
        var server = supertest.agent('https://efa-api.asw.io');
        server
        .get('/api/v1/station/5006008/departures/?format=json')
        .expect(200)
        .end(function(err, res) {
          res.status.should.equal(200);
          done();
        })
    });

  it('returns train array', function(done) {
        getDepartures(function(err, trains) {
          // should return an array object
        expect(Array.isArray(trains)).to.equal(true);
        done();
        });
    });
  });



  describe('hdm-app-api test', function() {
    it('returns statusCode 200', function(done) {
          var server = supertest.agent('https://hdmapp.mi.hdm-stuttgart.de');
          server
          .get('/')
          .expect(200)
          .end(function(err, res) {
            res.status.should.equal(200);
            done();
          })
      });

    it('returns object', function(done) {
          var query = 'Mobile Application Development';
          searchLectureDetails(query, function(err, details) {
            /* If the API call was successfully, it should return a json object,
            if the statusCode is not 200, details is an empty object: '{}' */
          expect(details).to.be.an('object');
          // expect(details).to.be.json;
          done();
          });
      });
    });



  describe('event-domain test', function() {
    it('returns statusCode 200', function(done) {
          var server = supertest.agent('https://www.hdm-stuttgart.de/hochschule/aktuelles/terminkalender');
          server
          .get('/')
          .expect(200)
          .end(function(err, res) {
            res.status.should.equal(200);
            done();
          })
      });

    it('returns event array', function(done) {
          getEvents(function(events) {
            // should return an array object
          expect(Array.isArray(events)).to.equal(true);
          done();
          });
      });
    });



  describe('filmrausch-domain test', function() {
    it('returns statusCode 200', function(done) {
          var server = supertest.agent('http://filmrausch.hdm-stuttgart.de');
          server
          .get('/about/movies.json')
          .expect(200)
          .end(function(err, res) {
            res.status.should.equal(200);
            done();
          })
      });

    it('return movies', function(done) {
          getNextFilmrausch(function(err, movies) {
            /* should return an json object
            (movies for the new term aren't available at the moment) */
          expect(movies).to.be.null;
          done();
          });
      });
    });



  describe('S-Bar-domain test', function() {
    it('returns statusCode 200', function(done) {
          var server = supertest.agent('http://www.s-bar.de');
          server
          .get('/ihr-betriebsrestaurant/aktuelle-speiseplaene.html')
          .expect(200)
          .end(function(err, res) {
            res.status.should.equal(200);
            done();
          })
      });

    it('return meals', function(done) {
          getSBar(function(days) {
            // should return an array
          expect(Array.isArray(days)).to.equal(true);
          done();
          });
      });
    });



  describe('Mensa domain test', function() {
    it('returns statusCode 200', function(done) {
          var server = supertest.agent('http://www.studierendenwerk-stuttgart.de');
          server
          .get('/speiseangebot_rss')
          .expect(200)
          .end(function(err, res) {
            res.status.should.equal(200);
            done();
          })
      });

    it('return meals', function(done) {
          getMensa(function(dates) {
            // should return an array
          expect(Array.isArray(dates)).to.equal(true);
          //expect(dates).to.be.an('array').that.is.not.empty;
          done();
          });
      });
    });


  describe('Weather-API test', function() {
    it('returns statusCode 200', function(done) {
          var server = supertest.agent('http://api.wunderground.com');
          server
          .get('/api')
          .expect(200)
          .end(function(err, res) {
            res.status.should.equal(200);
            done();
          })
      });
    });
