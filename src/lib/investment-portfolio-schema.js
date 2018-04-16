import Joi from 'joi';

export const CREATE_PORTFOLIO_SCHEMA = Joi.object({
  closed: Joi.boolean()
    .default(false)
    .description('Set to true if portfolio is closed.'),
  data: Joi.object()
    .optional()
    .description('Portfolio data'),
  name: Joi.string()
    .required()
    .min(1)
    .description('Portfolio name'),
  timestamp: Joi.date()
    .required()
    .iso()
    .description('Portfolio date and time')
});

export const DELETE_PORTFOLIO_SCHEMA = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .description('Portfolio name'),
  timestamp: Joi.date()
    .required()
    .iso()
    .description('Portfolio date and time'),
  rev: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .optional()
    .description('_rev of portfolio entry')
});

export const UPDATE_PORTFOLIO_SCHEMA = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .description('Portfolio name'),
  timestamp: Joi.date()
    .required()
    .iso()
    .description('Portfolio date and time'),
  rev: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .optional()
    .description('_rev of portfolio entry'),
  closed: Joi.boolean()
    .default(false)
    .description('Set to true if portfolio is closed.'),
  data: Joi.object()
    .optional()
    .description('Portfolio data')
});
