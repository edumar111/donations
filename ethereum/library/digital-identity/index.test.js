const DigitalIdentity = require('./index');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('DigitalIdentity', () => {

	let digitalIdentity = new DigitalIdentity('http://35.231.124.87:8545', 'hola');

	it('generates a private key', () => {
		let privateKey = digitalIdentity.generateNewPrivateKey('hola', false);
		expect(privateKey).toEqual('0xb221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79');
	});

	it('makes login', () => {
		return expect(digitalIdentity.login('testflight', '123456'))
			.resolves.toHaveProperty(['profile', '@id'], 'did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF');
	});

	it('makes login with a non-registered user', () => {
		return expect(digitalIdentity.login('00000', '123456'))
			.rejects.toBe('user not exists');
	});

	it('makes login with a private key', () => {
		return expect(digitalIdentity.loginWithPrivateKey('testflight', '0xb221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79'))
			.resolves.toHaveProperty('profile');
	});

	it('determines if an address is owner of a proxy contract', () => {
		return expect(digitalIdentity.isOwner('did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF', '0x189cf6d846793613ae8af2f11190f28fdbaed905'))
			.resolves.toBe(false);
	});

	it('searchs a did by document', () => {
		return expect(digitalIdentity.searchDidByDocument('testflight'))
			.resolves.toHaveProperty('did', 'did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF');
	});

	it('searchs a profile using Did, mnid or address', () => {
		return expect(digitalIdentity.searchProfile('did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF'))
			.resolves.toHaveProperty('@id', 'did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF');
	});

	it('fails creating an existing identity', () => {
		return expect(digitalIdentity.createIdentityPerson({name:'testflight'}, 'testflight', 'keyPhrase'))
			.rejects.toBe('user_exists');
	});

	it('stamps a document by its hash', () => {
		return expect(digitalIdentity.stampDocument('0xf3df6bcb01e3dca7ef25d9fbed975054558bd015', 'test'))
			.resolves.toBe(1539203915);
	});

	it('returns the timestamp of a stamped document', () => {
		return expect(digitalIdentity.getTimestampStampedDocument('0xf3df6bcb01e3dca7ef25d9fbed975054558bd015', 'test'))
			.resolves.toBe(1539203915);
	});

	it('shares information to a private key', () => {
		digitalIdentity.ethCore.setPrivateKey('0xb221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79');
		return expect(digitalIdentity.shareInformation('0x189cf6d846793613ae8af2f11190f28fdbaed905', { data: 'foo', algorithm: 'RSA'}, 'did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF'))
			.resolves.toHaveProperty('transactionHash');
	});

	it('verifies information', () => {
		digitalIdentity.ethCore.setPrivateKey('0xb221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79');
		return expect(digitalIdentity.verifyData('{"@type":"Proof","subject":"did:ev:test","attributes":{"name":"test"}}', 'did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF', '0x0f6487d9640f4230e09d0c2c0ef8b2bef6592573'))
			.resolves.toHaveProperty('transactionHash');
	});

	it('get verifications of certain information', () => {
		return expect(digitalIdentity.getVerifications('{"@type":"Proof","subject":"did:ev:test","attributes":{"name":"test"}}'))
			.resolves.toHaveProperty(['0', 'did'], 'did:ev:2ui1XPRka8ExwmF8oJhQ6qZbqs1XGAQ2yuF');
	});

	/*it('creates an identity using an identity manager', () => {
		return expect(digitalIdentity.createIdentityPersonIdentityManager({"@type":"Person","sameAs":"did:ev:username:test04", "name":{"givenName":"test","familyName":"test04"}}, 'test04', 'test04:a:', '0x54bbe069cf9583792b80041363c4f8078a975e70'))
			.resolves.toHaveProperty('did');
	});*/

});