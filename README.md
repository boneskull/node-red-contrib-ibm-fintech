# node-red-contrib-ibm-fintech

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Node-RED Nodes for IBM Cloud FinTech Services

This is a collection of [Node-RED](https://nodered.org) Nodes for use with the following [IBM Cloud](https://www.ibm.com/cloud/) FinTech services:

- [Investment Portfolio](https://console.bluemix.net/catalog/services/investment-portfolio) (Experimental)
- [Predictive Market Scenarios](https://console.bluemix.net/catalog/services/predictive-market-scenarios) (Experimental)
- [Simulated Instrument Analytics](https://console.bluemix.net/catalog/services/simulated-instrument-analytics) (Experimental)

## Install

```bash
$ npm i node-red-contrib-ibm-fintech
```

## Usage

Usage for each Node is detailed within its "Info" tab.

## Nodes Provided

This module provides the following Node-RED Nodes:

- **Investement Portfolio** (`portfolio`): Retrieve one or more Portfolio definitions from the Investment Porfolio service
- **Holdings** (`holdings`): Retrieve all holdings for one or more Portfolios from the Investment Portfolio service
- **Generate Scenario** (`generate-scenario`): Given a shock % and risk factor, generate a predictive market scenario file in CSV format using the Predictive Market Scenarios service
- **Stress Test** (`stress-test`): Perform a stress test given a shock and factor against one or more Portfolios using the Investment Portfolio, Predictive Market Scenarios, and Simulated Instrument Analytics services

In addition, each of the three services has a corresponding Configuration Node which can be reused across the above Nodes.

## Maintainers

- [Christopher Hiller](https://github.com/boneskull)

## Contribute

PRs accepted!

### Build Steps

1. `git clone` this repo
2. Execute `npm install` in your working copy
3. Execute `npm run build` to build the Nodes

**PRO TIP**: Run `npm link` in your working copy, then navigate to your Node-RED user directory (e.g., `~/.node-red`), and run `npm link node-red-contrib-ibm-fintech`.  To see changes reflected, re-run `npm run build` and restart your Node-RED instance.

## License

The Node icons were adapted for use in Node-RED from [Font Awesome](https://fontawesome.com), which is [licensed CC-BY-4.0](https://fontawesome.com/license).

Copyright © 2018 IBM.  Licensed Apache-2.0.
