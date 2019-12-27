const SimpleStore = artifacts.require('SimpleStore');

module.exports = function(deployer) {
  deployer.deploy(SimpleStore);
};
