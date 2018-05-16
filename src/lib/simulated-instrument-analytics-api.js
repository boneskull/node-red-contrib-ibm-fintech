import {Buffer} from 'safe-buffer';
import FormData from 'form-data';
import {ScenarioAPI} from './scenario-api';
import _ from 'lodash/fp';
import axiosDebugLog from 'axios-debug-log';
import d from 'debug';

const debug = d('ibm-fintech:simulated-instrument-analytics');

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

    this.client.defaults.headers.post = {
      enctype: 'string'
    };

    axiosDebugLog.addLogger(this.client, debug);
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
   * @param {Object} options - Options
   * @param {string} options.id - Instrument ID
   * @param {string|Buffer} options.scenario - CSV model
   * @returns
   * @memberof SimulatedInstrumentAnalyticsAPI
   */
  async instrument(options = {}) {
    // TODO validate input
    const {id, scenario} = options;
    const formData = SimulatedInstrumentAnalyticsAPI.createFormData(scenario);
    try {
      const {data} = await this.client.post(`/instrument/${id}`, formData, {
        headers: formData.getHeaders()
      });
      return {analytics: data};
    } catch (err) {
      switch (_.get('response.status', err)) {
        case 404:
          throw new Error(`Instrument with ID "${id}" not found!`);
      }
      throw err;
    }
  }

  /**
   * Instruments many
   * @param {Object} options - Options
   * @param {string[]} options.ids - List of instrument IDs
   * @param {string|Buffer} options.scenario - CSV model
   * @returns
   * @memberof SimulatedInstrumentAnalyticsAPI
   */
  async instrumentMany(options = {}) {
    const {ids, scenario} = options;
    const formData = SimulatedInstrumentAnalyticsAPI.createFormData(
      scenario,
      ids
    );
    const {data} = await this.client.post('/instruments', formData, {
      headers: formData.getHeaders()
    });
    return {analytics: data};
  }

  get defaultApiVersion() {
    return 'v1';
  }

  /**
   * Create a `FormData` object for sending to API
   * @param {string|Buffer} scenario - CSV-formatted scenario file as string
   * @param {string[]} [instrumentIds] - Instrument IDs, if multiple
   * @returns {FormData}
   */
  static createFormData(scenario, instrumentIds) {
    const data = new FormData();
    data.append('scenario_file', Buffer.from(scenario), {
      filename: 'scenario.csv',
      contentType: 'text/csv'
    });
    if (instrumentIds) {
      data.append('instruments', instrumentIds.join(','));
    }
    return data;
  }
}
