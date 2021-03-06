import {
  inspect,
  normalizeArray,
  normalizeString,
  parseDate
} from '../lib/utils';

import _ from 'lodash/fp';

/**
 * Returns config-relevant props from a Message's payload
 * @param {Object} payload - Payload
 * @returns {Object} relevant props
 */
const getConfigFromPayload = _.pick([
  'portfolioName',
  'latest',
  'hasKey',
  'atDate'
]);

/**
 * Creates the {@link HoldingsReadNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  /**
   * A Node to read Portfolio information
   * @class HoldingsReadNode
   */
  class HoldingsReadNode {
    /**
     * Creates an instance of HoldingsReadNode.
     * @param {any} [config={}] - Node config; see .html file
     * @memberof HoldingsReadNode
     */
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.config = _.defaults(
        {latest: 'false'},
        {
          portfolioName: normalizeString(config.portfolioName),
          latest: config.latest,
          hasKey: normalizeArray(config.hasKey),
          atDate: parseDate(config.date, config.time)
        }
      );

      this.service = RED.nodes.getNode(config.service);

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.trace(inspect`Message received: ${msg}`);
        if (this.service) {
          try {
            config = _.defaults(this.config, getConfigFromPayload(msg.payload));
            this.trace(inspect`Computed config: ${config}`);
            const {holdings} = await this.service.getHoldings(config);
            this.trace(inspect`Received holdings: ${holdings}`);
            this.send({
              ...msg,
              payload: {...msg.payload, holdings}
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

  RED.nodes.registerType('holdings-read', HoldingsReadNode);
}
