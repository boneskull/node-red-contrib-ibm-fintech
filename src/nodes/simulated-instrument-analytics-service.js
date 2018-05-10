import {SimulatedInstrumentAnalyticsAPI} from '../lib/simulated-instrument-analytics-api';
import {inspect} from '../lib/utils';

export default function(RED) {
  class SimulatedInstrumentAnalyticsServiceNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);
      this.api = new SimulatedInstrumentAnalyticsAPI({
        accessToken: this.credentials.token,
        uri: config.host
      });

      this.trace(inspect`Config: ${config}`);
    }

    async instrumentMany(options = {}) {
      return this.api.instrumentMany(options);
    }
  }

  RED.nodes.registerType(
    'simulated-instrument-analytics',
    SimulatedInstrumentAnalyticsServiceNode,
    {
      credentials: {
        token: {
          type: 'password'
        }
      }
    }
  );
}
