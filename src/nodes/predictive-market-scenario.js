import {PredictiveMarketScenarioAPI} from '../lib/predictive-market-scenario-api';
import {inspect} from '../lib/utils';

export default function(RED) {
  class PredictiveMarketScenarioServiceNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.api = new PredictiveMarketScenarioAPI({
        token: this.credentials.token,
        url: config.host
      });

      this.trace(inspect`Config: ${config}`);
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
}
