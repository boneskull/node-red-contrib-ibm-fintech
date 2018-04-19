import * as schemas from './investment-portfolio-schema';

import {CloudAPI} from './cloud-api';
import _ from 'lodash/fp';
import {attempt} from 'joi';
import {create as createClient} from 'axios';
import d from 'debug';
import {makeHTTPSURL} from './utils';
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

export const DEFAULT_API_VERSION = 'v1';

const normalizeParams = _.omitBy(_.isUndefined);

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

    this.options = _.defaults({apiVersion: DEFAULT_API_VERSION}, options);

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
   * @throws Invalid options
   * @returns Promise<Portfolio[]> Matching Portfolio(s)
   */
  async findNamedPortfolios(options = {}) {
    let params = attempt(options, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA);
    params.hasKeyValue = params.hasKeyValue
      ? _.pipe(_.entries, _.map(_.join(':')), _.join(','))(params.hasKeyValue)
      : void 0;
    const path = `/portfolios/${options.portfolioName}`;
    delete params.portfolioName;
    params = normalizeParams(params);
    debug(`GET /portfolios${path}`, params);
    try {
      const res = await this.readerClient.get(path, {
        params
      });
      return {portfolios: res.data.portfolio};
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
    // let params = attempt(options, schemas.GET_HOLDINGS_SCHEMA);
  }

  /**
   * Find ALL Portfolios
   * @memberof InvestmentPortfolioAPI
   * @returns Promise<Portfolio[]> All portfolios
   */
  async findAllPortfolios() {
    debug('GET /portfolios');
    const res = await this.readerClient.get('/portfolios');
    return {portfolios: res.data.portfolios};
  }

  async createPortfolio(data = {}) {
    data = attempt(data, schemas.CREATE_PORTFOLIO_SCHEMA);
    debug('POST /portfolios', data);
    return this.writerClient.post('/portfolios', {data});
  }

  async deletePortfolio(data = {}) {
    const {name, timestamp, rev} = attempt(
      data,
      schemas.DELETE_PORTFOLIO_SCHEMA
    );
    return this.writerClient.delete(
      `/portfolios/${name}/${timestamp.toISOString()}`,
      {
        params: _.isUndefined(rev) ? {} : {rev}
      }
    );
  }

  async updatePortfolio(data) {}

  async findPortfolioBySelector(options = {}) {}

  async findNamedPortfolioBySelector(options = {}) {
    const {portfolioName, selector} = attempt(
      options,
      schemas.FIND_PORTFOLIO_BY_NAME_AND_SELECTOR_SCHEMA
    );
    const path = `/portfolios/${portfolioName}`;
    debug(`POST ${path}`, selector);
    try {
      const res = await this.writerClient.post(path, {
        data: selector
      });
      return {portfolios: res.data.portfolio};
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
}
