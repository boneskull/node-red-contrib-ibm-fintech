import {
  inspect,
  normalizeArray,
  normalizeString,
  parseDate
} from '../lib/utils';

import _ from 'lodash/fp';

/**
 * Creates the {@link PredictNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  /**
 
   * @class PredictNode
   */
  class PredictNode {
    /**
     * Creates an instance of InvestmentPortfolioReadNode.
     * @param {any} [config={}] - Node config; see .html file
     * @memberof InvestmentPortfolioReadNode
     */
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.config = {
        factor: normalizeString(config.factor),
        shock: parseFloat(config.shock),
        portfolioName: normalizeString(config.portfolioName),
        latest: Boolean(config.latest),
        hasKey: normalizeArray(config.hasKey),
        atDate: parseDate(config.date, config.time)
      };

      this.portfolioService = RED.nodes.getNode(config.portfolioService);
      this.scenarioService = RED.nodes.getNode(config.scenarioService);

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.debug(inspect`Message received: ${msg}`);
        if (this.portfolioService && this.scenarioService) {
          try {
            config = _.defaults(_.isObject(msg.payload) ? msg.payload : {}, {
              factor: msg.topic,
              ...this.config
            });
            this.debug(inspect`Computed config: ${config}`);
            const [{holdings}, csv] = await Promise.all([
              this.portfolioService.getHoldings({
                portfolioName: this.config.portfolioName,
                latest: this.config.latest,
                hasKey: this.config.hasKey,
                atDate: this.config.atDate
              }),
              this.scenarioService.generate({
                factor: this.config.factor,
                shock: this.config.shock
              })
            ]);

            this.send({
              ...msg,
              payload: {
                holdings,
                csv
              }
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

  RED.nodes.registerType('predict', PredictNode);
}
