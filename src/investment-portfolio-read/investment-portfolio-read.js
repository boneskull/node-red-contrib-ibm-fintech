/// <reference types="node-red" />

const parseDate = (date, time) => {
  if (date) {
    if (time) {
      return new Date(`${date}T${time}Z`);
    }
    return new Date(`${date}T00:00:00.000Z`);
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
        portfolioName: config.portfolioName,
        atDate: parseDate(config.date, config.time),
        hasKey: config.hasKey,
        hasAnyKey: config.hasAnyKey,
        hasNoKey: config.hasNoKey,
        hasKeyValue: {
          [config.hasKeyValueKey]: config.hasKeyValueValue
        },
        sort: config.sort,
        limit: config.limit,
        selector: config.selector
      };

      this.service = RED.nodes.getNode(config.service);
      this.trace(`Config: ${JSON.stringify(config)}`);

      this.on('input', async msg => {
        if (this.service) {
          try {
            const portfolios = await this.service.read(this.config);
            this.debug(`Received portfolios: ${JSON.stringify(portfolios)}`);
            this.send({
              ...msg,
              payload: portfolios.shift()
            });
          } catch (err) {
            this.error(err, msg);
          }
        } else {
          this.warn(
            `Message received, but no service configured: ${JSON.stringify(
              msg
            )}`
          );
        }
      });
    }
  }

  RED.nodes.registerType(
    'investment-portfolio-read',
    InvestmentPortfolioReadNode
  );
}
