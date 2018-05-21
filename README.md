# node-red-contrib-ibm-fintech

[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Node-RED Nodes for IBM Cloud FinTech Services

This is a collection of [Node-RED](https://nodered.org) Nodes for use with the following [IBM Cloud](https://www.ibm.com/cloud/) FinTech services:

- [Investment Portfolio](https://console.bluemix.net/catalog/services/investment-portfolio) (Experimental)
- [Predictive Market Scenarios](https://console.bluemix.net/catalog/services/predictive-market-scenarios) (Experimental)
- [Simulated Instrument Analytics](https://console.bluemix.net/catalog/services/simulated-instrument-analytics) (Experimental)

## Table of Contents

- [node-red-contrib-ibm-fintech](#node-red-contrib-ibm-fintech)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Nodes](#nodes)
  - [Maintainers](#maintainers)
  - [Contribute](#contribute)
  - [License](#license)

## Install

```bash
$ npm i node-red-contrib-ibm-fintech
```

## Nodes

- `portfolio`: Retrieve one or more Portfolio definitions from the Investment Porfolio service
- `holdings`: Retrieve all holdings for one or more Portfolios from the Investment Portfolio service
- `stress-test`: Perform a stress test given a shock and factor against one or more Portfolios using the Investment Portfolio, Predictive Market Scenarios, and Simulated Instrument Analytics services

In addition, each of the three services has a corresponding Configuration Node which can be reused across the above Nodes.

## Maintainers

[@boneskull](https://github.com/boneskull)

## Contribute

PRs accepted.

## License

Apache-2.0 © 2018 Christopher Hiller
