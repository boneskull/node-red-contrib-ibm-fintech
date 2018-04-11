import * as schemas from './investment-portfolio-schema';

import {create as axios} from 'axios';
import {getCredentials} from 'vcap_services';
import prependHTTP from 'prepend-http';
import {resolve} from 'url';

const SERVICE_NAME = 'fss-portfolio-service';
const DEFAULT_API_VERSION = 'v1';

export class InvestmentPortfolioAPI {
  constructor(credentials = {}, options = {}) {
    const vcapCredentials = getCredentials(SERVICE_NAME);
    credentials = this.credentials = {
      ...vcapCredentials,
      ...credentials
    };
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

  async listPortfolios() {
    return this.readerClient.get('/portfolios');
  }

  async createPortfolio(data) {
    data = Joi.attempt(data, schemas.CREATE_PORTFOLIO_SCHEMA);
    return this.writerClient.post('/portfolios', {data});
  }

  async deletePortfolio(data) {
    const {name, timestamp, rev} = Joi.attempt(
      data,
      schemas.DELETE_PORTFOLIO_SCHEMA
    );
    return this.writerClient.delete(`/portfolios/${name}/${timestamp}`, {
      params: rev
    });
  }

  async updatePortfolio(data) {}
}
