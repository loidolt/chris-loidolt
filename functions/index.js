const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors');

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

getUserContributions = async (req, res) => {
  // We recover the data
  const username = req.body.username; // return "undefined"
  const year = req.body.year; // return "undefined"

  // we're checking to see if they've been transferred
  if (!username || !year) {
    // At least one of the 3 required data is not completed
    console.error('Error level 1: missing data');
    return res.status(400).send('Error: missing data');
  }

  // (We have all the data, we continue the function)
  functions.logger.info(`GitHub ${username} ${year} Contributions`, {
    structuredData: true,
  });

  const url = 'https://skyline.github.com/' + username + '/' + year + '.json';

  await axios
    .get(url)
    .then(response => {
      functions.logger.info(response.data, { structuredData: true });
      res.send(response.data);
    })
    .catch(error => {
      functions.logger.error(error, { structuredData: true });
      res.send(error);
    });
};

exports.userContributions = functions.https.onRequest((req, res) => {
  var corsFn = cors();
  corsFn(req, res, function () {
    getUserContributions(req, res);
  });
});
