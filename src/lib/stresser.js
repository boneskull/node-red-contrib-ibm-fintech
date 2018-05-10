import _ from 'lodash/fp';

export const Stresser = ({
  investmentPortfolioService,
  predictiveMarketScenarioService,
  simulatedInstrumentAnalyticsService
}) => async ({portfolioName, latest, hasKey, atDate, factor, shock}) => {
  const [{holdings}, {scenario}] = await Promise.all([
    investmentPortfolioService.getHoldings({
      portfolioName,
      latest,
      hasKey,
      atDate
    }),
    predictiveMarketScenarioService.generate({
      factor,
      shock
    })
  ]);

  return simulatedInstrumentAnalyticsService.instrumentMany({
    ids: _.map('instrumentId', holdings),
    scenario
  });
};
