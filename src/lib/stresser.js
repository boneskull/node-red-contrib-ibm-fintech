import _ from 'lodash/fp';
import csvParse from 'csv-parse';
import d from 'debug';
import factors from 'factors.json';

const debug = d('ibm-fintech:stresser');

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

  const [simulation, parsedScenario] = await Promise.all([
    simulatedInstrumentAnalyticsService.instrumentMany({
      ids: _.map('instrumentId', holdings),
      scenario
    }),
    new Promise((resolve, reject) => {
      csvParse(
        scenario,
        {relax_column_count: true, cast: true, columns: true, trim: true},
        (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    })
  ]);
  const {analytics} = simulation;

  const holdingsByInstrumentId = new Map(
    _.entries(_.keyBy('instrumentId', holdings))
  );
  return {
    holdings: _.reduce(
      (acc, analytic) => {
        const holding = holdingsByInstrumentId.get(analytic.instrument);
        holding['baseValue' in holding ? 'newValue' : 'baseValue'] =
          analytic.values[0]['THEO/Price'];
        return 'baseValue' in holding && 'newValue' in holding
          ? acc.concat(holding)
          : acc;
      },
      [],
      analytics
    ),
    conditions: _.reduce(
      (acc, scen) =>
        scen['Scenario Shift Rule'] !== 1
          ? acc.concat({
              factor: scen['ScenVar'],
              stressShift: scen['Scenario Shift Rule']
            })
          : acc,
      [],
      parsedScenario
    )
  };
};
