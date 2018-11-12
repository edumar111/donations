 import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // We are in the browser and metamask is running.
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server *OR* the user is not running metamask
  // https://rinkeby.infura.io/v3/d28d067b389343e493fc51a68c8c38ef
  // http://35.231.124.87:8545
  const provider = new Web3.providers.HttpProvider(
    'http://35.231.124.87:8545'
  );
  web3 = new Web3(provider);
}


export default web3;