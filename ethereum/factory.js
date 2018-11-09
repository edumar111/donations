import web3 from './web3';
import CrowdfundFactory from './build/CrowdfundFactory.json';

const instance =  new web3.eth.Contract(
	JSON.parse(CrowdfundFactory.interface),
	'0x1Fb36803EDF548b64A68a54Ced0d8cB535f28398'
);

export default instance;