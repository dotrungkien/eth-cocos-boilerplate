const Web3 = require('web3.min');

cc.Class({
  extends: cc.Component,

  properties: {
    currentValueLabel: {
      default: null,
      type: cc.Label
    },
    addressLabel: {
      default: null,
      type: cc.Label
    },
    balanceLabel: {
      default: null,
      type: cc.Label
    },
    ContractABI: cc.JsonAsset
  },

  onLoad: function() {
    this.Web3 = null;
    this.Web3Provider = null;
    this.Web3ProviderName = 'metamask';
    this.Contract = null;
    this.NetworkID = '123456789';
    this.currentValue = 0;
    this.address = '0x';
    this.balance = 0;
    this.currentValueLabel.string = 'Current Value: ' + this.currentValue;
    this.addressLabel.string = 'Address: ' + this.address;
    this.balanceLabel.string = 'Balance: ' + this.currentValue;
  },

  initWeb3() {
    const isWeb3Enabled = () => !!window.web3;
    if (isWeb3Enabled()) {
      this.Web3 = new Web3();

      //Request account access for modern dapp browsers
      if (window.ethereum) {
        this.Web3Provider = window.ethereum;
        this.Web3.setProvider(this.Web3Provider);
        window.ethereum
          .enable()
          .then(accounts => {
            this.initAccount();
            // this.initContract();
          })
          .catch(error => {
            console.error(error);
          });
      }
      //Request account access for legacy dapp browsers
      else if (window.web3) {
        this.Web3Provider = window.web3.currentProvider;
        this.Web3.setProvider(this.Web3Provider);

        this.initAccount();
        // this.initContract();
      }
    } else {
      console.error('You must enable and login into your Wallet or MetaMask accounts!');
    }
  },
  initAccount() {
    this.Web3.eth.getAccounts().then(accounts => {
      if (accounts.length > 0) {
        this.address = accounts[0].toLowerCase();
        this.addressLabel.string = 'Address: ' + this.address;
        this.initContract();
        this.updateBalance();
      } else console.error('You must enable and login into your Wallet or MetaMask accounts!');
    });
  },

  initContract() {
    let networks = { main: '1', ropsten: '3', kovan: '42', rinkeby: '4' };
    this.Web3.eth.net.getNetworkType().then(netId => {
      this.Contract = new this.Web3.eth.Contract(
        this.ContractABI.json.abi,
        // this.ContractABI.json.networks[networks[netId]].address
        this.ContractABI.json.networks['123456789'].address
      );
    });
  },

  updateBalance() {
    this.Web3.eth.getBalance(this.address, (err, balance) => {
      if (err) {
        console.error(err);
        return;
      }
      this.balanceLabel.string = 'Balance: ' + balance;
    });
  }
});
