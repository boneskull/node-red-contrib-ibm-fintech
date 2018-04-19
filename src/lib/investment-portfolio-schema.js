import Joi from 'joi';
import {oneLine} from 'common-tags';

export const CREATE_PORTFOLIO_SCHEMA = Joi.object({
  closed: Joi.boolean()
    .default(false)
    .description('Set to true if portfolio is closed.'),
  data: Joi.object().description('Portfolio data'),
  name: Joi.string()
    .required()
    .min(1)
    .example('myPortfolio')
    .description('Portfolio name'),
  timestamp: Joi.date()
    .required()
    .iso()
    .example('2018-04-17T03:29:03.328Z')
    .description('Portfolio date and time')
});

export const DELETE_PORTFOLIO_SCHEMA = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .example('myPortfolio')
    .description('Portfolio name'),
  timestamp: Joi.date()
    .required()
    .iso()
    .example('2018-04-17T03:29:03.328Z')
    .description('Portfolio date and time. Must be a valid ISO 8601 string.'),
  rev: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .description('_rev of portfolio entry')
});

export const UPDATE_PORTFOLIO_SCHEMA = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .example('myPortfolio')
    .description('Portfolio name'),
  timestamp: Joi.date()
    .required()
    .iso()
    .example('2018-04-17T03:29:03.328Z')
    .description('Portfolio date and time. Must be a valid ISO 8601 string.'),
  rev: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .example(1)
    .description('_rev of portfolio entry'),
  closed: Joi.boolean()
    .default(false)
    .description('Set to true if portfolio is closed.'),
  data: Joi.object().description('Portfolio data')
});

export const FIND_PORTFOLIO_BY_NAME_SCHEMA = Joi.object({
  portfolioName: Joi.string()
    .min(1)
    .required()
    .example('myPortfolio')
    .description('Name of the portfolio to retrieve'),
  atDate: Joi.date()
    .iso()
    .example('2018-04-17T03:29:03.328Z')
    .description(
      oneLine`
      When this parameter specifies a date and time, the portfolios with
      timestamps on or before the specified date and time are returned.
      Must be a valid ISO 8601 string.
      `
    ),
  hasAnyKey: Joi.array()
    .items(
      Joi.string()
        .description('Key name')
        .example('manager')
    )
    .example(['manager', 'acting-manager'])
    .description(
      oneLine`
      When the data field of the portfolio contains *any* of the keys specified
      by this parameter, that portfolio is returned.
      `
    ),
  hasKey: Joi.array()
    .items(
      Joi.string()
        .description('Key name')
        .example('manager')
    )
    .example(['manager', 'acting-manager'])
    .description(
      oneLine`
      When the data field of the portfolio contains the keys specified by
      this parameter, that portfolio is returned. 
      `
    ),
  hasKeyValue: Joi.object()
    .example({manager: 'Edward Lam'})
    .description(
      oneLine`
      When the data field of the portfolio contains the keys and values
      specified by this parameter, that portfolio is returned.  All values
      will be coerced into strings.
      `
    ),
  hasNoKey: Joi.array()
    .items(
      Joi.string()
        .description('Key name')
        .example('cancelled')
    )
    .example(['cancelled'])
    .description(
      oneLine`
      When the data field of the portfolio doesn't contain the keys and
      values specified by this parameter, that portfolio is returned.
      `
    ),
  limit: Joi.number()
    .integer()
    .positive()
    .example(10)
    .description(
      oneLine`
      When the value is an integer, the number of portfolios returned is limited
      to the number specified. If a number is not specified, all portfolios
      matching the other criteria are returned.
      `
    ),
  sort: Joi.string()
    .valid('asc', 'desc')
    .example('asc')
    .description(
      oneLine`
      When the value is \`asc\`, the portfolios with the earliest timestamps
      are returned first. When the value is \`desc\`, returns the portfolios
      with the most recent timestamps first. If no value is specified, then
      the portfolios are not sorted.
      `
    ),
  selector: Joi.object()
    .example({
      selector: {
        manager: 'Edward Lam'
      }
    })
    .description(
      oneLine`This operation returns portfolios that have data matching the
      specified selector. Use this operation for complex queries.
      `
    )
    .notes(
      'https://console.ng.bluemix.net/docs/services/Cloudant/api/cloudant_query.html#selector-syntax'
    )
});

export const FIND_PORTFOLIO_BY_NAME_AND_SELECTOR_SCHEMA = Joi.object({
  portfolioName: Joi.string()
    .min(1)
    .required()
    .example('myPortfolio')
    .description('Name of the portfolio to retrieve'),
  selector: Joi.object()
    .required()
    .example({manager: 'Edward Lam'})
});

export const GET_HOLDINGS_SCHEMA = Joi.object({
  portfolioName: Joi.string()
    .min(1)
    .required()
    .example('myPortfolio')
    .description('Name of the portfolio to retrieve'),
  atDate: Joi.date()
    .iso()
    .example('2018-04-17T03:29:03.328Z')
    .description(
      oneLine`
      When the value is a date and time, the holdings with timestamps on or
      before the specified date and time are returned.
      `
    ),
  hasKey: Joi.array()
    .items(
      Joi.string()
        .description('Key name')
        .example('manager')
    )
    .example(['manager', 'acting-manager'])
    .description(
      oneLine`
      When the value contains the names of keys, the holdings that have the
      specified keys defined are returned.
      `
    ),
  latest: Joi.boolean()
    .default(false)
    .description(
      oneLine`
      When the value is true, the most recent holdings entry is returned.
      When the value is false, all holdings are returned. The default value
      is false.
      `
    )
});
