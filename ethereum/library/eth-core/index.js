"use strict";

const Web3 = require("web3");
const Web3Utils = require("web3-utils");
const Tx = require("ethereumjs-tx");
const EthLib = require("eth-lib");
const SolidityEvent = require("web3/lib/web3/event.js");
const CryptoJS = require("crypto-js");
const IPFS = require("./ipfs");

/**
 * @constructs
 * @param {string} host - Host address
 * @param {string} keyPhrase - Text from which the private key will be derived
 */
function EthCore(host, keyPhrase, typeHost = 'geth') {
  if (!host || !keyPhrase) {
    throw "required parameter in constructor";
  }
  this.privateKey = EthCore.prototype.generatePrivateKey(keyPhrase);
  this.typeHost = typeHost;
  setProvider.call(this, host);
  setInstance.call(this);
}

/**
 * @description Modify the host to which web3js connects
 * @param {string} host - Host address
 */
function setProvider(host, timeout = 30000) {
  this.currentProvider = new Web3.providers.HttpProvider(host, timeout);
}

/**
 * @description Create a new instance of web3 with the current provider and create a default account
 */
function setInstance() {
  let web3 = new Web3(this.currentProvider);
  this.web3Instance = web3;
  this.web3Instance['utils'] = Web3Utils;
  createAccount.call(this);
}

/**
 * @description Create the object account. This contains privatekey, address and a function to sign transactions
 */
function createAccount() {
  this.account = EthLib.account.fromPrivate(this.privateKey);
  this.account["signTransaction"] = rawTx => {
    let tempPrivateKey = this.privateKey;
    if (tempPrivateKey.startsWith("0x")) {
      tempPrivateKey = tempPrivateKey.substring(2);
    }
    let pk = Buffer.from(tempPrivateKey, "hex");
    let tx = new Tx(rawTx);
    tx.sign(pk);
    let serializedTx = tx.serialize();
    return "0x" + serializedTx.toString("hex");
  };
}

/**
 * @description Update the provider of the actual instance of web3
 * @param {string} host - Host address
 */
EthCore.prototype.changeProvider = function(host) {
  setProvider.call(this, host);
  this.web3Instance.setProvider(this.currentProvider);
};

/**
 * @description Return an instance of a contract
 * @param {object} abi - Json with the contract's ABI
 * @param {string} address - Address of the smart contract deployed
 * @return {object}
 */
EthCore.prototype.getInstanceContract = function(abi, address) {
  let contract = this.web3Instance.eth.contract(abi);
  let contractInstance = contract.at(address);
  return contractInstance;
};

/**
 * @description Instantiate a Contract
 * if address is null is refers to ProxyContract
 * else refers to IdContract
 * @param {object} abi - Application Binary Interface of the contract
 * @param {string} bytecode - Bytecode of the contract
 * @param {string} address - Address of the ProxyContract
 * @return {string} - Encoded contract's information to deploy
 */
EthCore.prototype.instanceContractData = function(abi, bytecode, address) {
  const contract = this.web3Instance.eth.contract(abi);
  let instance = contract.new.getData(address, {
    data: bytecode
  });
  return instance.includes("0x") ? instance : "0x" + instance;
};

/**
 * @description Return a balance of an address in wei
 * @param {string} address - Address to be consulted
 * @return {Promise} Number with the balance of the address
 */
EthCore.prototype.getBalanceAddress = function(address) {
  return new Promise((resolve, reject) => {
    this.web3Instance.eth.getBalance(address, (error, balance) => {
      if (error) {
        reject(error);
      } else {
        resolve(balance.toNumber());
      }
    });
  });
};

/**
 * @description Send balance to an account from accounts[0]
 * @param {string} address - Address to be consulted
 * @param {number} value - Value to recharge
 * @return {Promise} Number with the balance of the address
 */
EthCore.prototype.sendBalanceAddress = function(address, value = 1) {
  return new Promise((resolve, reject) => {
    this.web3Instance.eth.getAccounts((error, accounts) => {
      if (error) {
        reject(error);
      } else {
        if (accounts.length > 0) {
          this.web3Instance.eth.sendTransaction({from: accounts[0], to: address, value: this.web3Instance.toWei(value, 'ether')}, (error, txHash) => {
            if (error) {
              reject(error);
            } else {
              waitForTransactionReceipt.call(this, txHash)
                .then(response => EthCore.prototype.getBalanceAddress(address))
                .then(resolve)
                .catch(reject);
            }
          });
        } else {
          reject('there is not accounts');
        }
      }
    });
  });
};

