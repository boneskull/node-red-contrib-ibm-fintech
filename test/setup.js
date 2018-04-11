import {clone} from 'unexpected';
import {config} from 'dotenv';

config();

global.expect = clone();
