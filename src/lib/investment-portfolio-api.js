import * as schemas from './investment-portfolio-schema';

import Joi from 'joi';
import _ from 'lodash/fp';
import {create as axios} from 'axios';
import d from 'debug';
import {getCredentials} from 'vcap_services';
import prependHTTP from 'prepend-http';
import {resolve} from 'url';

const debug = d('node-red-contrib-ibm-fintech');

/**
 * @typedef {Object} Portfolio
 * @property {string} _rev - Revision
 * @property {boolean} closed - Portfolio is closed if `true`
 * @property {Object} data - Portfolio data
 * @property {string} name - Portfolio name
 * @property {string} timestamp - ISO 9601 date
 */

export const SERVICE_NAME = 'fss-portfolio-service';
export const DEFAULT_API_VERSION = 'v1';

const normalizeParams = _.omitBy(_.isUndefined);

export class InvestmentPortfolioAPI {
  constructor(credentials = {}, options = {}) {
    const vcapCredentials = getCredentials(SERVICE_NAME);
    credentials = this.credentials = {
      ...vcapCredentials,
      ...credentials
    };

    if (
      !(
        credentials.url &&
        _.get('reader.userid', credentials) &&
        _.get('reader.password', credentials)
      )
    ) {
      throw new Error('invalid/missing credentials');
    }

    this.options = {apiVersion: DEFAULT_API_VERSION, ...options};

    this.readerClient = axios({
      baseURL: this.url,
      auth: {
        username: credentials.reader.userid,
        password: credentials.reader.password
      }
    });

    this.writerClient = axios({
      baseURL: this.url,
      auth: {
        username: credentials.writer.userid,
        password: credentials.writer.password
      }
    });
  }

  get url() {
    const baseURL = prependHTTP(this.credentials.url, {https: true});
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
    let params = Joi.attempt(options, schemas.FIND_PORTFOLIO_BY_NAME_SCHEMA);
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
    data = Joi.attempt(data, schemas.CREATE_PORTFOLIO_SCHEMA);
    debug('POST /portfolios', data);
    return this.writerClient.post('/portfolios', {data});
  }

  async deletePortfolio(data = {}) {
    const {name, timestamp, rev} = Joi.attempt(
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
    const {portfolioName, selector} = Joi.attempt(
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
