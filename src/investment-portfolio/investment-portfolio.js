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
      return this.api.listPortfolios();
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
