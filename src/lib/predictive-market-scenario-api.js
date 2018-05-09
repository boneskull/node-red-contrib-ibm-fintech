import * as schemas from './predictive-market-scenario-schema';

import {ScenarioAPI} from './scenario-api';
import {attempt} from 'joi';
import d from 'debug';

const debug = d('ibm-fintech:predictive-market-scenario');

/**
 * Provides wrapper around Predictive Market Scenario API
 *
 * @export
 * @class PredictiveMarketScenarioAPI
 * @extends {ScenarioAPI}
 */
export class PredictiveMarketScenarioAPI extends ScenarioAPI {
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
    options = attempt(options, schemas.GENERATE_SCHEMA);
    const {factor, shock} = options;
    const data = {market_change: {risk_factor: factor, shock}};
    debug(`POST /generate_predictive`, data);
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
