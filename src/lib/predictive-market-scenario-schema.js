import Joi from 'joi';
import _ from 'lodash/fp';
import factors from './factors.json';

export const GENERATE_SCHEMA = Joi.object({
  factor: Joi.valid(_.map('id', factors))
    .required()
    .description('ID of the risk factor'),
  shock: Joi.number()
    .default(5)
    .description('Ratio of the new to old values of the risk factor')
});
