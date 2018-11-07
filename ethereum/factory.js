import web3 from './web3';
import CrowdfundFactory from './build/CrowdfundFactory.json';

const instance =  new web3.eth.Contract(
	JSON.parse(CrowdfundFactory.interface),
	'0x04f16781c46F8fa8D759561B6713fb89B8701b7A'
);

export default instance;