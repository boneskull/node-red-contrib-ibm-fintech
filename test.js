var http = require('https');

var options = {
  method: 'GET',
  hostname: 'investment-portfolio.mybluemix.net',
  port: null,
  path: '/api/v1/portfolios/MyFixedIncomePortfolio/holdings?latest=false',
  headers: {
    accept: 'application/json',
    authorization:
      'Basic ' +
      Buffer.from(
        'migingeonsithersamillath:74908cdab363a6262f170bbdaf3ea34e61f82487'
      ).toString('base64')
  }
};

var req = http.request(options, function(res) {
  var chunks = [];

  res.on('data', function(chunk) {
    chunks.push(chunk);
  });

  res.on('end', function() {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
