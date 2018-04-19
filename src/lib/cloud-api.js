import _ from 'lodash/fp';
import {getCredentials} from 'vcap_services';

/**
 * An API that can pull its credentials from Cloud Foundry's `VCAP_SERVICES` env var
 */
export class CloudAPI {
  constructor(credentials = {}) {
    const vcapCredentials = getCredentials(this.serviceName);
    this.credentials = _.defaultsDeep(vcapCredentials, credentials);
  }

  get serviceName() {
    throw new Error('not implemented');
  }
}
