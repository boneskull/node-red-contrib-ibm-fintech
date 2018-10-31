import _ from 'lodash/fp';
import csvParse from 'csv-parse';
import d from 'debug';

const factors = require('./factors.json');
const debug = d('ibm-fintech:stresser');

/**
 * Set of unique factor IDs as present in `factors.json`
 * @type {Set<string>}
 */
const factorIds = new Set(_.map('id', factors));

/**
 * Return `true` if row represents a stress shift
 * @see https://github.com/IBM/Predictive-Market-Stress-Testing/blob/master/run.py#L148
 * @param {string[]} row - Scenario CSV row
 * @returns boolean
 */
const hasStressShift = row =>
  row.length > 14 && factorIds.has(row[5]) && row[13] !== '1'; // what is this i don't even

/**
 * Returns value of instrumented holding
 * @param {Object} [holding] - Instrumented holding object
 * @returns number|void
 */
const getValue = _.get('values[0]["THEO/Price"]');

/**
 * Given three Service instances, returns a function to execute an
 * end-to-end stress test
 * @param {Object} options - Options
 * @param {InvestmentPortfolioServiceNode} investmentPortfolioService - Service
 * @param {PredictiveMarketScenarioServiceNode} predictiveMarketScenarioService - Service
 * @param {SimulatedInstrumentAnalyticsServiceNode} simulatedInstrumentAnalyticsService - Service
 * @returns Function
 */
export const Stresser = ({
  investmentPortfolioService,
  predictiveMarketScenarioService,
  simulatedInstrumentAnalyticsService
}) => async ({portfolioName, latest, hasKey, atDate, factor, shock}) => {
  debug(`Stress testing with ${shock} shock and factor ID ${factor}...`);
  const [holdings, scenario] = await Promise.all([
    investmentPortfolioService
      .getHoldings({
        portfolioName,
        latest,
        hasKey,
        atDate
      })
      .then(({holdings}) => {
        debug(`Received ${holdings.length} holding(s)`);
        return holdings;
      }),
    predictiveMarketScenarioService
      .generate({
        factor,
        shock
      })
      .then(({scenario}) => {
        debug(`Received ${scenario.length}-byte scenario CSV`);
        return scenario;
      })
  ]);

  debug(`Instrumenting & parsing CSV...`);

  const [analytics, parsedScenario] = await Promise.all([
    simulatedInstrumentAnalyticsService.instrumentMany({
      ids: _.map('instrumentId', holdings),
      scenario
    }),
    new Promise((resolve, reject) => {
      csvParse(
        scenario,
        {relax_column_count: true, delimiter: ','},
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    })
  ]);

  const holdingsByInstrumentId = new Map(
    _.entries(_.keyBy('instrumentId', holdings))
  );
  return {
    holdings: _.reduce(
      (acc, analytic) => {
        const holding = holdingsByInstrumentId.get(analytic.instrument);
        holding['baseValue' in holding ? 'newValue' : 'baseValue'] = getValue(
          analytic
        );
        if ('baseValue' in holding && 'newValue' in holding) {
          debug(holding);
        }
        return 'baseValue' in holding && 'newValue' in holding
          ? acc.concat(holding)
          : acc;
      },
      [],
      analytics
    ),
    conditions: _.reduce(
      (acc, row) =>
        hasStressShift(row)
          ? acc.concat({
              factor: row[5],
              stressShift: row[13]
            })
          : acc,
      [],
      parsedScenario
    )
  };
};
