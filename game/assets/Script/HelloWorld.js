const Web3 = require('web3.min');
const GAS_PRICE_DEFAULT = '20000000000';

cc.Class({
  extends: cc.Component,

  properties: {
    currentValueLabel: {
      default: null,
      type: cc.Label,
    },
    addressLabel: {
      default: null,
      type: cc.Label,
    },
    balanceLabel: {
      default: null,
      type: cc.Label,
    },
    inputBox: cc.EditBox,
    contractABI: cc.JsonAsset,
  },

  onLoad: function () {
    this.web3 = null;
    this.web3Provider = null;
    this.web3ProviderName = 'metamask';
    this.contract = null;
    this.currentValue = 0;
    this.address = '0x';
    this.balance = 0;
    this.addressLabel.string = 'Address: ' + this.address;
    this.balanceLabel.string = 'Balance: ' + this.currentValue;

    this.updateCurrentValue(0);

    this.initWeb3();
  },

  initWeb3() {
    const isWeb3Enabled = () => !!window.web3;
    if (isWeb3Enabled()) {
      this.web3 = new Web3();

      //Request account access for modern dapp browsers
      if (window.ethereum) {
        this.web3Provider = window.ethereum;
        this.web3.setProvider(this.web3Provider);
        window.ethereum
          .enable()
          .then(accounts => {
            this.initAccount();
          })
          .catch(error => {
            console.error(error);
          });
      }
      //Request account access for legacy dapp browsers
      else if (window.web3) {
        this.web3Provider = window.web3.currentProvider;
        this.web3.setProvider(this.web3Provider);

        this.initAccount();
      }
    } else {
      console.error('You must enable and login into your Wallet or MetaMask accounts!');
    }
  },
  initAccount() {
    this.web3.eth.getAccounts().then(accounts => {
      if (accounts.length > 0) {
        this.address = accounts[0].toLowerCase();
        this.addressLabel.string = 'Address: ' + this.address;
        this.initContract();
        this.updateBalance();
      } else console.error('You must enable and login into your Wallet or MetaMask accounts!');
    });
  },

  initContract() {
    let contractAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    this.contract = new this.web3.eth.Contract(this.contractABI.json.abi, contractAddress);
  },

  updateBalance() {
    this.web3.eth.getBalance(this.address, (err, balance) => {
      if (err) {
        console.error(err);
        return;
      }
      this.balanceLabel.string = cc.js.formatStr('Balance: %d ETH', parseInt(this.web3.utils.fromWei(balance)));
    });
  },

  getValue() {
    this.contract.methods
      .get()
      .call({
        from: this.address,
      })
      .then(val => {
        this.updateCurrentValue(val);
        // console.log('get current value: ', val);
      });
  },

  setValue() {
    this.contract.methods
      .set(this.inputBox.string)
      .send({
        from: this.address,
        gas: 2500000,
        gasPrice: GAS_PRICE_DEFAULT,
      })
      .on('transactionHash', hash => {
        // console.log('transactionHash: ', hash);
      })
      .on('receipt', receipt => {
        this.getValue();
      })
      .on('error', error => {
        console.error('endgame error: ', error);
      });
  },

  updateCurrentValue(value) {
    this.currentValueLabel.string = 'Current Value: ' + value;
  },
});
