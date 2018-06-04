import {SimulatedInstrumentAnalyticsAPI} from '../lib/simulated-instrument-analytics-api';
import _ from 'lodash/fp';
import {inspect} from '../lib/utils';
import analytics from '../lib/analytics.json';

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

  RED.httpAdmin.get('/simulated-instrument-analytics/analytics', (req, res) => {
    res.json(_.sortBy('name', analytics));
  });
}
