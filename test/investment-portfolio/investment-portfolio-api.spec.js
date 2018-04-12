import {InvestmentPortfolioAPI} from '../../src/lib/investment-portfolio-api';

describe('Investment Portfolio', function() {
  describe('API', function() {
    describe('constructor', function() {});

    describe('method', function() {
      let api;

      beforeEach(function() {
        api = new InvestmentPortfolioAPI({
          reader: {
            userid: process.env.INVESTMENT_PORTFOLIO_READER_USERID,
            password: process.env.INVESTMENT_PORTFOLIO_READER_PASSWORD
          },
          writer: {
            userid: process.env.INVESTMENT_PORTFOLIO_WRITER_USERID,
            password: process.env.INVESTMENT_PORTFOLIO_WRITER_PASSWORD
          },
          url: process.env.INVESTMENT_PORTFOLIO_URL
        });
      });

      it('should do something', async function() {
        // const res = await api.listPortfolios();
        // console.log(res.data);
      });
    });
  });
});
