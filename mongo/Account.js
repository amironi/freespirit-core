const { isAdmin } = require("../services/Utils");
const BASE_BALANCE = 0;

class Account {
  constructor() {
    this.accounts = {};
  }

  getAccount(address) {
    if (!this.accounts[address]) {
      this.accounts[address] = { balance: BASE_BALANCE, balanceMc: 0 };
    }

    return this.accounts[address];
  }
}

module.exports = Account;
