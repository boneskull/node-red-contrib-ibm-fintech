import {inspect, normalizeString, normalizeArray} from '../lib/utils';

import _ from 'lodash/fp';
import bodyParser from 'body-parser';
import mkdirp from 'mkdirp';
import {join} from 'path';
import {writeFile, readFile} from 'fs';

/**
 * Returns config-relevant props from a Message payload
 * @param {Object} payload - Payload
 * @returns {Object} relevant props
 */
const getConfigFromPayload = _.pick(['holdings', 'scenario', 'analytics']);

const MAX_FILE_SIZE = '1mb';

/**
 * Creates the {@link SimulatedInstrumentAnalyticsNode} Node
 * @export
 * @param {Red} RED - Node-RED API
 */
export default function(RED) {
  const STORAGE_DIR = join(RED.settings.userDir, 'ibm-fintech', 'sia');
  /**
   * @class SimulatedInstrumentAnalyticsNode
   */
  class SimulatedInstrumentAnalyticsNode {
    /**
     * Creates an instance of SimulatedInstrumentAnalyticsNode
     * @param {any} [config={}] - Node config; see .html file
     * @memberof SimulatedInstrumentAnalyticsNode
     */
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.config = {
        holdings: normalizeArray(config.holdings),
        analytic: normalizeString(config.analytic)
      };

      this.filename = join(STORAGE_DIR, `scenario-${this.id}.csv`);

      const simulatedInstrumentAnalyticsService = RED.nodes.getNode(
        config.service
      );

      this.trace(inspect`Original config: ${config}`);
      this.trace(inspect`Processed config: ${this.config}`);

      this.on('input', async msg => {
        this.trace(inspect`Message received: ${msg}`);
        if (simulatedInstrumentAnalyticsService) {
          let shape = 'ring';
          const progress = setInterval(() => {
            this.status({fill: 'yellow', shape, text: 'working...'});
            shape = shape === 'ring' ? 'dot' : 'ring';
          }, 500);

          let scenario;
          try {
            scenario = await this.getScenario();
          } catch (err) {
            if (err.code !== 'ENOENT') {
              this.error(err);
              throw err;
            }
          }

          try {
            let result = {};
            const config = _.defaults(
              _.defaults({scenario}, this.config),
              getConfigFromPayload(msg.payload)
            );
            try {
              result = await simulatedInstrumentAnalyticsService.instrumentMany(
                config
              );
            } finally {
              clearInterval(progress);
              this.status({});
            }
            this.send({
              ...msg,
              payload: {...msg.payload, ...result}
            });
          } catch (err) {
            this.error(err, msg);
          }
        } else {
          this.warn(
            inspect`Message received, but no service configured: ${msg}`
          );
          // stop flow?
        }
      });
    }

    async setScenario(scenario) {
      const filename = this.filename;
      return new Promise((resolve, reject) => {
        writeFile(filename, scenario, 'utf8', err => {
          if (err) {
            reject(err);
            return;
          }
          this._cachedScenario = {scenario, filename, bytes: scenario.length};
          resolve({filename, bytes: scenario.length});
        });
      });
    }

    async getScenario() {
      const filename = this.filename;
      if (this._cachedScenario) {
        return this._cachedScenario;
      }
      return new Promise((resolve, reject) => {
        readFile(filename, 'utf8', (err, scenario) => {
          if (err) {
            return reject(err);
          }
          this._cachedScenario = {scenario, bytes: scenario.length, filename};
          resolve(this._cachedScenario);
        });
      });
    }
  }

  // welcome to callback hell!
  RED.httpAdmin.post(
    '/simulated-instrument-analytics/upload/:id',
    bodyParser.raw({type: 'text/csv', limit: MAX_FILE_SIZE}),
    (req, res) => {
      const node = RED.nodes.getNode(req.params.id);
      if (node) {
        return mkdirp(STORAGE_DIR, async err => {
          if (err) {
            node.error(err);
            return res.sendStatus(500);
          }
          try {
            const result = await node.setScenario(req.body);
            res.json(result);
          } catch (err) {
            node.error(err);
            res.sendStatus(500);
          }
        });
      }
      // TODO: log this
      res.sendStatus(404);
    }
  );
  // .put('/simulated-instrument-analytics/uploadStatus/:id', (req, res) => {
  //   const node = RED.nodes.getNode(req.params.id);
  //   if (node) {
  //     node.status(req.body.status || {});
  //   }
  //   res.sendStatus(200);
  // });

  RED.nodes.registerType(
    'simulated-instrument-analytics-read',
    SimulatedInstrumentAnalyticsNode
  );
}
