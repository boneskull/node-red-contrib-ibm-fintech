import {InvestmentPortfolioAPI} from '../lib/investment-portfolio-api';
import {inspect} from '../lib/utils';

export default function(RED) {
  class InvestmentPortfolioServiceNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.api = new InvestmentPortfolioAPI({
        reader: {
          userid: this.credentials.readerUsername,
          password: this.credentials.readerPassword
        },
        writer: {
          userid: this.credentials.writerUsername,
          password: this.credentials.writerPassword
        },
        url: config.host
      });

      this.trace(inspect`Config: ${config}`);
    }

    async findPortfolios(options = {}) {
      this.debug(inspect`Reading with options: ${options}`);
      return this.api.findPortfolios(options);
    }

    async getHoldings(options = {}) {
      this.debug(inspect`Getting holdings with options ${options}`);
      return this.api.getHoldings(options);
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
