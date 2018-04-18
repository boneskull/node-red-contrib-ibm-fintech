import _ from 'lodash/fp';

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

      this.config = _.pick(
        ['portfolioName', 'hasKey', 'hasAnyKey', 'hasNoKey', 'sort', 'limit'],
        config
      );
      this.config.atDate = parseDate(config.date, config.time);
      this.config.hasKeyValue = normalizeString(config.hasKeyValue);
      this.config.selector = normalizeString(config.selector);

      this.service = RED.nodes.getNode(config.service);

      this.trace(`Original config: ${JSON.stringify(config)}`);
      this.trace(`Processed config: ${JSON.stringify(this.config)}`);

      this.on('input', async msg => {
        this.trace(`Message received: ${JSON.stringify(msg)}`);
        if (this.service) {
          try {
            let payload = _.isObject(msg.payload) ? msg.payload : {};
            config = _.defaults(payload, {
              portfolioName: msg.topic,
              ...this.config
            });
            config.selector = _.getOr(
              'selector.selector',
              config.selector,
              config
            );
            this.debug(`Computed config: ${JSON.stringify(config)}`);
            const {portfolios} = await this.service.read(this.config);
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
          // stop flow?
        }
      });
    }
  }

  RED.nodes.registerType(
    'investment-portfolio-read',
    InvestmentPortfolioReadNode
  );
}
