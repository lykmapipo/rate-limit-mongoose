'use strict';


/* dependencies */
const _ = require('lodash');
const {
  model,
  Schema,
  SCHEMA_OPTIONS
} = require('@lykmapipo/mongoose-common');


/* constants */
const DEFAULTS = ({ modelName: 'RateLimit', windowMs: 60000 });


/**
 * @function createSchema
 * @name createSchema
 * @description create rate limit mongoose schema
 * @params {Object} [optns] create model options
 * @params {Number} [optns.windowMs=60000] How long in milliseconds to keep 
 * records of requests in storage.
 * @return {Schema} valid mongoose schema
 * @since 0.1.0
 * @version 0.1.0
 */
function createSchema(optns) {
  // ensure options
  const options = _.merge({}, DEFAULTS, optns);
  const { windowMs } = options;

  // unique request key(or ip) e.g 127.0.0.1 etc
  const key = ({
    type: String,
    trim: true,
    required: true,
    index: true,
    unique: true
  });

  // number of request hits of the key(or ip) e.g 1, 100, 2000 etc
  const hits = ({
    type: Number,
    required: true,
    index: true,
    default: 1
  });

  // time when request hits of the key(or ip) created
  const updatedAt = ({ type: Date, expires: (windowMs / 1000) });

  // instantiate schema
  const schema = new Schema({ key, hits, updatedAt }, SCHEMA_OPTIONS);

  // force indexes on timestamps
  schema.index({ createdAt: 1, updatedAt: 1 });

  // force uniqueness hits per key(or ip)
  schema.index({ key: 1, hits: 1 }, { unique: true });

  // return schema
  return schema;
}


/**
 * @function createModel
 * @name createModel
 * @description create rate limit mongoose model
 * @params {Object} [optns] create model options
 * @params {String} [optns.modelName='RateLimit'] rate limit model name
 * @return {Model} valid mongoose model
 * @since 0.1.0
 * @version 0.1.0
 */
function createModel(optns) {
  // ensure options
  const options = _.merge({}, DEFAULTS, optns);
  const { modelName } = options;

  // register mongoose model if not exists
  const schema = createSchema(optns);
  const rateLimitModel = model(modelName, schema);

  // return model
  return rateLimitModel;
}


/**
 * @function createStore
 * @name createStore
 * @description create rate limit mongoose store
 * @params {Object} [optns] create model options
 * @params {String} [optns.modelName='RateLimit'] rate limit model name
 * @params {Number} [optns.windowMs=60000] How long in milliseconds to keep 
 * records of requests in storage.
 * @return {Model} valid mongoose model
 * @since 0.1.0
 * @version 0.1.0
 */
function createStore(optns) {
  // ensure options
  const options = _.merge({}, DEFAULTS, optns);
  const { windowMs } = options;

  // obtain model
  const RateLimit = createModel(options);

  // upsert hits of specified key(or ip)
  function hit(key, increment, reset, done) {
    // build criteria
    const criteria = ({ key });
    const updates = (
      reset ?
      ({ $set: { hits: increment || 0 } }) :
      ({ $inc: { hits: increment || 1 } })
    );
    const options = ({ upsert: true, new: true, setDefaultsOnInsert: true });

    // issue upsert query
    RateLimit
      .findOneAndUpdate(criteria, updates, options)
      .exec(function afterUpsert(error, rate) {
        // return
        if (!error && rate) {
          const resetTime = new Date(rate.updatedAt.getTime() + windowMs);
          done(null, rate.hits, resetTime);
        }
        // loop till succeed
        else {
          _.defer(function diferHit() { hit(key, increment, reset, done); });
        }
      });
  }

  // increment hits of specified key(or ip)
  function incr(key, done) {
    const _done = _.isFunction(done) ? done : _.noop;
    hit(key, 1, false, _done);
  }

  // decrement hits of specified key(or ip)
  function decrement(key, done) {
    const _done = _.isFunction(done) ? done : _.noop;
    hit(key, -1, false, _done);
  }

  // reset hits to 0 of specified key(or ip)
  function resetKey(key, done) {
    const _done = _.isFunction(done) ? done : _.noop;
    hit(key, 0, true, _done);
  }

  return { incr, decrement, resetKey };
}


/* export factories */
module.exports = exports = createStore;