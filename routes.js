const routes = require('next-routes')();

routes
  .add('/crowdfunds/new', '/crowdfunds/new')
  .add('/crowdfunds/:address', '/crowdfunds/show')
  .add('/crowdfunds/:address/expenditures', '/crowdfunds/expenditures/index')
  .add('/crowdfunds/:address/expenditures/new', '/crowdfunds/expenditures/new');

module.exports = routes;
