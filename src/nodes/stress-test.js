import {
  inspect,
  normalizeArray,
  normalizeString,
  parseDate
} from '../lib/utils';

import {Stresser} from '../lib/stresser';
import _ from 'lodash/fp';

/**
 * Creates the {@link StressTestNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  /**
 
   * @class StressTestNode
   */
  class StressTestNode {
    /**
     * Creates an instance of StressTestNode
     * @param {any} [config={}] - Node config; see .html file
     * @memberof StressTestNode
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

      const investmentPortfolioService = RED.nodes.getNode(
        config.investmentPortfolioService
      );
      const predictiveMarketScenarioService = RED.nodes.getNode(
        config.predictiveMarketScenarioService
      );
      const simulatedInstrumentAnalyticsService = RED.nodes.getNode(
        config.simulatedInstrumentAnalyticsService
      );

      if (
        investmentPortfolioService &&
        predictiveMarketScenarioService &&
        simulatedInstrumentAnalyticsService
      ) {
        this.stressTest = Stresser({
          investmentPortfolioService,
          predictiveMarketScenarioService,
          simulatedInstrumentAnalyticsService
        });
      }

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.debug(inspect`Message received: ${msg}`);
        if (this.stressTest) {
          try {
            const config = _.defaults(
              _.isObject(msg.payload) ? msg.payload : {},
              {
                factor: msg.topic,
                ...this.config
              }
            );
            this.debug(inspect`Computed config: ${config}`);
            let shape = 'ring';
            const progress = setInterval(() => {
              this.status({fill: 'yellow', shape, text: 'working...'});
              shape = shape === 'ring' ? 'dot' : 'ring';
            }, 500);
            let payload;
            try {
              payload = await this.stressTest(config);
            } finally {
              clearInterval(progress);
              this.status({});
            }
            this.send({
              ...msg,
              payload
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

  RED.nodes.registerType('stress-test', StressTestNode);
}
