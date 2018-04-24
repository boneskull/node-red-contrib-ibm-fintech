import _ from 'lodash/fp';
import prependHTTP from 'prepend-http';
import {inspect as utilInspect} from 'util';

/**
 * Tagged template function to return an inspected value preceeded by a string and colon
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
 * @param {*} value - String to trim, or nothing
 * @returns {string|void}
 */
export const normalizeString = v =>
  _.isString(v) && !_.isEmpty(v) ? _.trim(v) : void 0;

/**
 * Normalizes strings within an Array or comma-separated string representing Array.
 * Discards empty strings, `null`, or `undefined` values.
 * @param {string|Array<*>} v - Value to normalize
 * @returns {string[]} Array, may be empty
 */
export const normalizeArray = _.pipe(
  v =>
    _.map(normalizeString, _.isString(v) ? normalizeString(v).split(',') : v),
  _.reject(_.anyPass([_.isNull, _.isUndefined, _.equals('')]))
);
