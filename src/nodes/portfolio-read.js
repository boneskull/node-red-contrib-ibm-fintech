import {
  inspect,
  normalizeArray,
  normalizeString,
  parseDate,
  normalizeJson
} from '../lib/utils';

import _ from 'lodash/fp';

/**
 * Returns config-relevant props from a Message payload
 * @param {Object} payload - Payload
 * @returns {Object} relevant props
 */
const getConfigFromPayload = _.pick([
  'portfolioName',
  'hasKey',
  'hasNoKey',
  'hasAnyKey',
  'hasKeyValue',
  'selector',
  'sort',
  'limit',
  'atDate'
]);

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
        selector: normalizeJson(config.selector),
        sort: config.sort,
        limit: config.limit,
        atDate: parseDate(config.date, config.time)
      };

      this.service = RED.nodes.getNode(config.service);

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.trace(inspect`Message received: ${msg}`);
        if (this.service) {
          try {
            config = _.defaults(this.config, getConfigFromPayload(msg.payload));
            // special case: the user might provide a JSON that has a single
            // property, "selector".  it's considered optional.
            config.selector = _.getOr(
              config.selector,
              'selector.selector',
              config
            );
            this.trace(inspect`Computed config: ${config}`);
            const {portfolios} = await this.service.findPortfolios(this.config);
            this.trace(inspect`Received ${portfolios.length} portfolios`);
            this.send({
              ...msg,
              payload: {...msg.payload, portfolios}
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
