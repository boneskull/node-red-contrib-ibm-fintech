import {CloudAPI} from './cloud-api';
import _ from 'lodash/fp';
// import {attempt} from 'joi';
import {create as createClient} from 'axios';
import {makeHTTPSURL} from './utils';
// import d from 'debug';
import {resolve} from 'url';

// const debug = d('ibm-fintech:predictive-market-scenario');

export const DEFAULT_API_VERSION = 'v1';

export class SimulatedInstrumentAnalyticsAPI extends CloudAPI {
  constructor(credentials = {}, options = {}) {
    super(credentials);

    if (!(this.credentials.url && this.credentials.token)) {
      throw new Error('invalid/missing credentials');
    }

    this.options = _.defaults({apiVersion: DEFAULT_API_VERSION}, options);

    this.client = createClient({
      baseURL: this.url,
      headers: {
        'X-IBM-Access-Token': this.credentials.token
      }
    });
  }

  get serviceName() {
    return 'fss-scenario-analytics-service';
  }

  get url() {
    const baseURL = makeHTTPSURL(this.credentials.url);
    return resolve(baseURL, `/api/${this.apiVersion}/scenario`);
  }

  get apiVersion() {
    return this.options.apiVersion;
  }
}
