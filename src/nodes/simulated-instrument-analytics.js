import {inspect, normalizeString} from '../lib/utils';

import _ from 'lodash/fp';

/**
 * Creates the {@link SimulatedInstrumentAnalyticsNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  /**
   * @class InstrumentAnalyticsNode
   */
  class SimulatedInstrumentAnalyticsNode {
    /**
     * Creates an instance of InstrumentAnalyticsNode
     * @param {any} [config={}] - Node config; see .html file
     * @memberof InstrumentAnalyticsNode
     */
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.config = {
        factor: normalizeString(config.factor),
        shock: parseFloat(config.shock)
      };
      const simulatedInstrumentAnalyticsService = RED.nodes.getNode(
        config.simulatedInstrumentAnalyticsService
      );

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.debug(inspect`Message received: ${msg}`);
        if (simulatedInstrumentAnalyticsService) {
          try {
            let shape = 'ring';
            const progress = setInterval(() => {
              this.status({fill: 'yellow', shape, text: 'working...'});
              shape = shape === 'ring' ? 'dot' : 'ring';
            }, 500);
            let result = {};
            const config = _.defaults(this.config, msg.payload);
            try {
              result = await simulatedInstrumentAnalyticsService.instrumentMany(
                config
              );
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

  RED.nodes.registerType(
    'simulated-instrument-analytics',
    SimulatedInstrumentAnalyticsNode
  );
}
