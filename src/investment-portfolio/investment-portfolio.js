import {InvestmentPortfolioAPI} from '../lib/investment-portfolio-api';

export default function(RED) {
  class InvestmentPortfolioServiceNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.api = new InvestmentPortfolioAPI({
        reader: {
          userid: this.credentials.readerUsername,
          password: this.credentials.readerPassword
        },
        writer: {},
        url: config.host
      });

      this.trace(`Config: ${JSON.stringify(config)}`);
    }

    async read(options = {}) {
      this.debug(`Reading with options: ${JSON.stringify(options)}`);
      return this.api.findPortfolios(options);
    }
  }

  RED.nodes.registerType(
    'investment-portfolio',
    InvestmentPortfolioServiceNode,
    {
      credentials: {
        readerUsername: {
          type: 'text'
        },
        readerPassword: {
          type: 'password'
        }
      }
    }
  );
}
