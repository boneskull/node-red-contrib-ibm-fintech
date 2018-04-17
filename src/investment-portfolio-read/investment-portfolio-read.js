export default function(RED) {
  class InvestmentPortfolioReadNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      Object.assign(this, {
        name: config.name,
        portfolioName: config.portfolioName,
        selector: config.selector,
        service: RED.nodes.getNode(config.service)
      });

      this.on('input', async msg => {
        if (this.service) {
          const portfolios = await this.service.read({
            portfolioName: this.portfolioName,
            selector: this.selector
          });
          this.send({...msg, payload: portfolios});
        }
      });

      console.log(this);
    }
  }

  RED.nodes.registerType(
    'investment-portfolio-read',
    InvestmentPortfolioReadNode
  );
}
