import _ from 'lodash/fp';
import prependHTTP from 'prepend-http';
import {inspect as utilInspect} from 'util';

export const inspect = (strings, value) =>
  `${strings[0].trim().replace(/:$/, '')}: ${utilInspect(value)}`;

export const makeHTTPSURL = _.partialRight(prependHTTP, [{https: true}]);
