import {inspect, normalizeString} from '../lib/utils';

import _ from 'lodash/fp';

/**
 * Creates the {@link GenerateScenarioNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  /**
   * @class GenerateScenarioNode
   */
  class GenerateScenarioNode {
    /**
     * Creates an instance of GenerateScenarioNode
     * @param {any} [config={}] - Node config; see .html file
     * @memberof GenerateScenarioNode
     */
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.config = {
        factor: normalizeString(config.factor),
        shock: parseFloat(config.shock)
      };
      const predictiveMarketScenarioService = RED.nodes.getNode(
        config.predictiveMarketScenarioService
      );

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.debug(inspect`Message received: ${msg}`);
        if (predictiveMarketScenarioService) {
          try {
            let shape = 'ring';
            const progress = setInterval(() => {
              this.status({fill: 'yellow', shape, text: 'working...'});
              shape = shape === 'ring' ? 'dot' : 'ring';
            }, 500);
            let result = {};
            const config = _.defaults(this.config, msg.payload);
            try {
              result = await predictiveMarketScenarioService.generate(config);
            } finally {
              clearInterval(progress);
              this.status({});
            }
            this.send({
              ...msg,
              ...result
            });
          } catch (err) {
            this.error(err, msg);
          }
        } else {
          this.warn(
            inspect`Message received, but no service configured: ${msg}`
          );
          // stop flow?
        }
      });
    }
  }

  RED.nodes.registerType('generate-scenario', GenerateScenarioNode);
}
