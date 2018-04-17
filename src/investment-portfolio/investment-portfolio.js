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
    }

    async read(options = {}) {
      if (options.portfolioName) {
        return this.api.findPortfolios(options.portfolioName, options);
      }
      return this.api.findAllPortfolios();
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
