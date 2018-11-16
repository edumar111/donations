jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const EthCore = require('./index');
const privateKey = '0xb221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79';
const abi = [{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_comment","type":"string"}],"name":"setComment","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"comment","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"text","type":"string"}],"name":"MyEvent","type":"event"}];
const address = '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a';

describe("EthCore", () => {

	let ethCore = new EthCore('http://35.231.124.87:8545', 'hola');

	it('should be connected to a host', () => {
		expect(ethCore.web3Instance.isConnected()).toBe(true);
	});

	it('should exists an account', () => {
		expect(ethCore.account).not.toBe(null);
		expect(ethCore.account.address).toEqual('0xE9289c9F4292778e023085692105b1C0daBE48b4');
		expect(ethCore.account.privateKey).toEqual(privateKey);
	});

	it('should returns an instance of a contract', () => {
		let contract = ethCore.getInstanceContract(abi, address);
		expect(contract).not.toBe();
		expect().not.toBe(contract);
	});

	it('should returns the balance of an address', (done) => {
		ethCore.getBalanceAddress('0xf1bed8c8a97c536196ec8fA9f3f18c4fFD256633')
			.then(balance => {
				expect(balance).toEqual(jasmine.any(Number));
				done();
			})
			.catch(console.log)
	});

	it('should returns an error of invalid address', (done) => {
		ethCore.getBalanceAddress('asdfjklñ')
			.then()
			.catch(error => {
				expect(error).toEqual(jasmine.any(Error));
				expect(error.message).toEqual('invalid address');
				done();
			});
	});

	it('should generate a private key from a keyphrase', () => {
		let _privatekey = ethCore.generatePrivateKey('hola', false);
		expect(_privatekey).toEqual(privateKey);
		_privatekey = ethCore.generatePrivateKey();
		expect(_privatekey).toEqual('0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
	});

	it('should set a new private key in the library', () => {
		ethCore.setPrivateKey(privateKey);
		expect(ethCore.privateKey).toEqual(privateKey);
		expect(ethCore.setPrivateKey).toThrow('invalid private key or the length does not correspond to a private key');
	});

	it('should returns the private key in the library', () => {
		expect(ethCore.getPrivateKey()).toEqual(privateKey);
	});

	it('should change the current provider in the library', () => {
		ethCore.changeProvider('http://127.0.0.1:8545');
		expect(ethCore.currentProvider.host).toEqual('http://127.0.0.1:8545');
		ethCore.changeProvider();
		expect(ethCore.currentProvider.host).toEqual('http://localhost:8545');
	});

});