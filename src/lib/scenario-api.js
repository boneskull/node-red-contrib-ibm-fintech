import {CloudAPI} from './cloud-api';
import _ from 'lodash/fp';
import {create as createClient} from 'axios';
import {makeHTTPSURL} from './utils';
import {resolve} from 'url';

/**
 * Credentials in VCAP_SERVICES format
 *
 * @typedef {Object} ScenarioAPICredentials
 * @property {string} uri - Service URL
 * @property {string} accessToken - Access token
 */

/**
 * Abstract base class for Predictive Market Scenario and Simulated Instrument
 * Analytics services, which act have the same base URL and authentication.
 *
 * @abstract
 * @export
 * @class ScenarioAPI
 * @extends {CloudAPI}
 */
export class ScenarioAPI extends CloudAPI {
  /**
   * It:
   * - Checks for missing credentials
   * - Sets default options
   * - Creates Axios client
   *
   * @param {ScenarioAPICredentials} [credentials={}] - Credentials; if not present,
   * will be pulled from VCAP_SERVICES
   * @param {Object} [options={}] - Extra options
   * @param {string} [options.apiVersion="v1"] - API version
   * @memberof ScenarioAPI
   */
  constructor(credentials = {}, options = {}) {
    super(credentials);

    if (!(this.credentials.uri && this.credentials.accessToken)) {
      throw new Error('invalid/missing credentials');
    }

    this.options = _.defaults({apiVersion: this.defaultApiVersion}, options);

    this.client = createClient({
      baseURL: this.url,
      headers: {
        'X-IBM-Access-Token': this.credentials.accessToken
      }
    });
  }

  /**
   * Returns service name per `VCAP_SERVICES`; subclasses must implement
   *
   * @abstract
   * @readonly
   * @returns {string} Service name
   * @memberof ScenarioAPI
   */
  get serviceName() {
    throw new Error('not implemented');
  }

  /**
   * Returns base service URL
   *
   * @readonly
   * @memberof ScenarioAPI
   */
  get url() {
    const baseURL = makeHTTPSURL(this.credentials.uri);
    return resolve(baseURL, `/api/${this.apiVersion}/scenario`);
  }

  /**
   * Returns API version
   *
   * @readonly
   * @memberof ScenarioAPI
   */
  get apiVersion() {
    return this.options.apiVersion;
  }

  /**
   * Returns default API version
   *
   * @abstract
   * @readonly
   * @returns {string} API version string
   * @memberof ScenarioAPI
   */
  get defaultApiVersion() {
    throw new Error('not implemented');
  }
}
