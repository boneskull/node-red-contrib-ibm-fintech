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

      describe('value conversion', function() {
        describe('[timestamp]', function() {
          it('should convert a [timestamp] to a `Date`', async function() {
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
      });

      describe('optional fields', function() {
        describe('[rev]', function() {
          it('should allow optional number [rev]', async function() {
            const portfolio = {
              name: 'Retirement Portfolio',
              timestamp: new Date(),
              rev: 0
            };

            return expect(
              validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should allow optional numeric string [rev]', async function() {
            const portfolio = {
              name: 'Retirement Portfolio',
              timestamp: new Date(),
              rev: '0'
            };

            return expect(
              validate(portfolio, schemas.DELETE_PORTFOLIO_SCHEMA),
              'to be fulfilled with',
              {...portfolio, rev: 0}
            );
          });

          it('should allow optional string [rev]', async function() {
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
        describe('[closed]', function() {
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
      });

      describe('value conversions', function() {
        describe('[timestamp]', function() {
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
      });

      describe('optional fields', function() {
        describe('[data]', function() {
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

    describe('findNamedPortfolio', function() {
      it('should not accept extra fields', async function() {
        const portfolio = {
          portfolioName: 'Retirement Portfolio',
          atDate: '2017-02-22T19:53:56.830Z',
          foo: 'bar'
        };
        return expect(
          validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
          'to be rejected with',
          /"foo" is not allowed/
        );
      });

      describe('required fields', function() {
        it('should fail if no [portfolioName]', async function() {
          const portfolio = {
            timestamp: new Date()
          };

          return expect(
            validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
            'to be rejected with',
            /"portfolioName" is required/
          );
        });

        it('should fail if empty [portfolioName]', async function() {
          const portfolio = {
            timestamp: new Date(),
            portfolioName: ''
          };
          return expect(
            validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
            'to be rejected with',
            /"portfolioName" is not allowed to be empty/
          );
        });
      });

      describe('value conversions', function() {
        it('should convert a [atDate]', async function() {
          const portfolio = {
            portfolioName: 'Retirement Portfolio',
            atDate: '2017-02-22T19:53:56.830Z'
          };

          return expect(
            validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
            'to be fulfilled with value satisfying',
            {...portfolio, atDate: new Date(portfolio.atDate)}
          );
        });
      });

      describe('optional fields', function() {
        describe('[sort]', function() {
          it('should allow optional [sort] (ascending)', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              sort: 'asc'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should allow optional [sort] (descending)', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              sort: 'desc'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow unknown [sort]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              sort: 'sandwiches'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"sort" must be one of \[asc, desc\]/
            );
          });
        });

        describe('[limit]', function() {
          it('should allow optional [limit]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              limit: 1
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow non-positive [limit]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              limit: 0
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"limit" must be a positive number/
            );
          });

          it('should not allow a non-numeric [limit]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              limit: 'fleas'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"limit" must be a number/
            );
          });

          it('should not allow a non-integer [limit]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              limit: 1.5
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"limit" must be an integer/
            );
          });
        });

        describe('[hasAnyKey]', function() {
          it('should allow optional [hasAnyKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasAnyKey: ['quaff']
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow non-array [hasAnyKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasAnyKey: 'quaff'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasAnyKey" must be an array/
            );
          });

          it('should not allow array containing non-string [hasAnyKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasAnyKey: [0]
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasAnyKey" at position 0 fails/
            ).and('to be rejected with', /"0" must be a string/);
          });
        });

        describe('[hasNoKey]', function() {
          it('should allow optional [hasNoKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasNoKey: ['quaff']
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow non-array [hasNoKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasNoKey: 'quaff'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasNoKey" must be an array/
            );
          });

          it('should not allow array containing non-string [hasNoKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasNoKey: [0]
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasNoKey" at position 0 fails/
            ).and('to be rejected with', /"0" must be a string/);
          });
        });

        describe('[hasKey]', function() {
          it('should allow optional [hasKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKey: ['quaff']
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow non-array [hasKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKey: 'quaff'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasKey" must be an array/
            );
          });

          it('should not allow array containing non-string [hasKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKey: [0]
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasKey" at position 0 fails/
            ).and('to be rejected with', /"0" must be a string/);
          });
        });

        describe('[hasKeyValue]', function() {
          it('should allow optional [hasKeyValue]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKeyValue: {quaff: 'potion'}
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow non-object [hasKeyValue]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKeyValue: 'quaff'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"hasKeyValue" must be an object/
            );
          });
        });

        describe('[selector]', function() {
          it('should allow optional [selector]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              selector: {foo: 'bar'}
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });

          it('should not allow non-object [selector]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              selector: 'bar'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"selector" must be an object/
            );
          });

          it('should allow empty object [selector]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              selector: {}
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              portfolio
            );
          });
        });

        describe('[atDate]', function() {
          it('should allow optional [atDate]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              atDate: '2017-02-22T19:53:56.830Z'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be fulfilled with',
              {...portfolio, atDate: new Date(portfolio.atDate)}
            );
          });

          it('should not allow invalid [atDate]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              atDate: 'not an ISO9601 date'
            };

            return expect(
              validate(portfolio, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA),
              'to be rejected with',
              /"atDate" must be a valid ISO 8601 date/
            );
          });
        });
      });
    });

    describe('getHoldings', function() {
      it('should not accept extra fields', async function() {
        const holding = {
          portfolioName: 'Retirement Portfolio',
          foo: 'bar'
        };
        return expect(
          validate(holding, schemas.GET_HOLDINGS_SCHEMA),
          'to be rejected with',
          /"foo" is not allowed/
        );
      });

      describe('required fields', function() {
        it('should fail if no [portfolioName]', async function() {
          const portfolio = {
            timestamp: new Date()
          };

          return expect(
            validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
            'to be rejected with',
            /"portfolioName" is required/
          );
        });

        it('should fail if empty [portfolioName]', async function() {
          const portfolio = {
            timestamp: new Date(),
            portfolioName: ''
          };
          return expect(
            validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
            'to be rejected with',
            /"portfolioName" is not allowed to be empty/
          );
        });
      });

      describe('value conversions', function() {
        it('should convert a [atDate]', async function() {
          const portfolio = {
            portfolioName: 'Retirement Portfolio',
            atDate: '2017-02-22T19:53:56.830Z'
          };

          return expect(
            validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
            'to be fulfilled with value satisfying',
            {...portfolio, atDate: new Date(portfolio.atDate)}
          );
        });
      });

      describe('default values', function() {
        describe('[latest]', function() {
          it('should provide default for [latest]', async function() {
            const holding = {
              portfolioName: 'Retirement Portfolio'
            };

            return expect(
              validate(holding, schemas.GET_HOLDINGS_SCHEMA),
              'to be fulfilled with',
              {...holding, latest: false}
            );
          });
        });
      });

      describe('optional fields', function() {
        describe('[latest]', function() {
          it('should not allow non-boolean [latest]', async function() {
            const holding = {
              portfolioName: 'Retirement Portfolio',
              latest: 'schmlatest'
            };

            return expect(
              validate(holding, schemas.GET_HOLDINGS_SCHEMA),
              'to be rejected with',
              /"latest" must be a boolean/
            );
          });
        });

        describe('[hasKey]', function() {
          it('should allow optional [hasKey]', async function() {
            const holding = {
              portfolioName: 'Retirement Portfolio'
            };

            return expect(
              validate(holding, schemas.GET_HOLDINGS_SCHEMA),
              'to be fulfilled with',
              holding
            );
          });

          it('should not allow non-array [hasKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKey: 'quaff'
            };

            return expect(
              validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
              'to be rejected with',
              /"hasKey" must be an array/
            );
          });

          it('should not allow array containing non-string [hasKey]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              hasKey: [0]
            };

            return expect(
              validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
              'to be rejected with',
              /"hasKey" at position 0 fails/
            ).and('to be rejected with', /"0" must be a string/);
          });
        });

        describe('[atDate]', function() {
          it('should allow optional [atDate]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              atDate: '2017-02-22T19:53:56.830Z'
            };

            return expect(
              validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
              'to be fulfilled with',
              {...portfolio, atDate: new Date(portfolio.atDate)}
            );
          });

          it('should not allow invalid [atDate]', async function() {
            const portfolio = {
              portfolioName: 'Retirement Portfolio',
              atDate: 'not an ISO9601 date'
            };

            return expect(
              validate(portfolio, schemas.GET_HOLDINGS_SCHEMA),
              'to be rejected with',
              /"atDate" must be a valid ISO 8601 date/
            );
          });
        });
      });
    });
  });
});
