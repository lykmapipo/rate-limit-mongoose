'use strict';


/* dependencies */
const { expect } = require('chai');
const { waterfall, parallel } = require('async');
const { clear } = require('@lykmapipo/mongoose-test-helpers');
const createStore = require('../');


describe('rate-limit-mongoose', () => {

  const ip = '127.0.0.1';

  beforeEach(done => clear(done));

  it('should expose rate limit storage factory', () => {
    expect(createStore).to.exist;
    expect(createStore).to.be.a('function');
    expect(createStore.name).to.be.equal('createStore');
  });

  it('should create default rate limit storage', () => {
    const store = createStore();
    expect(store).to.exist;
    expect(store.incr).to.exist;
    expect(store.incr).to.be.a('function');
    expect(store.decrement).to.exist;
    expect(store.decrement).to.be.a('function');
    expect(store.resetKey).to.exist;
    expect(store.resetKey).to.be.a('function');
  });

  it('should increment hits', (done) => {
    const store = createStore();
    store.incr(ip, (error, hits, resetTime) => {
      expect(error).to.be.null;
      expect(hits).to.equal(1);
      expect(resetTime).to.exist;
      done(error, hits, resetTime);
    });
  });

  it('should increment hits sequentially', (done) => {
    const store = createStore();
    const incr = ip => next => store.incr(ip, () => next());
    const last = ip => next => store.incr(ip, next);
    waterfall([incr(ip), incr(ip), last(ip)], (error, hits, resetTime) => {
      expect(error).to.be.null;
      expect(hits).to.equal(3);
      expect(resetTime).to.exist;
      done(error, hits, resetTime);
    });
  });

  it('should increment hits parallel', (done) => {
    const store = createStore();
    const incr = ip => next => store.incr(ip, next);
    const run = [incr(ip), incr(ip), incr(ip), incr(ip), incr(ip)];
    parallel(run, (error, results) => {
      expect(error).to.be.null;
      expect(results).to.exist;
      expect(results).to.have.length(5);
      done(error, results);
    });
  });

  it('should decrement hits', (done) => {
    const store = createStore();
    const incr = ip => next => store.incr(ip, () => next());
    const decr = ip => next => store.decrement(ip, next);
    waterfall([incr(ip), incr(ip), decr(ip)], (error, hits, resetTime) => {
      expect(error).to.be.null;
      expect(hits).to.equal(1);
      expect(resetTime).to.exist;
      done(error, hits, resetTime);
    });
  });

  it('should reset hits', (done) => {
    const store = createStore();
    store.resetKey(ip, (error, hits, resetTime) => {
      expect(error).to.be.null;
      expect(hits).to.equal(0);
      expect(resetTime).to.exist;
      done(error, hits, resetTime);
    });
  });

  it('should reset hits', (done) => {
    const store = createStore();
    const incr = ip => next => store.incr(ip, () => next());
    const reset = ip => next => store.resetKey(ip, next);
    waterfall([incr(ip), incr(ip), reset(ip)], (error, hits, resetTime) => {
      expect(error).to.be.null;
      expect(hits).to.equal(0);
      expect(resetTime).to.exist;
      done(error, hits, resetTime);
    });
  });

  // run only locally
  // why?: https://docs.mongodb.com/manual/core/index-ttl/#timing-of-the-delete-operation
  it.skip('should resets key store when the windowMs reached', (done) => {
    const store = createStore({ modelName: 'Rate', windowMs: 1000 });
    const incr = ip => next => store.incr(ip, () => next());
    const delay = next => setTimeout(() => next(), 70000);
    const last = ip => next => store.incr(ip, next);
    waterfall([incr(ip), delay, last(ip)], (error, hits, resetTime) => {
      expect(error).to.be.null;
      expect(hits).to.equal(1);
      expect(resetTime).to.exist;
      done(error, hits, resetTime);
    });
  });

  it.skip('should restrict hits not to go below zero');

  afterEach(done => clear(done));

});