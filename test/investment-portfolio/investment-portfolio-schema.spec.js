import * as schemas from '../../src/lib/investment-portfolio-schema';

import {validate} from 'joi';

describe('Investment Portfolio', function() {
  describe('Schema', function() {
    describe('deletePortfolio', function() {
      it('should not accept extra fields', async function() {
        const portfolio = {
          name: 'Retirement Portfolio',
          timestamp: '2017-02-22T19:53:56.830Z',
          closed: false
        };
        return expect(
          validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
          'to be rejected with',
          /"closed" is not allowed/
        );
      });

      describe('required fields', function() {
        it('should fail if no [name]', async function() {
          const portfolio = {
            timestamp: new Date()
          };

          return expect(
            validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
            'to be rejected with',
            /"name" is required/
          );
        });

        it('should fail if no [timestamp]', async function() {
          const portfolio = {
            name: 'foo'
          };

          return expect(
            validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
            'to be rejected with',
            /"timestamp" is required/
          );
        });
      });

      describe('value conversions', function() {
        it('should convert a [timestamp]', async function() {
          const portfolio = {
            name: 'Retirement Portfolio',
            timestamp: '2017-02-22T19:53:56.830Z'
          };

          return expect(
            validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
            'to be fulfilled with value satisfying',
            {...portfolio, timestamp: new Date(portfolio.timestamp)}
          );
        });
      });

      describe('optional fields', function() {
        it('should allow optional [rev]', async function() {
          const portfolio = {
            name: 'Retirement Portfolio',
            timestamp: new Date(),
            rev: 'Foon'
          };

          return expect(
            validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
            'to be fulfilled with',
            portfolio
          );
        });
      });
    });

    describe('createPortfolio', function() {
      it('should not accept extra fields', async function() {
        const portfolio = {
          name: 'Retirement Portfolio',
          timestamp: '2017-02-22T19:53:56.830Z',
          closed: false,
          data: {
            manager: 'Will Smith'
          },
          foo: 'bar'
        };
        return expect(
          validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
          'to be rejected with',
          /"foo" is not allowed/
        );
      });

      describe('required fields', function() {
        it('should fail if no [name]', async function() {
          const portfolio = {
            timestamp: new Date()
          };

          return expect(
            validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
            'to be rejected with',
            /"name" is required/
          );
        });

        it('should fail if no [timestamp]', async function() {
          const portfolio = {
            name: 'foo'
          };

          return expect(
            validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
            'to be rejected with',
            /"timestamp" is required/
          );
        });
      });

      describe('default values', function() {
        it('should provide default for [closed]', async function() {
          const portfolio = {
            name: 'Retirement Portfolio',
            timestamp: new Date()
          };

          return expect(
            validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
            'to be fulfilled with',
            {...portfolio, closed: false}
          );
        });
      });

      describe('value conversions', function() {
        it('should convert a [timestamp]', async function() {
          const portfolio = {
            name: 'Retirement Portfolio',
            timestamp: '2017-02-22T19:53:56.830Z',
            closed: false,
            data: {
              manager: 'Will Smith'
            }
          };

          return expect(
            validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
            'to be fulfilled with value satisfying',
            {...portfolio, timestamp: new Date(portfolio.timestamp)}
          );
        });
      });

      describe('optional fields', function() {
        it('should allow optional [data]', async function() {
          const portfolio = {
            name: 'Retirement Portfolio',
            timestamp: new Date(),
            closed: false
          };

          return expect(
            validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
            'to be fulfilled with',
            portfolio
          );
        });

        it('should allow freeform [data]', async function() {
          const portfolio = {
            name: 'Retirement Portfolio',
            timestamp: new Date(),
            closed: false,
            data: {
              foo: 'bar'
            }
          };

          return expect(
            validate(portfolio, schemas.CREATE_PORTFOLIO_SCHEMA),
            'to be fulfilled with',
            portfolio
          );
        });
      });
    });
  });
});
