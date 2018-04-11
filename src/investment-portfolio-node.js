export default function(RED) {
  class InvestmentPortfolioNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.url = config.url;
      
    }
  }

  RED.nodes.registerType('investment-portfolio', InvestmentPortfolioNode);
}
