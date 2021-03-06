import {PredictiveMarketScenarioAPI} from '../../src/lib/predictive-market-scenario-api';
import vcap from 'vcap_services';

describe('Predictive Market Scenario', function() {
  let sbx;

  beforeEach(function() {
    sbx = sinon.createSandbox();
  });

  afterEach(function() {
    sbx.restore();
  });

  describe('API', function() {
    let credentials;

    beforeEach(function() {
      credentials = {
        accessToken: 'kajshfsdfjk',
        uri: 'foo.bar'
      };
    });

    describe('constructor', function() {
      it('should store supplied credentials', function() {
        expect(new PredictiveMarketScenarioAPI(credentials), 'to satisfy', {
          credentials
        });
      });

      describe('when missing credentials', function() {
        it('should pull credentials from VCAP if available', function() {
          sbx.stub(vcap, 'getCredentials').returns(credentials);
          expect(new PredictiveMarketScenarioAPI(), 'to satisfy', {
            credentials
          });
        });

        it('should throw', function() {
          expect(
            () => new PredictiveMarketScenarioAPI(),
            'to throw',
            'invalid/missing credentials'
          );
        });
      });

      it('should store default API version ', function() {
        const api = new PredictiveMarketScenarioAPI(credentials);
        expect(api, 'to satisfy', {
          options: {
            apiVersion: api.defaultApiVersion
          }
        });
      });

      it('should store extra options', function() {
        expect(
          new PredictiveMarketScenarioAPI(credentials, {foo: 'bar'}),
          'to satisfy',
          {
            options: {foo: 'bar'}
          }
        );
      });

      it('should create a client', function() {
        const api = new PredictiveMarketScenarioAPI(credentials);
        expect(api.client.defaults, 'to satisfy', {
          baseURL: api.url,
          headers: {
            'X-IBM-Access-Token': credentials.accessToken
          }
        });
      });
    });

    describe('method', function() {
      let api;

      beforeEach(function() {
        api = new PredictiveMarketScenarioAPI(credentials);
        sbx
          .stub(api.client, 'post')
          .returns(Promise.resolve({scenario: 'some,csv'}));
      });

      describe('generate()', function() {
        it('should POST `/generate_predictive` path', async function() {
          const factor = 'CX_COS_ME_Gold_XCEC';
          const shock = 2;
          await api.generate({factor, shock});
          expect(api.client.post, 'to have a call exhaustively satisfying', [
            `/generate_predictive`,
            {
              market_change: {risk_factor: factor, shock: (shock + 100) / 100}
            },
            {
              headers: {
                accept: 'text/csv',
                'X-IBM-Access-Token': credentials.accessToken
              }
            }
          ]);
        });

        it('should reject if invalid riskId');
        it('should reject if invalid shock');
      });
    });
  });
});
