const IPFS = require('./ipfs');
const IPFS_HOST = { host: '35.227.93.62', port: '5001', protocol: 'http' };
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('IPFS', () => {

	let _ipfs = new IPFS(IPFS_HOST);

	it('should be connected to a host', () => {
		expect(_ipfs).toHaveProperty(['ipfs', 'provider', 'host'], '35.227.93.62');
	});

	it('should add a content to ipfs', () => {
		return expect(_ipfs.addInfo({test:'test data'}))
			.resolves.toBe('QmfA5xZxUdBTm552E7ujPH73BJhzfPpBA5zpsjtCG5XrAw');
	});

	it('should read a content using a hash', () => {
		return expect(_ipfs.readInfo('QmfA5xZxUdBTm552E7ujPH73BJhzfPpBA5zpsjtCG5XrAw'))
			.resolves.toBe('{\"test\":\"test data\"}');
	});
});