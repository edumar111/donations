import web3 from './web3';
import CrowdfundFactory from './build/CrowdfundFactory.json';

const instance =  new web3.eth.Contract(
	JSON.parse(CrowdfundFactory.interface),
	'0xEDE5Db57C80Ae424BC757b56a970b3F6C9Ba7fAb'
);

export default instance;