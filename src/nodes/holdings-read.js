import _ from 'lodash/fp';
import {inspect} from '../lib/utils';

const parseDate = (date, time) => {
  if (date) {
    return time
      ? new Date(`${date}T${time}Z`)
      : new Date(`${date}T00:00:00.000Z`);
  }
};

const normalizeString = v =>
  _.isString(v) && !_.isEmpty(v) ? _.trim(v) : void 0;

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
          atDate: parseDate(config.date, config.time),
          hasKey: _.map(normalizeString, config.hasKey || [])
        }
      );

      this.service = RED.nodes.getNode(config.service);

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.trace(inspect`Message received: ${msg}`);
        if (this.service) {
          try {
            let payload = _.isObject(msg.payload) ? msg.payload : {};
            config = _.defaults(payload, {
              portfolioName: msg.topic,
              ...this.config
            });
            this.debug(inspect`Computed config: ${config}`);
            const {holdings} = await this.service.read(this.config);
            this.debug(inspect`Received holdings: ${holdings}`);
            this.send({
              ...msg,
              payload: holdings
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
