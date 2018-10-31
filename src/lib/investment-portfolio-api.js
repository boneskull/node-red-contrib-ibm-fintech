import * as schemas from './investment-portfolio-schema';

import {makeHTTPSURL, validateParam} from './utils';

import {CloudAPI} from './cloud-api';
import _ from 'lodash/fp';
import axiosDebugLog from 'axios-debug-log';
import {create as createClient} from 'axios';
import d from 'debug';
import {resolve} from 'url';

const debug = d('ibm-fintech:investment-portfolio');

/**
 * @typedef {Object} Portfolio
 * @property {string} _rev - Revision
 * @property {boolean} closed - Portfolio is closed if `true`
 * @property {Object} data - Portfolio data
 * @property {string} name - Portfolio name
 * @property {string} timestamp - ISO 9601 date
 */

/**
 * Removes keys w/ void values from an Object
 *
 * @param {Object} value - "parameters" object to normalize
 * @returns {Object} `value`, sans keys w/ void values
 */
const normalizeParams = _.omitBy(_.isUndefined);

/**
 * Provides wrapper around Investment Portfolio API
 *
 * @export
 * @class InvestmentPortfolioAPI
 * @extends {CloudAPI}
 */
export class InvestmentPortfolioAPI extends CloudAPI {
  constructor(credentials = {}, options = {}) {
    super(credentials);
    if (
      !_.overEvery(
        _.get('credentials.url'),
        _.get('credentials.reader.userid'),
        _.get('credentials.reader.password')
      )(this)
    ) {
      throw new Error('invalid/missing credentials');
    }

    this.options = _.defaults({apiVersion: this.defaultApiVersion}, options);

    this.readerClient = createClient({
      baseURL: this.url,
      auth: {
        username: this.credentials.reader.userid,
        password: this.credentials.reader.password
      }
    });

    this.writerClient = createClient({
      baseURL: this.url,
      auth: {
        username: this.credentials.writer.userid,
        password: this.credentials.writer.password
      }
    });

    axiosDebugLog.addLogger(this.readerClient, debug);
    axiosDebugLog.addLogger(this.writerClient, debug);
  }

  get serviceName() {
    return 'fss-portfolio-service';
  }

  get url() {
    const baseURL = makeHTTPSURL(this.credentials.url);
    return resolve(baseURL, `/api/${this.apiVersion}`);
  }

  get apiVersion() {
    return this.options.apiVersion;
  }

  async findPortfolios(options = {}) {
    if (!(options.selector || options.portfolioName)) {
      return this.findAllPortfolios();
    }
    if (options.selector) {
      return options.portfolioName
        ? this.findNamedPortfolioBySelector(options)
        : this.findPortfolioBySelector(options);
    }
    return this.findNamedPortfolios(options);
  }

  /**
   * Find one or more Portfolios by name
   * @param {Object} options - See {@link FIND_PORTFOLIO_BY_NAME_SCHEMA}
   * @memberof InvestmentPortfolioAPI
   * @returns Promise<{{portfolios: Portfolio[]}}> Matching Portfolio(s)
   */
  async findNamedPortfolios(options = {}) {
    let params = validateParam(schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA, options);
    params.hasKeyValue = params.hasKeyValue
      ? _.pipe(
          _.entries,
          _.map(_.join(':')),
          _.join(',')
        )(params.hasKeyValue)
      : void 0;
    const path = `/portfolios/${options.portfolioName}`;
    params = normalizeParams(_.omit(['portfolioName'], params));
    try {
      const res = await this.readerClient.get(path, {
        params
      });
      return {portfolios: _.get('data.portfolio', res)};
    } catch (err) {
      switch (_.get('response.status', err)) {
        case 404:
          throw new Error(
            `Portfolio with name "${options.portfolioName}" not found!`
          );
      }
      throw err;
    }
  }

  async getHoldings(options = {}) {
    let params = validateParam(schemas.GET_HOLDINGS_SCHEMA, options);
    const path = `/portfolios/${options.portfolioName}/holdings`;
    params = normalizeParams(_.omit(['portfolioName'], params));
    try {
      const res = await this.readerClient.get(path, {params});
      // yep!
      return {holdings: _.get('data.holdings[0].holdings', res)};
    } catch (err) {
      switch (_.get('response.status', err)) {
        case 404:
          throw new Error(
            `Portfolio with name "${options.portfolioName}" not found!`
          );
      }
      throw err;
    }
  }

  /**
   * Find ALL Portfolios
   * @memberof InvestmentPortfolioAPI
   * @returns Promise<Portfolio[]> All portfolios
   */
  async findAllPortfolios() {
    const res = await this.readerClient.get('/portfolios');
    return {portfolios: res.data.portfolios};
  }

  /**
   * @todo document
   *
   * @param {any} [data={}]
   * @returns
   * @memberof InvestmentPortfolioAPI
   */
  async createPortfolio(data = {}) {
    data = validateParam(schemas.CREATE_PORTFOLIO_SCHEMA, data);
    return this.writerClient.post('/portfolios', {data});
  }

  /**
   * @todo document
   *
   * @param {any} [data={}]
   * @returns
   * @memberof InvestmentPortfolioAPI
   */
  async deletePortfolio(data = {}) {
    const {name, timestamp, rev} = validateParam(
      schemas.DELETE_PORTFOLIO_SCHEMA,
      data
    );
    return this.writerClient.delete(
      `/portfolios/${name}/${timestamp.toISOString()}`,
      {
        params: _.isUndefined(rev) ? {} : {rev}
      }
    );
  }

  /**
   * @todo implement
   *
   * @param {any} data
   * @memberof InvestmentPortfolioAPI
   */
  async updatePortfolio(data) {}

  /**
   * @todo implement
   *
   * @param {any} [options={}]
   * @memberof InvestmentPortfolioAPI
   */
  async findPortfolioBySelector(options = {}) {}

  /**
   * @todo document
   *
   * @param {any} [options={}]
   * @returns
   * @memberof InvestmentPortfolioAPI
   */
  async findNamedPortfolioBySelector(options = {}) {
    const {portfolioName, selector} = validateParam(
      schemas.FIND_PORTFOLIO_BY_NAME_AND_SELECTOR_SCHEMA,
      options
    );
    const path = `/portfolios/${portfolioName}`;
    try {
      const res = await this.writerClient.post(path, {
        data: selector
      });
      return {portfolios: _.get('data.portfolio', res)};
    } catch (err) {
      switch (_.get('response.status', err)) {
        case 404:
          throw new Error(
            `Portfolio with name "${options.portfolioName}" not found!`
          );
      }
      throw err;
    }
  }

  get defaultApiVersion() {
    return 'v1';
  }
}
