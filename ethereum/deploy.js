const HDWalletProvider =  require("truffle-hdwallet-provider");
const Web3 = require('web3');
const  compiledFactory = require('./build/CrowdfundFactory.json');
var mnemonic = 'brand tail can skill write cash order dad robot omit history clay';
const provider = new HDWalletProvider(
	mnemonic,
	"https://rinkeby.infura.io/v3/d28d067b389343e493fc51a68c8c38ef");

const web3 = new Web3(provider);

const deploy = async () =>{
	 const accounts = await web3.eth.getAccounts();
	 console.log('Attempting to deploy from account', accounts[0]);
	 let balance1 = await web3.eth.getBalance(accounts[0]);
		balance1 = web3.utils.fromWei(balance1,'ether');
		balance1 = parseFloat(balance1);
		console.log(balance1);

	 const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
	 .deploy({data:compiledFactory.bytecode})
	 .send({gas:'991854',from:accounts[0]});
	 //console.log(compiledFactory.interface);
	 console.log('Constract deployed to', result.options.address);	 
};
deploy();