/**
 * @description Generate a private key from a keyphrase
 * @param {string} keyPhrase - Text from which the private key will be derived
 * @return {string}
 */
EthCore.prototype.generatePrivateKey = function(keyPhrase = "") {
  return "0x" + CryptoJS.SHA256(keyPhrase).toString(CryptoJS.enc.Hex);
};

/**
 * @description Set the private key and create an account
 * @param {string} privateKey - String with the private key to use
 */
EthCore.prototype.setPrivateKey = function(privateKey) {
  if (privateKey && privateKey.length == 66 && privateKey.startsWith("0x")) {
    this.privateKey = privateKey;
    createAccount.call(this);
  } else {
    throw "invalid private key or the length does not correspond to a private key";
  }
};

/**
 * @description Returns the corresponding address to a private key
 * @param {string} privatekey - Private key to convert
 * @return {string}
 */
EthCore.prototype.privateToAddress = function(privatekeyInput) {
  if (
    privatekeyInput &&
    privatekeyInput.length == 66 &&
    privatekeyInput.startsWith("0x")
  ) {
    return EthLib.account.fromPrivate(privatekeyInput).address;
  } else {
    throw "invalid private key or the length does not correspond to a private key";
  }
};

/**
 * @description Return the actual private key
 * @return {string}
 */
EthCore.prototype.getPrivateKey = function() {
  return this.privateKey;
};

/**
 * @description Return a random string hash
 * @return {string}
 */
