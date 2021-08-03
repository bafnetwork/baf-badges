const configs = require('../config.json');
const inquirer = require('inquirer');
let exec = require('child_process').exec,
  child;
const dotenv = require('dotenv');

function main() {
  if (process.argv.length < 3) {
    console.log(
      'Please add the environment, dev, test, or prod, in the CLI args in the form of \n\n node deploy.js [env]'
    );
    return;
  }
  const envType = process.argv[2];
  dotenv.config({
    path: `../env/.env.${envType}`,
  });
  child = exec(
    `near deploy --wasmFile=o --contractName=${configs.contractName} --networkId=${process.env.NETWORK_ID}`,
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    }
  );
}

main();
