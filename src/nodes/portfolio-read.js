import {inspect, normalizeArray, normalizeString} from '../lib/utils';

import _ from 'lodash/fp';

const parseDate = (date, time) => {
  if (date) {
    return time
      ? new Date(`${date}T${time}Z`)
      : new Date(`${date}T00:00:00.000Z`);
  }
};

/**
 * Creates the {@link InvestmentPortfolioReadNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  /**
   * A Node to read Portfolio information
   * @class InvestmentPortfolioReadNode
   */
  class InvestmentPortfolioReadNode {
    /**
     * Creates an instance of InvestmentPortfolioReadNode.
     * @param {any} [config={}] - Node config; see .html file
     * @memberof InvestmentPortfolioReadNode
     */
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.config = {
        portfolioName: normalizeString(config.portfolioName),
        hasKey: normalizeArray(config.hasKey),
        hasNoKey: normalizeArray(config.hasNoKey),
        hasAnyKey: normalizeArray(config.hasAnyKey),
        hasKeyValue: normalizeString(config.hasKeyValue),
        selector: normalizeString(config.selector),
        sort: config.sort,
        limit: config.limit,
        atDate: parseDate(config.date, config.time)
      };

      this.service = RED.nodes.getNode(config.service);

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.debug(inspect`Message received: ${msg}`);
        if (this.service) {
          try {
            let payload = _.isObject(msg.payload) ? msg.payload : {};
            config = _.defaults(payload, {
              portfolioName: msg.topic,
              ...this.config
            });
            // special case: the user might provide a JSON that has a single
            // property, "selector".  it's considered optional.
            config.selector = _.getOr(
              config.selector,
              'selector.selector',
              config
            );
            this.debug(inspect`Computed config: ${config}`);
            const {portfolios} = await this.service.read(this.config);
            this.debug(inspect`Received portfolios: ${portfolios}`);
            this.send({
              ...msg,
              payload: portfolios.shift()
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

  RED.nodes.registerType('portfolio-read', InvestmentPortfolioReadNode);
}
