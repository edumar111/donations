 
import DigitalIdentity from 'digital-identity';
const HOST_BLOCKCHAIN = "http://35.231.124.87:8545";

const KEY_PHRASE      = "donation2018";
const HOST_IPFS       = { host: '35.227.93.62', port: '5001', protocol: 'http' };
const TYPE_HOST       = "geth";
export const IdentityFactory = new DigitalIdentity(HOST_BLOCKCHAIN,KEY_PHRASE,HOST_IPFS,TYPE_HOST);