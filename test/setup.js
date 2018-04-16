import {clone} from 'unexpected';
import {config} from 'dotenv';
import sinon from 'sinon';
import unexpectedSinon from 'unexpected-sinon';

config();

global.expect = clone().use(unexpectedSinon);
global.sinon = sinon;