EthCore.prototype.generateSalt = function() {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

/**
 * @description Deploy a transaction on the network using a private key for the signature
 * @param {string} data - String with the Bytecode corresponding to the action to be performed in the blockchain
 * @param {string} contractAddress - Optional, address of the contract with which you are going to interact
 * @param {number} value - Optional, Value in wei to send
 * @return {Promise} Hash of the mined transaction
 */
EthCore.prototype.deployTransaction = function(data, contractAddress = null, value = 0) {
  return new Promise((resolve, reject) => {
    var rawTx;
    constructRawTransaction
      .call(this, data, contractAddress, value)
      .then(_rawTx => {
        rawTx = _rawTx;
        return signTx.call(this, _rawTx);
      })
      .then(txSigned => sendSignedTransaction.call(this, txSigned))
      .then(txHash => {
        try {
          waitForTransactionReceipt.call(this, txHash)
            .then(response => {
              resolve(response);
            })
            .catch(reject);
        } catch (error) {
          reject(error);
        }
      })
      .catch(error => {
        if (error.message == 'replacement transaction underpriced') {
          let newGasPrice = Math.round(Number(this.web3Instance.toBigNumber(rawTx.gasPrice)) * 1.4);
          rawTx.gasPrice = this.web3Instance.toHex(newGasPrice);
          let txSigned = signTx.call(this, rawTx);
          sendSignedTransaction.call(this, txSigned)
            .then(txHash => {
              try {
                waitForTransactionReceipt.call(this, txHash)
                  .then(resolve)
                  .catch(reject);
              } catch (error) {
                reject(error);
              }
            })
            .catch(reject)
        } else {
          reject(error);
        }
      });
  });
};

/**
 * @description Deploy an array of transactions on the network using a private key for the signature
 * @param {array} data - Array of transactions to be executed
 * @param {string} contractAddress - Optional, address of the contract with which you are going to interact
 * @param {number} value - Optional, Value in wei to send
 * @return {Promise}
 */
EthCore.prototype.deployBatchTransactions = function(data, contractAddress = null, value = 0) {
  return new Promise((resolve, reject) => {
    if (data && typeof data == 'object') {
      var batch = this.web3Instance.createBatch();
      var rawTx = {};
      constructRawTransaction.call(this, data[0], contractAddress, value)
        .then(_rawTx => {
          rawTx = _rawTx;
          let signedTx = signTx.call(this, rawTx);
          batch.add(this.web3Instance.eth.sendRawTransaction.request(signedTx));
          for (let index = 1; index < data.length; index++) {
            let newNonce = Number(this.web3Instance.toBigNumber(rawTx.nonce)) + 1;
            rawTx.nonce = this.web3Instance.toHex(newNonce);
            rawTx.data = data[index];
            if (this.typeHost != 'quorum') {
              rawTx.gas = this.web3Instance.toHex(4700000);
            }
            let signedTx = signTx.call(this, rawTx);
            batch.add(this.web3Instance.eth.sendRawTransaction.request(signedTx));
          }
          batch.execute();
          resolve(batch);
        })
        .catch(reject);
    } else {
      reject('invalid data parameter. Should be an array of transactions')
    }
  });
};

/**
 * @description Returns a raw transaction to be send to the blockchain
 * @param {string} data - String with the Bytecode corresponding to the action to be performed in the blockchain
 * @param {string} addressTo - Optional, address of the contract with which you are going to interact
 * @param {number} value - Optional, Value in wei to send
 * @return {Promise} Transaction object
 */
function constructRawTransaction(data, addressTo, value = 0) {
  return new Promise((resolve, reject) => {
    resolveWeb3Params.call(this)
      .then(([transactionCount, gasPrice, block, networkId]) => {
        var nonceHex = this.web3Instance.toHex(transactionCount);
        var gasPriceHex = this.web3Instance.toHex(gasPrice);
        var gasLimitHex = this.web3Instance.toHex(block.gasLimit);
        var valueHex = this.web3Instance.toHex(value);
        var networkIdHex = this.web3Instance.toHex(networkId);
        // construct the object raw
        var rawTx = {
          nonce: nonceHex,
          gasPrice: gasPriceHex,
          gasLimit: gasLimitHex,
          value: valueHex,
          data: data,
          from: this.account.address
        };
        if (this.typeHost != 'quorum') {
          rawTx['chainId'] = networkIdHex;
        }
        // if it is not to deploy then add the smart contract address
        if (addressTo) rawTx["to"] = addressTo;
        if (this.typeHost != 'quorum') {
          estimateGas.call(this, rawTx)
            .then(gas => {
              rawTx["gas"] = this.web3Instance.toHex(gas);
              resolve(rawTx);
            })
            .catch(reject);
        } else {
          rawTx['gas'] = this.web3Instance.toHex(10000000);
          resolve(rawTx);
        }
      })
      .catch(error => {
        reject(error)
      });
  });
}

/**
 * @description Send a signed transaction to the network
 * @param {string} signedTx - String with the signed transaction
 * @return {Promise} Hash of the transaction
 */
function sendSignedTransaction(signedTx) {
  return new Promise((resolve, reject) => {
    this.web3Instance.eth.sendRawTransaction(signedTx, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

/**
 * @description Wait up to 30 seconds for the transaction to be mined
 * @param {string} txHash - Transaction hash
 * @return {Promise} Hash of the mined transaction
 */
function waitForTransactionReceipt(txHash, _tries = 30) {
  return new Promise((resolve, reject) => {
    var tries = _tries;
    var interval = setInterval(() => {
      this.web3Instance.eth.getTransactionReceipt(
        txHash,
        (error, txReceipt) => {
          if (error) {
            clearInterval(interval);
            reject(error);
          } else {
            if (
              txReceipt &&
              txReceipt["transactionHash"] == txHash &&
              txReceipt["blockNumber"]
            ) {
              clearInterval(interval);
              resolve(txReceipt);
            } else {
              if (tries > 0) {
                tries--;
              } else {
                clearInterval(interval);
                reject(txReceipt);
              }
            }
          }
        }
      );
    }, 1000);
  });
}

/**
 * @return {Promise} Arrangement with the parameters nonce, gas price, last block and network id
 */
function resolveWeb3Params() {
  return new Promise((resolve, reject) => {
    var params = [];
    this.web3Instance.eth.getTransactionCount(
      this.account.address,
      (error, txCount) => {
        if (error) {
          reject(error);
        } else {
          params.push(txCount);
          this.web3Instance.eth.getGasPrice((error, gasPrice) => {
            if (error) {
              reject(error);
            } else {
              params.push(gasPrice);
              this.web3Instance.eth.getBlock("latest", (error, block) => {
                if (error) {
                  reject(error);
                } else {
                  params.push(block);
                  this.web3Instance.version.getNetwork((error, networkId) => {
                    if (error) {
                      reject(error);
                    } else {
                      params.push(networkId);
                      resolve(params);
                    }
                  });
                }
              });
            }
          });
        }
      }
    );
  });
}

/**
 * @description Sign a transaction object with actual private key
 * @param {object} rawTx - Object with the transaction to be sign
 * @return {string} Signed transaction
 */
function signTx(rawTx) {
  return this.account.signTransaction(rawTx);
}

/**
 * @description Calculate the gas needed to deploy the transaction object
 * @param {object} rawTx - Object with the transaction to be deploy
 * @return {Promise} It be the gas value to deploy this transaction on the blockchain
 */
function estimateGas(rawTx) {
  return new Promise((resolve, reject) => {
    this.web3Instance.eth.estimateGas(rawTx, (error, gas) => {
      if (error) {
        reject(error);
      } else {
        resolve(gas);
      }
    });
  });
}

/**
 * @description Filter events on the network
 * @param {array} topics - Arranging strings with each of the event search filters
 * @param {array} abi - Arrangement that contains the object corresponding to the abi of the contract
 * @param {object} options - Object with the search range
 * @return {array} Arrangement with the logs found
 */
EthCore.prototype.filterEvent = function(
  topics = [],
  abi = null,
  options = { fromBlock: 0, toBlock: "latest" }
) {
  return new Promise((resolve, reject) => {
    let topicsFormatted = topics.map(topic => {
      if (typeof topic == "string" && topic.startsWith("0x")) {
        return topic;
      } else {
        return this.web3Instance.sha3(topic);
      }
    });
    let filter = { fromBlock: options.fromBlock, toBlock: options.toBlock };
    if (topics) {
      filter["topics"] = [...topicsFormatted];
    }
    let web3filter = this.web3Instance.eth.filter(filter);

    web3filter.get((error, logs) => {
      if (error) {
        reject(error);
      } else {
        if (abi) {
          let newLogs = logParser(logs, abi);
          resolve(newLogs);
        } else {
          resolve(logs);
        }
      }
    });
  });
};

/**
 * @description Filter events for a specific contract
 * @param {object} contract - Object with the address of the intelligent contract, its corresponding ABI and the event to be searched (optional)
 * @param {object} topics - Object with each of the search filters according to the parameters of the event
 * @param {object} options - Object with the search range
 * @return {array} Arrangement with the logs found
 */
EthCore.prototype.filterEventContract = function(
  contract = { abi: null, address: null, eventName: null },
  topics = {},
  options = { fromBlock: 0, toBlock: "latest" }
) {
  return new Promise((resolve, reject) => {
    if (contract.address && contract.abi) {
      let smartContractInstance = this.getInstanceContract(
        contract.abi,
        contract.address
      );
      let filter = { fromBlock: options.fromBlock, toBlock: options.toBlock };
      let search = "allEvents";
      let eventToFilter;
      if (contract.eventName) {
        search = contract.eventName;
        if (!smartContractInstance[search])
          reject("there is no definition of the event in the abi");
        eventToFilter = smartContractInstance[search](topics, filter);
      } else {
        eventToFilter = smartContractInstance[search](filter);
      }
      eventToFilter.get((error, eventResult) => {
        if (error) reject(error);
        else resolve(eventResult);
      });
    } else {
      reject("required parameters ABI and address in contract's object");
    }
  });
};

/**
 * @description Format the logs by adding the args key with each of the parameters of the event
 * @param {array} logs - Arrangement of objects with each of the logs
 * @param {array} abi - Arrangement with the ABI definition of the contract
 * @return {array} Arrangement with the formatted logs
 */
function logParser(logs, abi) {
  // pattern similar to lib/web3/contract.js:  addEventsToContract()
  var decoders = abi
    .filter(function(json) {
      return json.type === "event";
    })
    .map(function(json) {
      // note first and third params required only by enocde and execute;
      // so don't call those!
      return new SolidityEvent(null, json, null);
    });

  return logs.map(function(log) {
    return decoders
      .find(function(decoder) {
        return decoder.signature() == log.topics[0].replace("0x", "");
      })
      .decode(log);
  });
}

/**
 * @description Convert a hex string to Utf8
 * @param {string} hex - Hex to convert
 * @return {string}
 */
EthCore.prototype.toAscii = function (hex) {
  return this.web3Instance.utils.hexToUtf8(hex);
}

/**
 * @description Return an IPFS instance
 * @param {object} connection - Object with connection params: Host, protocol and port
 * @return {object}
 */
EthCore.prototype.Ipfs = function(connection) {
  return new IPFS(connection);
};

module.exports = EthCore;