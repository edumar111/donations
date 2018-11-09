const assert 	=	require('assert');
const ganache	=	require('ganache-cli');
const Web3		= 	require('web3');
const web3		= new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CrowdfundFactory.json');
const compliedCrowfund = require('../ethereum/build/Crowdfund.json');

let accounts;
let factory;
let crowfundAddress;
let crowfund;

beforeEach(async() =>{
	accounts = await web3.eth.getAccounts();

	factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
	.deploy({data: compiledFactory.bytecode})
	.send({from:accounts[0], gas:'2721975'});

	await factory.methods.createCrowdfund('20000000000000000','test01')
	.send({from:accounts[0], gas:'2721975'});

	const crowfunds = await factory.methods.getDeployedCrowdfunds().call();
	crowfundAddress = crowfunds[0];
	//esto es lo mismo
	//[crowfundAddress] = await factory.methods.getDeployedCrowdfunds().call();

	crowfund = await new web3.eth.Contract(
		JSON.parse(compliedCrowfund.interface),
		crowfundAddress[0]
		);
});

describe('Crowfund',()=>{
	it('deploy a factory and Crowfund', () => {
		assert.ok(factory.options.address);
		assert.ok(factory.options.address);
	});

	it('marks caller as the Crowfund owner', async () => {
		const owner = await crowfund.methods.owner().call();
		assert.equal(accounts[0], owner);

	});
	it('validate the name of Crowfund ', async () => {
		let crowfundNames;
		const crowfunds = await factory.methods.getDeployedCrowdfunds().call();
		crowfundNames = crowfunds[1];

		//const nameCrowdfund = await crowfund.methods.nameCrowdfund().call();
		assert.equal('test01', web3.utils.hexToUtf8(crowfundNames[0]));

	});
	it('allows people to contribute money and marks them as approvers', async () => {
		await crowfund.methods.contribute().send({
			value:'20000000000000001',
			from:accounts[1]
		});

		const isContributor = await crowfund.methods.approvers(accounts[1]).call();
		assert(isContributor);
	});

	it('requires a minimun contibution',async () => {
		try{
			await crowfund.methods.contribute().send({
				value:'20000000000000',
				from:accounts[1]
			});
			assert(false);
		}catch(err){
			assert(err);
		}
	});

	it('allows a owner to make a payment expenditure', async () =>{
		await crowfund.methods
		.requestExpenditure('Buy batteries','10000000000000', accounts[1])
		.send({
			from:accounts[0],
			gas:'1000000'
		}) ;
		const expenditure = await crowfund.methods.expenditures(0).call();
		
		assert.equal('Buy batteries',expenditure.description);

	});

	it('proocesses expenditure', async() => {
		let balance1 = await web3.eth.getBalance(accounts[1]);
		balance1 = web3.utils.fromWei(balance1,'ether');
		balance1 = parseFloat(balance1);
		console.log(balance1);

		await crowfund.methods.contribute().send({
			from: accounts[0],
			value: web3.utils.toWei('10','ether')
		});

		await crowfund.methods
		.requestExpenditure('Buy cables',web3.utils.toWei('5','ether'), accounts[1])
		.send({
			from:accounts[0],
			gas:'1000000'
		});

		await crowfund.methods.approveExpentidure(0).send({
			from:accounts[0],
			gas:'1000000'
		});

		await crowfund.methods.finalizeExpentidure(0).send({
			from:accounts[0],
			gas:'1000000'
		});

		let balance2 = await web3.eth.getBalance(accounts[1]);
		balance2 = web3.utils.fromWei(balance2,'ether');
		balance2 = parseFloat(balance2);
		console.log(balance2);

		assert(balance2 > balance1);

	});


});