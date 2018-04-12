export default function(RED) {
  class InvestmentPortfolioReadNode {
    constructor(config = {}) {
      RED.nodes.createNode(this, config);

      this.service = RED.nodes.getNode(config.service);

      this.on('input', async (msg) => {
        if (this.service) {
          const portfolios = await this.service.read();
          this.send({...msg, payload: portfolios});
        }
      });
    }
  }

  RED.nodes.registerType('investment-portfolio-read', InvestmentPortfolioReadNode);
}