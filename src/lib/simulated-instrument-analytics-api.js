import {ScenarioAPI} from './scenario-api';
import _ from 'lodash/fp';
import {createReadStream} from 'fs';

/**
 * Provides wrapper around Simulated Instrument Analytics API
 *
 * @export
 * @class SimulatedInstrumentAnalyticsAPI
 * @extends {ScenarioAPI}
 */
export class SimulatedInstrumentAnalyticsAPI extends ScenarioAPI {
  /**
   * Creates an instance of SimulatedInstrumentAnalyticsAPI.
   * @param {any} [credentials={}]
   * @param {any} [options={}]
   * @memberof SimulatedInstrumentAnalyticsAPI
   */
  constructor(credentials = {}, options = {}) {
    super(credentials, options);

    this.client.defaults.headers.common = {
      ...this.client.defaults.headers.common,
      enctype: 'string',
      'content-type': 'multipart/form-data'
    };
  }

  /**
   * Returns service name per `VCAP_SERVICES`
   *
   * @readonly
   * @memberof SimulatedInstrumentAnalyticsAPI
   */
  get serviceName() {
    return 'fss-scenario-analytics-service';
  }

  /**
   * Instruments
   *
   * @param {string} id
   * @param {any} model
   * @returns
   * @memberof SimulatedInstrumentAnalyticsAPI
   */
  async instrument(id, model) {
    try {
      const res = await this.client.post(`/instrument/${id}`, {
        data: {
          scenario_file: createReadStream(model)
        }
      });
      return {analytics: res.data};
    } catch (err) {
      switch (_.get('response.status', err)) {
        case 404:
          throw new Error(`Instrument with ID "${id}" not found!`);
      }
      throw err;
    }
  }

  /**
   * @todo implement
   *
   * @memberof SimulatedInstrumentAnalyticsAPI
   */
  async instrumentMany() {
    throw new Error('todo');
  }

  get defaultApiVersion() {
    return 'v1';
  }
}
