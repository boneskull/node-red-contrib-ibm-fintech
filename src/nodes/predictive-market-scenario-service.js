import {PredictiveMarketScenarioAPI} from '../lib/predictive-market-scenario-api';
import _ from 'lodash/fp';
import factors from '../lib/factors.json';
import {inspect} from '../lib/utils';

export default function(RED) {
  class PredictiveMarketScenarioServiceNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);
      this.api = new PredictiveMarketScenarioAPI({
        accessToken: this.credentials.token,
        uri: config.host
      });

      this.trace(inspect`Config: ${config}`);
    }

    async generate(options = {}) {
      return this.api.generate(options);
    }
  }

  RED.nodes.registerType(
    'predictive-market-scenario',
    PredictiveMarketScenarioServiceNode,
    {
      credentials: {
        token: {
          type: 'password'
        }
      }
    }
  );

  RED.httpAdmin.get('/predictive-market-scenario/factors', (req, res) => {
    res.json(_.sortBy('name', factors));
  });
}
