import * as schemas from './predictive-market-scenario-schema';

import {ScenarioAPI} from './scenario-api';
import axiosDebugLog from 'axios-debug-log';
import d from 'debug';
import {validateParam} from './utils';

const debug = d('ibm-fintech:predictive-market-scenario');

/**
 * Provides wrapper around Predictive Market Scenario API
 *
 * @export
 * @class PredictiveMarketScenarioAPI
 * @extends {ScenarioAPI}
 */
export class PredictiveMarketScenarioAPI extends ScenarioAPI {
  constructor(...args) {
    super(...args);

    axiosDebugLog.addLogger(this.client, debug);
  }
  /**
   * Returns service name per `VCAP_SERVICES`
   *
   * @readonly
   * @memberof PredictiveMarketScenarioAPI
   */
  get serviceName() {
    return 'fss-predictive-scenario-analytics-service';
  }

  /**
   * Generate a scenario
   *
   * @param {Object} options - Options
   * @param {string} options.factor - ID of the risk factor
   * @param {number} [options.shock=5] - % ratio of the new to old values of the risk factor
   * @returns {Promise<{{scenario: string}}>}
   * @memberof PredictiveMarketScenarioAPI
   */
  async generate(options = {}) {
    options = validateParam(schemas.GENERATE_SCHEMA, options);
    const {factor, shock} = options;
    const data = {market_change: {risk_factor: factor, shock}};
    const res = await this.client.post('/generate_predictive', data, {
      headers: {
        accept: 'text/csv',
        'X-IBM-Access-Token': this.credentials.accessToken
      }
    });
    return {scenario: res.data};
  }

  get defaultApiVersion() {
    return 'v1';
  }
}
