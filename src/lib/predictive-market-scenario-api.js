import {ScenarioAPI} from './scenario-api';

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
   * @param {string} riskId - ID of the risk factor
   * @param {number} shock - Ratio of the new to old values of the risk factor
   * @returns {Promise<{{scenario: string}}>}
   * @memberof PredictiveMarketScenarioAPI
   */
  async generate(riskId, shock) {
    const res = await this.client.post('/generate_predictive', {
      data: {
        risk_factor: riskId,
        shock
      },
      headers: {accept: 'text/csv'}
    });
    return {scenario: res.data};
  }

  get defaultApiVersion() {
    return 'v1';
  }
}
