var http = require('https');

var options = {
  method: 'POST',
  hostname: 'fss-analytics.mybluemix.net',
  port: null,
  path: '/api/v1/scenario/generate_predictive',
  headers: {
    accept: 'text/csv',
    'content-type': 'application/json',
    'x-ibm-access-token':
      '3b24cad3864d110f42d8da029405cbeac42f4521af3b81dd887196147c6defb13ee31f31fbaf18eb43eaaa00e9fcd46cc30480a605ac3ac8c8b7d9ffbd3512c7cfec3b449282f228e4ab97eeb8405a615a72184d3e193cc623638f56a36dda447a7c2065f6b1dbc69ab8c0d80f7e6b35b5b04674b955c369e7ad848f9511d9a2'
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
req.write(
  JSON.stringify({
    market_change: {
      risk_factor: 'CX_EQI_NYSE_USA_BMK_USD_LargeCap_Price',
      shock: 5
    }
  })
);
req.end();
