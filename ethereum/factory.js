import web3 from './web3';
import CrowdfundFactory from './build/CrowdfundFactory.json';

const instance =  new web3.eth.Contract(
	JSON.parse(CrowdfundFactory.interface),
	'0x79504209c4593e9e06cdb5a6E33aB0AF0F315C58'
);

export default instance;