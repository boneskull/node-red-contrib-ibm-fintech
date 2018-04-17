import {
  DEFAULT_API_VERSION,
  InvestmentPortfolioAPI
} from '../../src/lib/investment-portfolio-api';

import vcap from 'vcap_services';

describe('Investment Portfolio', function() {
  let sbx;

  beforeEach(function() {
    sbx = sinon.sandbox.create();
  });

  afterEach(function() {
    sbx.restore();
  });

  describe('API', function() {
    let credentials;

    beforeEach(function() {
      credentials = {
        reader: {
          userid: 'ruserid',
          password: 'rpassword'
        },
        writer: {
          userid: 'wuserid',
          password: 'wpassword'
        },
        url: 'foo.bar'
      };
    });

    describe('constructor', function() {
      it('should store supplied credentials', function() {
        expect(new InvestmentPortfolioAPI(credentials), 'to satisfy', {
          credentials
        });
      });

      describe('when missing credentials', function() {
        it('should pull credentials from VCAP if available', function() {
          sbx.stub(vcap, 'getCredentials').returns(credentials);
          expect(new InvestmentPortfolioAPI(), 'to satisfy', {
            credentials
          });
        });

        it('should throw', function() {
          expect(
            () => new InvestmentPortfolioAPI(),
            'to throw',
            'invalid/missing credentials'
          );
        });
      });

      it('should store default API version ', function() {
        expect(new InvestmentPortfolioAPI(credentials), 'to satisfy', {
          options: {
            apiVersion: DEFAULT_API_VERSION
          }
        });
      });

      it('should store extra options', function() {
        expect(
          new InvestmentPortfolioAPI(credentials, {foo: 'bar'}),
          'to satisfy',
          {
            options: {foo: 'bar'}
          }
        );
      });

      it('should create a "reader" client', function() {
        const api = new InvestmentPortfolioAPI(credentials);
        expect(api.readerClient.defaults, 'to satisfy', {
          baseURL: api.url,
          auth: {
            username: credentials.reader.userid,
            password: credentials.reader.password
          }
        });
      });

      it('should create a "writer" client', function() {
        const api = new InvestmentPortfolioAPI(credentials);
        expect(api.writerClient.defaults, 'to satisfy', {
          baseURL: api.url,
          auth: {
            username: credentials.writer.userid,
            password: credentials.writer.password
          }
        });
      });
    });

    describe('property', function() {
      let api;

      beforeEach(function() {
        api = new InvestmentPortfolioAPI(credentials);
      });

      describe('apiVersion', function() {
        it('should return `apiVersion` from `options`', function() {
          expect(api.apiVersion, 'to be', api.options.apiVersion);
        });
      });

      describe('url', function() {
        it('should create a base HTTPS url from `url` prop of `credentials`', function() {
          expect(
            api.url,
            'to be',
            `https://${api.credentials.url}/api/${api.apiVersion}`
          );
        });
      });
    });

    describe('method', function() {
      let api;

      beforeEach(function() {
        api = new InvestmentPortfolioAPI(credentials);
        sbx.stub(api.readerClient, 'get').returns(Promise.resolve());
        sbx.stub(api.writerClient, 'post').returns(Promise.resolve());
        sbx.stub(api.writerClient, 'delete').returns(Promise.resolve());
      });

      describe('listPortfolios()', function() {
        it('should GET `/portfolios` path', async function() {
          await api.listPortfolios();
          expect(
            api.readerClient.get,
            'to have a call exhaustively satisfying',
            ['/portfolios']
          );
        });
      });

      describe('createPortfolio()', function() {
        it('should POST `/portfolios` path', async function() {
          const data = {
            name: 'foo',
            timestamp: new Date()
          };
          await api.createPortfolio(data);
          expect(
            api.writerClient.post,
            'to have a call exhaustively satisfying',
            ['/portfolios', {data: {...data, closed: false}}]
          );
        });

        it('should validate `data`', async function() {
          await expect(
            api.createPortfolio({timestamp: new Date()}),
            'to be rejected with',
            /"name" is required/
          );
        });
      });

      describe('deletePortfolio()', function() {
        it('should DELETE `/portfolios` path', async function() {
          const data = {name: 'foo', timestamp: new Date()};
          await api.deletePortfolio(data);
          expect(
            api.writerClient.delete,
            'to have a call exhaustively satisfying',
            [
              `/portfolios/${data.name}/${data.timestamp.toISOString()}`,
              {params: {}}
            ]
          );
        });

        it('should accept a `rev` prop', async function() {
          const data = {name: 'foo', timestamp: new Date(), rev: 0};
          await api.deletePortfolio(data);
          expect(
            api.writerClient.delete,
            'to have a call exhaustively satisfying',
            [
              `/portfolios/${data.name}/${data.timestamp.toISOString()}`,
              {params: {rev: 0}}
            ]
          );
        });
      });
    });
  });
});
