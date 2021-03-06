import {attempt} from 'joi';
import _ from 'lodash/fp';
import prependHTTP from 'prepend-http';
import stripAnsi from 'strip-ansi';
import {inspect as utilInspect} from 'util';

/**
 * Tagged template function to return an inspected value preceeded by a string
 * and colon
 * @param {string[]} strings - String(s) prefix
 * @param {*} value - First expression
 */
export const inspect = (strings, value) =>
  `${strings[0].trim().replace(/:$/, '')}: ${utilInspect(value)}`;

/**
 * Returns a `https` URL if given a bare host or `http` URL.
 * @param {string} - Host or URL
 * @returns {string} HTTPS URL
 */
export const makeHTTPSURL = _.partialRight(prependHTTP, [{https: true}]);

/**
 * Trims a string if it's a string; otherwise returns `undefined`.
 * A specific definition of "normalize."
 * @param {*} value - String to trim, or nothing
 * @returns {string|void}
 */
export const normalizeString = v =>
  _.isString(v) && !_.isEmpty(v) ? _.trim(v) : void 0;

/**
 * Normalizes strings within an Array or comma-separated string representing
 * Array. Discards empty strings, `null`, or `undefined` values.
 * A specific definition of "normalize."
 * @param {string|Array<*>} v - Value to normalize
 * @returns {string[]|void} Array, undefined if empty
 */
export const normalizeArray = _.pipe(
  v => _.map(normalizeString, _.isString(v) ? _.trim(v).split(',') : v),
  _.reject(_.anyPass([_.isNull, _.isUndefined, _.equals('')])),
  v => (_.isEmpty(v) ? void 0 : v)
);

/**
 * Given specifically-formatted date and time strings, return a `Date`
 * @param {string} [date] - Date in YYYY-MM-DD format.  If omitted, will return `undefined`
 * @param {string} [time] - Time in 00:00:00.000 format.  If omitted, time will be 00:00:00.000
 * @returns {Date?} Parsed date
 */
export const parseDate = (date, time) => {
  if (date) {
    return time
      ? new Date(`${date}T${time}Z`)
      : new Date(`${date}T00:00:00.000Z`);
  }
};

/**
 * Wraps {@link Joi.attempt}
 * @param {Schema} schema - Joi schema
 * @param {*} value - Value to validate against schema
 * @throws {ValidationError}
 */
export const validateParam = (schema, value) => {
  try {
    return attempt(value, schema);
  } catch (err) {
    err.message = stripAnsi(err.message);
    throw err;
  }
};

export const normalizeJson = v => {
  if (v) {
    if (typeof v === 'string') {
      try {
        JSON.parse(v);
        return v;
      } catch (ignored) {}
    }
    try {
      return JSON.stringify(v);
    } catch (ignored) {}
  }
};
