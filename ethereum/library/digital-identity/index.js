'use strict'

const EthCore = require('eth-core');
const mnid = require('mnid');
const CryptoJS = require('crypto-js');
 const fetch = require('node-fetch'); // Only for NodeJs
//require('isomorphic-fetch');


//Contracts
const proxyAbi = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"owners","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newId","type":"address"}],"name":"setId","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"addOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"ABI_URL","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"id","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounce","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"destination","type":"address"},{"name":"value","type":"uint256"},{"name":"data","type":"bytes"}],"name":"forward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"firstOwner","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"destination","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Forwarded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"id","type":"address"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oldId","type":"address"},{"indexed":true,"name":"newId","type":"address"}],"name":"Upgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Received","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"formerOwner","type":"address"}],"name":"OwnerRemoved","type":"event"}];
const proxyByteCode = "0x6080604052606060405190810160405280603481526020017f697066733a2f516d636d4b7750664d584536613966654459657637776943454281526020017f517974376352454644354176774469355a3973430000000000000000000000008152506001908051906020019061007692919061018a565b506000600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055503480156100c557600080fd5b50604051602080610aea833981018060405281019080805190602001909291905050508060016000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508073ffffffffffffffffffffffffffffffffffffffff167f994a936646fe87ffe4f1e469d3d6aa417d6b855598397f323de5b449f765f0c360405160405180910390a2505061022f565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106101cb57805160ff19168380011785556101f9565b828001600101855582156101f9579182015b828111156101f85782518255916020019190600101906101dd565b5b509050610206919061020a565b5090565b61022c91905b80821115610228576000816000905550600101610210565b5090565b90565b6108ac8061023e6000396000f30060806040526004361061008e576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063022914a7146100de5780632cb41958146101395780632f54bf6e1461017c5780637065cb48146101d7578063a2d1183a1461021a578063af640d0f146102aa578063b15be2f514610301578063d7f31eb914610318575b3373ffffffffffffffffffffffffffffffffffffffff167f88a5966d370b9919b20f3e2c13ff65706f196a4e32cc2c12bf57088f88525874346040518082815260200191505060405180910390a2005b3480156100ea57600080fd5b5061011f600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506103ab565b604051808215151515815260200191505060405180910390f35b34801561014557600080fd5b5061017a600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506103cb565b005b34801561018857600080fd5b506101bd600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061049f565b604051808215151515815260200191505060405180910390f35b3480156101e357600080fd5b50610218600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506104f4565b005b34801561022657600080fd5b5061022f6105a5565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561026f578082015181840152602081019050610254565b50505050905090810190601f16801561029c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156102b657600080fd5b506102bf610643565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561030d57600080fd5b50610316610669565b005b34801561032457600080fd5b506103a9600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290505050610719565b005b60006020528060005260406000206000915054906101000a900460ff1681565b6103d43361049f565b15156103df57600080fd5b8073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f5d611f318680d00598bb735d61bacf0c514c6b50e1e5ad30040a4df2b12791c760405160405180910390a380600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b6104fd3361049f565b151561050857600080fd5b60016000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508073ffffffffffffffffffffffffffffffffffffffff167f994a936646fe87ffe4f1e469d3d6aa417d6b855598397f323de5b449f765f0c360405160405180910390a250565b60018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561063b5780601f106106105761010080835404028352916020019161063b565b820191906000526020600020905b81548152906001019060200180831161061e57829003601f168201915b505050505081565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6106723361049f565b151561067d57600080fd5b60008060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055503373ffffffffffffffffffffffffffffffffffffffff167f58619076adf5bb0943d100ef88d52d7c3fd691b19d3a9071b555b651fbf418da60405160405180910390a2565b6107223361049f565b151561072d57600080fd5b8273ffffffffffffffffffffffffffffffffffffffff16828260405180828051906020019080838360005b83811015610773578082015181840152602081019050610758565b50505050905090810190601f1680156107a05780820380516001836020036101000a031916815260200191505b5091505060006040518083038185875af19250505015156107c057600080fd5b8273ffffffffffffffffffffffffffffffffffffffff167fc1de93dfa06362c6a616cde73ec17d116c0d588dd1df70f27f91b500de207c4183836040518083815260200180602001828103825283818151815260200191508051906020019080838360005b83811015610840578082015181840152602081019050610825565b50505050905090810190601f16801561086d5780820380516001836020036101000a031916815260200191505b50935050505060405180910390a25050505600a165627a7a7230582001c29fdb0215d46e36aba32b033f910d1bd1d39749bf4c7725543932292673340029";
const idAbi = [{"constant":false,"inputs":[{"name":"subjectHash","type":"bytes32"},{"name":"claimHash","type":"bytes32"},{"name":"attester","type":"address"}],"name":"revokeClaim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes16"},{"name":"url","type":"string"}],"name":"setProfile","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"key","type":"bytes16"},{"name":"username","type":"string"},{"name":"salt","type":"string"}],"name":"setMnemonic","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes16"}],"name":"keys","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newAdmin","type":"address"}],"name":"setAdmin","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_controller","type":"address"}],"name":"setController","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes16"}],"name":"mnemonics","outputs":[{"name":"username","type":"string"},{"name":"salt","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"url","type":"string"},{"name":"with","type":"address"},{"name":"contentHash","type":"bytes32"}],"name":"shareInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"subjectHash","type":"bytes32"},{"name":"claimHash","type":"bytes32"},{"name":"attester","type":"address"},{"name":"validDays","type":"uint256"}],"name":"attestClaim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes16"}],"name":"profiles","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"controller","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes16"},{"name":"url","type":"string"}],"name":"setKey","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_controller","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"controller","type":"address"}],"name":"ControllerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"name","type":"bytes16"},{"indexed":false,"name":"url","type":"string"}],"name":"ProfileSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes16"},{"indexed":false,"name":"url","type":"string"}],"name":"KeySet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"oldAdmin","type":"address"},{"indexed":false,"name":"newAdmin","type":"address"}],"name":"AdminUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"url","type":"string"},{"indexed":true,"name":"with","type":"address"},{"indexed":true,"name":"contentHash","type":"bytes32"}],"name":"ConsentedShareInfo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"username","type":"string"},{"indexed":false,"name":"from","type":"address"}],"name":"MnemonicSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sourceClaimHash","type":"bytes32"},{"indexed":true,"name":"targetClaimHash","type":"bytes32"},{"indexed":false,"name":"attester","type":"address"},{"indexed":false,"name":"date","type":"uint256"},{"indexed":false,"name":"expDate","type":"uint256"}],"name":"ClaimAttested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sourceClaimHash","type":"bytes32"},{"indexed":true,"name":"targetClaimHash","type":"bytes32"},{"indexed":false,"name":"attester","type":"address"},{"indexed":false,"name":"date","type":"uint256"}],"name":"ClaimRevoked","type":"event"}];
const idByteCode = "0x60806040526000600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555034801561005257600080fd5b506040516020806118368339810180604052810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f79f74fd5964b6943d8a1865abfb7f668c92fa3f32c0a2e3195da7d0946703ad7600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1506116eb8061014b6000396000f3006080604052600436106100c5576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806304c991fa146100ca5780631c7ba19d146101295780632dabac29146101af578063503f396b1461027b578063704b6c021461033457806392eefe9b1461037757806396d1531c146103ba578063c6af3eb5146104df578063d769333514610576578063ead22bee146105df578063f77c479114610698578063f851a440146106ef578063ffc28af714610746575b600080fd5b3480156100d657600080fd5b5061012760048036038101908080356000191690602001909291908035600019169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506107cc565b005b34801561013557600080fd5b506101ad60048036038101908080356fffffffffffffffffffffffffffffffff19169060200190929190803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505091929192905050506108e3565b005b3480156101bb57600080fd5b5061027960048036038101908080356fffffffffffffffffffffffffffffffff19169060200190929190803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290505050610a5b565b005b34801561028757600080fd5b506102b960048036038101908080356fffffffffffffffffffffffffffffffff19169060200190929190505050610c0d565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102f95780820151818401526020810190506102de565b50505050905090810190601f1680156103265780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561034057600080fd5b50610375600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610cbd565b005b34801561038357600080fd5b506103b8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610e16565b005b3480156103c657600080fd5b506103f860048036038101908080356fffffffffffffffffffffffffffffffff19169060200190929190505050610f98565b604051808060200180602001838103835285818151815260200191508051906020019080838360005b8381101561043c578082015181840152602081019050610421565b50505050905090810190601f1680156104695780820380516001836020036101000a031916815260200191505b50838103825284818151815260200191508051906020019080838360005b838110156104a2578082015181840152602081019050610487565b50505050905090810190601f1680156104cf5780820380516001836020036101000a031916815260200191505b5094505050505060405180910390f35b3480156104eb57600080fd5b50610574600480360381019080803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284378201915050505050509192919290803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080356000191690602001909291905050506110ec565b005b34801561058257600080fd5b506105dd60048036038101908080356000191690602001909291908035600019169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611205565b005b3480156105eb57600080fd5b5061061d60048036038101908080356fffffffffffffffffffffffffffffffff19169060200190929190505050611340565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561065d578082015181840152602081019050610642565b50505050905090810190601f16801561068a5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156106a457600080fd5b506106ad6113f0565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156106fb57600080fd5b50610704611416565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561075257600080fd5b506107ca60048036038101908080356fffffffffffffffffffffffffffffffff19169060200190929190803590602001908201803590602001908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050919291929050505061143c565b005b6040805190810160405280600081526020014281525060008085600019166000191681526020019081526020016000206000846000191660001916815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000820151816000015560208201518160010155905050816000191683600019167fedfbdfd15decaf53dd822d2c89ba81f97fc9e7687087a2474398671fbf64ebba8342604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a3505050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561093f57600080fd5b8060036000846fffffffffffffffffffffffffffffffff19166fffffffffffffffffffffffffffffffff19168152602001908152602001600020908051906020019061098c92919061159a565b507f51e5f42496d568b937facdd9d52c03bb59fda23cfb38d9c67b2a25aff8e83c84828260405180836fffffffffffffffffffffffffffffffff19166fffffffffffffffffffffffffffffffff1916815260200180602001828103825283818151815260200191508051906020019080838360005b83811015610a1c578082015181840152602081019050610a01565b50505050905090810190601f168015610a495780820380516001836020036101000a031916815260200191505b50935050505060405180910390a15050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610ab757600080fd5b60408051908101604052808381526020018281525060056000856fffffffffffffffffffffffffffffffff19166fffffffffffffffffffffffffffffffff191681526020019081526020016000206000820151816000019080519060200190610b2192919061161a565b506020820151816001019080519060200190610b3e92919061161a565b50905050816040518082805190602001908083835b602083101515610b785780518252602082019150602081019050602083039250610b53565b6001836020036101000a03801982511681845116808217855250505050505090500191505060405180910390207fa41c7bc01a19a1f2490ea9081f161455757097ccf896b4ef94f6c225efd5e12833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a2505050565b60046020528060005260406000206000915090508054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610cb55780601f10610c8a57610100808354040283529160200191610cb5565b820191906000526020600020905b815481529060010190602001808311610c9857829003601f168201915b505050505081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610d1957600080fd5b7f101b8081ff3b56bbf45deb824d86a3b0fd38b7e3dd42421105cf8abe9106db0b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1682604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a180600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161480610ec057503373ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16145b15610f905780600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f79f74fd5964b6943d8a1865abfb7f668c92fa3f32c0a2e3195da7d0946703ad7600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1610f95565b600080fd5b50565b6005602052806000526040600020600091509050806000018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156110445780601f1061101957610100808354040283529160200191611044565b820191906000526020600020905b81548152906001019060200180831161102757829003601f168201915b505050505090806001018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156110e25780601f106110b7576101008083540402835291602001916110e2565b820191906000526020600020905b8154815290600101906020018083116110c557829003601f168201915b5050505050905082565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561114857600080fd5b80600019168273ffffffffffffffffffffffffffffffffffffffff167fbb3bfbd21aacef758ed76e61cf4f50ebc5bb19d83b86f9dd1f9ebbcd7e9e7f4f856040518080602001828103825283818151815260200191508051906020019080838360005b838110156111c65780820151818401526020810190506111ab565b50505050905090810190601f1680156111f35780820380516001836020036101000a031916815260200191505b509250505060405180910390a3505050565b600080821161121557600061121e565b62015180820242015b905060408051908101604052804281526020018281525060008087600019166000191681526020019081526020016000206000866000191660001916815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000820151816000015560208201518160010155905050836000191685600019167fe663f148e7a26c204f3be67a702302b2a6a577faf8ec7956385786dad984a6e6854285604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001828152602001935050505060405180910390a35050505050565b60036020528060005260406000206000915090508054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156113e85780601f106113bd576101008083540402835291602001916113e8565b820191906000526020600020905b8154815290600101906020018083116113cb57829003601f168201915b505050505081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561149857600080fd5b8060046000846fffffffffffffffffffffffffffffffff19166fffffffffffffffffffffffffffffffff1916815260200190815260200160002090805190602001906114e592919061159a565b50816fffffffffffffffffffffffffffffffff19167f9d4650a66631fd12d4c5721023113148b145e41089a676beb17121c3c2fb55f4826040518080602001828103825283818151815260200191508051906020019080838360005b8381101561155c578082015181840152602081019050611541565b50505050905090810190601f1680156115895780820380516001836020036101000a031916815260200191505b509250505060405180910390a25050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106115db57805160ff1916838001178555611609565b82800160010185558215611609579182015b828111156116085782518255916020019190600101906115ed565b5b509050611616919061169a565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061165b57805160ff1916838001178555611689565b82800160010185558215611689579182015b8281111561168857825182559160200191906001019061166d565b5b509050611696919061169a565b5090565b6116bc91905b808211156116b85760008160009055506001016116a0565b5090565b905600a165627a7a72305820a37fb70df200ed3f58ca5a35036cd7e9ecf8570e661231aa8e8da47df0c223330029";
const attesterAbi = [{"constant":false,"inputs":[{"name":"subjectHash","type":"bytes32"},{"name":"claimHash","type":"bytes32"},{"name":"attester","type":"address"}],"name":"revokeClaim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"subjectHash","type":"bytes32"},{"name":"claimHash","type":"bytes32"},{"name":"attester","type":"address"},{"name":"validDays","type":"uint256"}],"name":"attestClaim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sourceClaimHash","type":"bytes32"},{"indexed":true,"name":"targetClaimHash","type":"bytes32"},{"indexed":false,"name":"attester","type":"address"},{"indexed":false,"name":"date","type":"uint256"},{"indexed":false,"name":"expDate","type":"uint256"}],"name":"ClaimAttested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sourceClaimHash","type":"bytes32"},{"indexed":true,"name":"targetClaimHash","type":"bytes32"},{"indexed":false,"name":"attester","type":"address"},{"indexed":false,"name":"date","type":"uint256"}],"name":"ClaimRevoked","type":"event"}];
const proofOfExistenceAbi = [{"constant":false,"inputs":[{"name":"documentHash","type":"bytes32"}],"name":"stampDocument","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"stamps","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"documentHash","type":"bytes32"}],"name":"DocumentStamped","type":"event"}];
const verificationregistryAbi = [{"constant":false,"inputs":[{"name":"hash","type":"bytes32"},{"name":"validDays","type":"uint256"}],"name":"verify","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"},{"name":"","type":"address"}],"name":"verifications","outputs":[{"name":"iat","type":"uint256"},{"name":"exp","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"}],"name":"revoke","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"hash","type":"bytes32"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"date","type":"uint256"},{"indexed":false,"name":"expDate","type":"uint256"}],"name":"Verified","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"hash","type":"bytes32"},{"indexed":false,"name":"by","type":"address"},{"indexed":false,"name":"date","type":"uint256"}],"name":"Revoked","type":"event"}];
const identitymanagerAbi = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"owners","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"keyMnemonic","type":"bytes16"},{"name":"keyProfile","type":"bytes16"},{"name":"urlProfile","type":"string"},{"name":"username","type":"string"},{"name":"salt","type":"string"}],"name":"createIdentity","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"addOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounce","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"proxyUser","type":"address"},{"name":"newUser","type":"address"}],"name":"recoverAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proxy","type":"address"}],"name":"IdentityCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"proxy","type":"address"},{"indexed":false,"name":"newUser","type":"address"}],"name":"AccountRecovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"username","type":"string"},{"indexed":false,"name":"from","type":"address"}],"name":"MnemonicSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnerAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"formerOwner","type":"address"}],"name":"OwnerRemoved","type":"event"}];
//Constants
const DAS_FAUCET = 'http://35.229.93.156/api/faucet';
const IPFS_HOST = { host: '35.227.93.62', port: '5001', protocol: 'http' };

/**
 * @constructs
 * @param {string} host - Host address of the Ethereum node
 * @param {string} keyPhrase - Text from which the private key will be derived
 * @param {string} ipfsHost - Host address of IPFS
 * @param {string} typeHost - Type of host to use
 */
var DigitalIdentity = function (host, keyPhrase, ipfsHost = IPFS_HOST, typeHost = 'geth') {
  if (!host || !keyPhrase) {
    throw "required parameter in constructor";
  }
  this.ethCore = new EthCore(host, keyPhrase, typeHost);
  this.ipfsCore = this.ethCore.Ipfs(ipfsHost);
}

/**
 * @description Set up a new private key in the library eth-core
 * @param {string} keyPhrase - Text from which the private key will be derived
 * @param {boolean} withSalt - Add or not a salt to the keyphrase
 */
DigitalIdentity.prototype.generateNewPrivateKey = function (keyPhrase, withSalt = true) {
	let salt = (withSalt) ? this.ethCore.generateSalt() : '';
	let privateKey = this.ethCore.generatePrivateKey(keyPhrase+salt);
	this.ethCore.setPrivateKey(privateKey);
	return this.ethCore.getPrivateKey();
}

/**
 * @description Returns a profile for an identity search parameter
 * @param {string} query - Identity search parameter
 * @param {string} password - Password of the user
 * @return {object}
 */
DigitalIdentity.prototype.login = function (query, password) {
	return new Promise((resolve, reject) => {
		var profile;
		var salt;
		var did;
		this.searchDidByDocument(query)
			.then(identity => {
				if (identity.did) {
					did = identity.did;
					return Promise.all([this.searchProfile(identity.did), identity.salt, identity.documentId]);
				} else {
					reject('user not exists');
				}
			})
			.then(([_profile, _salt, documentId]) => {
				let newPrivateKey = this.generateNewPrivateKey(documentId+':'+password+':'+_salt, false);
				let owner = this.ethCore.privateToAddress(newPrivateKey);
				_profile['@id'] = did;
				profile = _profile;
				return this.isOwner(didToAddress(did), owner)
			})
			.then(isOwner => {
				if (isOwner) {
					resolve({ profile });
				} else {
					reject('address is not owner in contract');
				}
			})
			.catch(reject)
	});
}

/**
 * @description Returns a profile for an identity validating an owner with private key
 * @param {string} query - Identity search parameter
 * @param {string} privateKey - Private key used to authenticate in the contract like owner
 * @return {object}
 */
DigitalIdentity.prototype.loginWithPrivateKey = function (query, privateKey) {
	return new Promise((resolve, reject) => {
		var profile;
		var did;
		this.searchDidByDocument(query)
			.then(identity => {
				if (identity.did) {
					did = identity.did;
					return this.searchProfile(identity.did);
				} else {
					reject('user not exists');
				}
			})
			.then(_profile => {
				let owner = this.ethCore.privateToAddress(privateKey);
				_profile['@id'] = did;
				profile = _profile;
				return this.isOwner(didToAddress(did), owner)
			})
			.then(isOwner => {
				if (isOwner) {
					resolve({ profile });
				} else {
					reject('address is not owner in contract');
				}
			})
			.catch(reject)
	});
}

/**
 * @description Return the DID, salt and documentId of the user
 * @param {string} query - Identity search parameter
 * @return {object}
 */
DigitalIdentity.prototype.searchDidByDocument = function (query) {
	return new Promise((resolve, reject) => {
		var didUser;
		this.ethCore.filterEvent(['MnemonicSet(string,address)', query])
			.then(logs => {
				try {
					if (logs.length == 0) {
			        	resolve({ did: null });
			        } else {
						//get last log
		              	let log = logs.pop();
						// get Address from topics
						let addressUser = "0x" + log.data.substring(26, 66);
						//convert to mnid from address proxy
						addressToDid.call(this, addressUser)
							.then(did => {
								didUser = did;
								//get instance of smart contracts
								let proxy = this.ethCore.getInstanceContract(proxyAbi, addressUser);
								proxy.id.call((error, idAddress) => {
									if (error) {
										reject(error);
									} else {
										let id = this.ethCore.getInstanceContract(idAbi, idAddress);
										// get mnemonics from ID contract
										id.mnemonics.call('admin', (error, mnemonics) => {
											if (error) {
												reject(error);
											} else {
												resolve({ did: didUser, salt: mnemonics[1], documentId: mnemonics[0] });
											}
										});
									}
								});
							})
							.catch(reject);
			        }
				} catch(error){
					reject(error);
				}
			})
			.catch(reject);
    });
}

/**
 * @description Indicates whether a specific address is owner in a proxy contract
 * @param {string} proxyAddress - User proxy address
 * @param {string} owner - Address to validate in the proxy contract
 * @return {boolean}
 */
DigitalIdentity.prototype.isOwner = function (proxyAddress, owner) {
    return new Promise((resolve, reject)=>{
		try {
			owner = getAddress(owner);
			if (!owner) {
				reject('invalid owner');
			}
			proxyAddress = getAddress(proxyAddress);
			if (!proxyAddress) {
				reject('invalid proxy address');
			}
			let contractProxy = this.ethCore.getInstanceContract(proxyAbi, proxyAddress);
			contractProxy.owners.call(owner, (error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			})
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * @description Add an owner to the contract proxy of the user
 * @param {string} query - Contract proxy of the user (Did, mnid or address)
 * @param {string} privateKey - Private key to add to the contract
 * @return {object}
 */
DigitalIdentity.prototype.addOwner = function (query, privateKeyToAdd) {
	return new Promise((resolve, reject) => {
		let addressUser = getAddress(query);
		if (addressUser) {
			if (privateKeyToAdd && privateKeyToAdd.startsWith('0x')) {
				let addressToAdd = this.ethCore.privateToAddress(privateKeyToAdd);
			    let proxy = this.ethCore.getInstanceContract(proxyAbi, addressUser);
			    let addOwnerData = proxy.addOwner.getData(addressToAdd);
			    this.ethCore.deployTransaction(addOwnerData, addressUser, 0)
			        .then(resolve)
			        .catch(reject);
			} else {
				reject('invalid owner');
			}
		} else {
			reject('invalid proxy address');
		}
	});
}

/**
 * @description Search for an identity and return your respective profile
 * @param {string} search - Identity search parameter (Mnid, Did or Address)
 * @param {string} keyProfile - Key where the ipfs hash of the profile is stored
 * @return {object}
 */
DigitalIdentity.prototype.searchProfile = function (search, keyProfile = 'profile') {
	return new Promise((resolve, reject) => {
		let proxyAddress = getAddress(search);
		if (!proxyAddress) {
			reject('invalid search field: Did, mnid or address');
		}
		let contractProxy = this.ethCore.getInstanceContract(proxyAbi, proxyAddress);
		contractProxy.id.call((error, addressId) => {
			if (error) {
				reject(error);
			} else {
				if (!addressId || addressId == '0x') {
					reject('there is no contract Id');
				} else {
					let contractId = this.ethCore.getInstanceContract(idAbi, addressId);
					contractId.profiles.call(keyProfile, (error, hashIpfs) => {
						if (error) {
							reject(error);
						} else {
							this.ipfsCore.readInfo(hashIpfs)
								.then(async _profile => {
									if (isJsonString(_profile)) {
										let did = await addressToDid.call(this, proxyAddress);
										let profile = JSON.parse(_profile);
										profile['@id'] = did;
										resolve(profile);
									} else {
										resolve(_profile);
									}
								})
								.catch(reject);
						}
					});
				}
			}
		});
	});
}

/**
 * @description Create an identity for a person according to the profile using the identity manager
 * @param {object} profile - JSON profile of the person
 * @param {object} identifier - Username to make login in app
 * @param {string} keyPhrase - Text from which the private key will be derived
 * @param {boolean} withSalt - Add or not a salt to the keyphrase
 * @param {boolean} recharge - Recharge the created account for the user
 * @return {Promise} Object with the DID of the identity created
 */
 DigitalIdentity.prototype.createIdentityPersonIdentityManager = function (profile, identifier, keyPhrase, addressIdentityManager, withSalt = true, recharge = true) {
 	return new Promise((resolve, reject) => {
 		console.log('00 createIdentityPersonIdentityManager')
 		let salt = '';
		if (withSalt) {
			salt = this.ethCore.generateSalt();
		}
		console.log('01 generate salt')
 		let privateKey = this.generateNewPrivateKey(keyPhrase+salt, false);
 		console.log('02 generate generateNewPrivateKey')
 		let myAccount = this.ethCore.privateToAddress(this.ethCore.getPrivateKey());
 		console.log('03 generate privateToAddress')
 		this.rechargeAccount(myAccount, recharge)
 			.then(hashTx => {
				if (profile && identifier) {
					console.log('04 generate rechargeAccount', identifier)
					return this.searchDidByDocument(identifier);
				} else {
					throw('identifier empty or null');
				}
			})
			.then(userDid => {
				if (userDid.did) {
					console.log('user_exists ========',userDid.did);
					reject('user_exists');
				} else {
					console.log("IPFS Prifile=========")
					return this.ipfsCore.addInfo(profile);
				}
			})
			.then(hashIpfs => {
				console.log('generate init deployTransaction')
				console.log(identitymanagerAbi)
				console.log(addressIdentityManager)
				let contractIdentityManager = this.ethCore.getInstanceContract(identitymanagerAbi, addressIdentityManager);
				console.log('generate init createIdentity')
				console.log(contractIdentityManager)
				console.log(hashIpfs, identifier, salt)
				let createIdentityData = contractIdentityManager.createIdentity.getData('admin', 'profile', hashIpfs, identifier, salt);
				console.log('generate  deployTransaction')
				return this.ethCore.deployTransaction(createIdentityData, addressIdentityManager);
			})
			.then(response => {
				console.log('generate  addres')
				console.log(response.logs[0].address);
				return addressToDid.call(this, response.logs[0].address);
			})
			.then(did => {
				console.log('generate  did')
				console.log(did)
				resolve({did});
			})
 			.catch(reject);
 	});
 }

/**
 * @description Create an identity for a person according to the profile
 * @param {object} profile - JSON profile of the person
 * @param {object} identifier - Username to make login in app
 * @param {string} keyPhrase - Text from which the private key will be derived
 * @param {boolean} withSalt - Add or not a salt to the keyphrase
 * @param {boolean} recharge - Recharge the created account for the user
 * @return {Promise} Object with the DID of the identity created
 */
DigitalIdentity.prototype.createIdentityPerson = function (profile, identifier, keyPhrase, withSalt = true, recharge = true) {
	let promise = () => {
		return new Promise((resolve, reject) => {
			let did, addressContracts;
			let salt = '';
			if (withSalt) {
				salt = this.ethCore.generateSalt();
			}
			let privateKey = this.generateNewPrivateKey(keyPhrase+salt, false);
		    let myAccount = this.ethCore.privateToAddress(this.ethCore.getPrivateKey());
		    this.rechargeAccount(myAccount, recharge)
				.then(hashTx => {
					if (profile && identifier) {
						return this.searchDidByDocument(identifier)
					} else {
						throw('identifier empty or null');
					}
				})
				.then(userDid => {
					if (userDid.did) {
						reject('user_exists');
					} else {
						return deployContractsPerson.call(this, myAccount);
					}
				})
				.then(_addressContracts => {
					addressContracts = _addressContracts;
					return addressToDid.call(this, addressContracts['addressProxy']);
				})
				.then(didUser => {
					did = didUser;
					profile['@id'] = didUser;
					return this.ipfsCore.addInfo(profile);
				})
				.then(hashIpfs => {
					return updateContractsPerson.call(this, addressContracts, hashIpfs, identifier, salt);
				})
				.then(response =>  {
					resolve({did});
				})
				.catch(reject);
		});
	};
	return timeoutPromise(promise());
}

/**
 * @description Create an identity for a Company
 * @param {object} profile - JSON profile of the company
 * @param {string} user - User who wants to create a company (Did, Mnid  or Address)
 * @param {string} identifier - Identifier of the company
 * @param {string} image - The avatar of the company
 * @return {Promise} Object with the DID of the identity created
 */
DigitalIdentity.prototype.createIdentityCompany = function (profile, user, identifier, image) {
	return new Promise ((resolve, reject) => {
		var contracts;
		var addressCompanyProxy;
		this.ipfsCore.addFile(image)
			.then(hashIpfs => {
				profile['image'] = hashIpfs;
				return deployContractsCompany.call(this, user);
			})
			.then(addresses => {
				contracts = addresses;
      			return this.ipfsCore.addInfo(profile);
			})
			.then(hashIpfs => {
				addressCompanyProxy = contracts['addressCompanyProxy'];
				return updateContractsCompany.call(this, contracts, user, hashIpfs, identifier);
			})
			.then(success => {
				return addressToDid.call(this, addressCompanyProxy);
			})
			.then(didCompany => {
				resolve({ did: didCompany});
			})
			.catch(reject);
	});
}

/**
 * @description Deploy proxy and Id contracts
 * @param {string} user - Correspond to the proxy that is going to deploy the contracts (Did, Mnid  or Address)
 * @return {Promise} Object with the address of the proxy contract and Id
 */
function deployContractsCompany(user) {
    return new Promise((resolve, reject) => {
      let addressProxy = getAddress(user);
      if (addressProxy) {
		deployContractProxy.call(this, addressProxy)
			.then(addressCompanyProxy => {
				return Promise.all([deployContractId.call(this, addressCompanyProxy.contractAddress), addressCompanyProxy])
			})
			.then(([addressCompanyId, addressCompanyProxy]) => {
				resolve({ addressCompanyProxy: addressCompanyProxy.contractAddress, addressCompanyId: addressCompanyId.contractAddress });
			})
			.catch(reject);
      } else {
      	reject('invalid user address');
      }
    });
}

/**
 * @description Deploy proxy and Id contracts
 * @param {object} account - Address corresponding to the private key that signs the transactions
 * @return {Promise} Object with the address of the proxy contract and Id
 */
function deployContractsPerson(account) {
	return new Promise((resolve, reject) => {
		let listAddress = { addressProxy: '', addressId: '' };
		deployContractProxy.call(this, account)
			.then(proxy => {
				listAddress.addressProxy = proxy.contractAddress;
				return deployContractId.call(this, listAddress.addressProxy);
			})
			.then(id => {
				listAddress.addressId = id.contractAddress;
				resolve(listAddress);
			})
			.catch(reject);
	});
}

/**
 * @description Deploy proxy contract
 * @param {object} address - Address of the first owner
 * @return {Promise} Object with the transaction
 */
function deployContractProxy(address) {
    return new Promise((resolve, reject) => {
    	let data = this.ethCore.instanceContractData(proxyAbi, proxyByteCode, address);
      	this.ethCore.deployTransaction(data)
      		.then(resolve, reject);
    });
}

/**
 * @description Deploy Id contract
 * @param {object} address - Address of the contract proxy
 * @return {Promise} Object with the transaction
 */
function deployContractId (proxyAddress) {
    return new Promise((resolve, reject) => {
      	let data = this.ethCore.instanceContractData(idAbi, idByteCode, proxyAddress);
      	this.ethCore.deployTransaction(data)
      		.then(response => {
      			resolve(response);
      		})
      		.catch(reject);
    });
}

/**
 * @description Deploy transactions in Proxy and Id
 * @param {object} addressContracts - Object with addresses Proxy and Id
 * @param {string} user - Owner of the company
 * @param {string} hashIpfs - Hash ipfs of the profile
 * @param {string} documentId - Identifier of the company
 * @return {Promise} Object with the transaction
 */
function updateContractsCompany(addresses, user, hashIpfs, documentId) {
	let privateKey = this.ethCore.getPrivateKey();
    // Unpacking the addresses object
    let addressCompanyProxy = addresses.addressCompanyProxy;
    let addressCompanyId = addresses.addressCompanyId;
    // User proxy's instance
    let addressProxy  = getAddress(user);
    let proxy = this.ethCore.getInstanceContract(proxyAbi, addressProxy);
    // Company contract's instances
    let companyProxy = this.ethCore.getInstanceContract(proxyAbi, addressCompanyProxy);
    let companyId = this.ethCore.getInstanceContract(idAbi, addressCompanyId);
    // set Value
    let value = 0;
    // Set Id
    let setIdCompanySignData = companyProxy.setId.getData(addressCompanyId);
    let setIdCompanySignDataProxy = proxy.forward.getData(addressCompanyProxy, value, setIdCompanySignData);
    // Set Profile
    let setProfileCompanySignData = companyId.setProfile.getData('profile', hashIpfs);
    let setProfileSignDataCompanyProxy = companyProxy.forward.getData(addressCompanyId, value, setProfileCompanySignData);
    let setProfileSignDataProxy = proxy.forward.getData(addressCompanyProxy, value, setProfileSignDataCompanyProxy);
    // Set Mnemonic
    let setMnemonicCompanySignData = companyId.setMnemonic.getData('admin', documentId, '');
    let setMnemonicSignDataCompanyProxy = companyProxy.forward.getData(addressCompanyId, value, setMnemonicCompanySignData);
    let setMnemonicSignDataProxy = proxy.forward.getData(addressCompanyProxy, value, setMnemonicSignDataCompanyProxy);

    this.ethCore.deployTransaction(setIdCompanySignDataProxy, addressProxy)
        .then(txReceipt => executeProxyTx.call(this, [setMnemonicSignDataProxy, setProfileSignDataProxy], addressProxy))
        .then(success => Promise.resolve(success))
        .catch(error => Promise.reject(error));
}

/**
 * @description Deploy transactions in Proxy and Id
 * @param {object} addressContracts - Object with addresses Proxy and Id
 * @param {string} hashIpfs - Hash ipfs of the profile
 * @param {string} documentId - Identifier of the user to make login in the app
 * @param {string} salt - Random string for generate the private key
 * @return {Promise} Object with the transaction
 */
function updateContractsPerson(addressContracts, hashIpfs, documentId, salt) {
	return new Promise((resolve, reject) => {
	    let value = 0; // value default
	    let privateKey = this.ethCore.getPrivateKey();

	    let addressProxy = addressContracts.addressProxy;
	    let addressId =  addressContracts.addressId;

	    let proxy = this.ethCore.getInstanceContract(proxyAbi, addressProxy);
	    let id = this.ethCore.getInstanceContract(idAbi, addressId);

	    // get setId Sign Data
	    let setIdSignData = proxy.setId.getData(addressId);

	    // get setMnemonic Sign Data
	    var mnemonicSign = id.setMnemonic.getData('admin', documentId, salt);
	    let mnemonicSignProxy   = proxy.forward.getData(addressId, value, mnemonicSign);

	    // get setProfile Sign Data
	    let setProfileSign = id.setProfile.getData('profile', hashIpfs);
	    let setProfileSignProxy = proxy.forward.getData(addressId, value, setProfileSign);
	    
	    this.ethCore.deployTransaction(setIdSignData, addressProxy)
	        .then(txReceipt => executeProxyTx.call(this, [mnemonicSignProxy, setProfileSignProxy], addressProxy))
	        .then(resolve)
	        .catch(reject);
	});
}

/**
 * @description Execute the respective transactions in the contracts to configure the identity of a person
 * @param {array} txs - List of transactions to execute
 * @param {string} addressProxy - Address of the proxy contract where the transactions will be executed
 * @return {Promise} Return hash of the last transaction
 */
function executeProxyTx(txs, addressProxy) {
    return new Promise((resolve, reject) => {
		let mnemonicSignProxy = txs[0];
		let setProfileSignProxy = txs[1];
		
		this.ethCore.deployTransaction(setProfileSignProxy, addressProxy)
			.then(response => this.ethCore.deployTransaction(mnemonicSignProxy, addressProxy))
			.then(resolve)
			.catch(reject);
		//this.ethCore.deployBatchTransactions(txs, addressProxy).then(resolve).catch(reject);
    });
}

/**
 * @description Update a profile for a given identity
 * @param {string} profile - JSON profile of the person
 * @param {string} search - Identity search parameter
 * @param {string} keyProfile - Key that contains the profile to be updated in the contract
 * @return {object} Transaction object
 */
DigitalIdentity.prototype.updateProfilePerson = function (profile, search, keyProfile = 'profile') {
    return new Promise((resolve, reject)=>{
    	let proxyAddress = getAddress(search);
		let value = 0;
    	if (!proxyAddress) {
    		reject('invalid query param: Mnid, Did or Address');
    	}
		let contractProxy = this.ethCore.getInstanceContract(proxyAbi, proxyAddress);
		contractProxy.id.call((error, addressId) => {
			if (error) {
				reject(error);
			} else {
				this.ipfsCore.addInfo(profile)
					.then(hashIpfs => {
						let contractId = this.ethCore.getInstanceContract(idAbi, addressId);
						let setProfileSign = contractId.setProfile.getData(keyProfile, hashIpfs);
						let data = contractProxy.forward.getData(addressId, value, setProfileSign);
						return this.ethCore.deployTransaction(data, proxyAddress);
					})
					.then(resolve)
					.catch(reject);
			}
		});
    });
}

/**
 * @description Update a profile for a given company
 * @param {string} profile - JSON profile of the company
 * @param {string} search - Identity search parameter
 * @param {string} owner - Owner of the company
 * @param {string} keyProfile - Key that contains the profile to be updated in the contract
 * @return {object} Transaction object
 */
DigitalIdentity.prototype.updateProfileCompany = function (profile, search, owner, keyProfile = 'profile') {
    return new Promise((resolve, reject)=>{
    	var proxyAddressCompany = getAddress(search);
    	var proxyAddressPerson = getAddress(owner);
		let value = 0;
    	if (!proxyAddressCompany && !proxyAddressPerson) {
    		reject('invalid query param: Mnid, Did or Address');
    	}
		var contractProxyPerson = this.ethCore.getInstanceContract(proxyAbi, proxyAddressPerson);
		var contractProxyCompany = this.ethCore.getInstanceContract(proxyAbi, proxyAddressCompany);
	    contractProxyCompany.id.call((error, addressId) => {
	    	if (error) {
	    		reject(error);
	    	} else {
	    		this.ipfsCore.addInfo(profile)
					.then(hashIpfs => {
						let contractIdCompany = this.ethCore.getInstanceContract(idAbi, addressId);
	    				let setProfileCompanySignData = contractIdCompany.setProfile.getData(keyProfile, hashIpfs);
	    				let setProfileSignDataCompanyProxy = contractProxyCompany.forward.getData(addressId, value, setProfileCompanySignData);
	    				let setProfileSignDataProxy = contractProxyPerson.forward.getData(proxyAddressCompany, value, setProfileSignDataCompanyProxy);
						return this.ethCore.deployTransaction(setProfileSignDataProxy, proxyAddressPerson);
					})
					.then(resolve)
					.catch(reject);
	    	}
	    });
    });
}

/**
 * @description Faucet to recharge an address with Ethers
 * @param {string} addressTo - Address to recharge (Did, Mnid or address)
 * @param {boolean} recharge - Enable/disable recharge
 * @return {object} Transaction hash
 */
DigitalIdentity.prototype.rechargeAccount = function (addressTo, recharge = true) {
    return new Promise((resolve, reject) => {
    	this.ethCore.getBalanceAddress(addressTo)
    		.then(balance => {
    			if (balance >= 5000000000000000000) {
    				resolve(true);
    			} else {
    				if (recharge) {
	    				this.ethCore.sendBalanceAddress(getAddress(addressTo))
	    					.then(resolve)
	    					.catch(error => {
								mnidEncode.call(this, getAddress(addressTo))
									.then(mnidUser => {
										let options = {
											method: 'POST',
								  			body: JSON.stringify({ 'mnid': mnidUser }),
											headers:{
												'Content-Type': 'application/json'
											}
										};
										console.log('aqui fetch identity')
										fetch(DAS_FAUCET, options)
										    .then((response) => {
										    	console.log(response)
										    	return response.text();
										    })
										    .then (response =>{
											    	console.log("fetch ok")
											    	resolve(response)
										    	}
										    	)
										    .catch( err =>{
										    	console.error(err);
										    	reject(error);
										    });
									})
									.catch(reject);
	    					});
    					
    				} else {
    					resolve(true);
    				}
    			}
    		})
    		.catch(reject);
    });
}

/**
 * @description Return the attestations for a data
 * @param {string} source - User to consult their attestations
 * @param {string} target - Data attested
 * @return {object}
 */
DigitalIdentity.prototype.getAttestations = function (source, target) {
	return new Promise((resolve, reject) => {
		let attestation = generateAttestationObject(source, target);
		if (attestation) {
			this.ethCore.filterEvent(['ClaimAttested(bytes32,bytes32,address,uint256,uint256)', attestation.sourceHash, attestation.targetHash])
				.then(async logs => {
					try {
						if (logs.length == 0) {
				        	resolve([]);
				        } else {
							let attests = [];
							for (let log of logs) {
								let addressAtt = "0x" + log.data.substring(26, 66);
								let didAtt = await addressToDid.call(this, addressAtt);
								let dateLarge = log.data.substring(66, 130);
								let dateExpLarge = log.data.substring(186);
								let date = parseInt("0x" + dateLarge.substring(56));
								let dateExp = parseInt("0x" + dateLarge.substring(56));
								attests.push({ date, dateExp, did: didAtt});
							}
							resolve(attests);
				        }
					} catch(error) {
						reject(error);
					}
				})
				.catch(reject);
		} else {
			reject('invalid source / target parameter. String is required');
		}
    });
}

/**
 * @description Return the attestations for a user
 * @param {string} source - User to consult their attestations
 * @return {object}
 */
DigitalIdentity.prototype.getAllAttestations = function (source) {
	return new Promise((resolve, reject) => {
		let attestation = generateAttestationObject(source, '');
		if (attestation) {
			this.ethCore.filterEvent(['ClaimAttested(bytes32,bytes32,address,uint256,uint256)', attestation.sourceHash])
				.then(async logs => {
					try {
						if (logs.length == 0) {
				        	resolve([]);
				        } else {
							let attests = [];
							for (let log of logs) {
								let addressAtt = "0x" + log.data.substring(26, 66);
								let didAtt = await addressToDid.call(this, addressAtt);
								let dateLarge = log.data.substring(66, 130);
								let dateExpLarge = log.data.substring(186);
								let date = parseInt("0x" + dateLarge.substring(56));
								let dateExp = parseInt("0x" + dateLarge.substring(56));
								attests.push({ date, dateExp, did: didAtt});
							}
							resolve(attests);
				        }
					} catch(error) {
						reject(error);
					}
				})
				.catch(reject);
		} else {
			reject('invalid source / target parameter. String is required');
		}
    });
}

/**
 * @description Make an attestation for a specific data
 * @param {string} source - User to attest
 * @param {string} target - Data to be attested
 * @param {string} attester - User who will perform the attestation (Did, Mnid or Address)
 * @param {string} contract - Contract address where the attestaions are stored
 * @param {number} validDays - Number of days the attestation is valid
 * @return {object}
 */
DigitalIdentity.prototype.attestData = function (source, target, attester, contract, validDays = 30) {
	return new Promise((resolve, reject) => {
		let attestation = generateAttestationObject(source, target, validDays);
		let addressAttester = getAddress(attester);
		if (attestation && addressAttester && contract) {
			let claimAttester = this.ethCore.getInstanceContract(attesterAbi, contract);
			let attestClaimSign = claimAttester.attestClaim.getData(attestation.sourceHash, attestation.targetHash, addressAttester, validDays);
			this.ethCore.deployTransaction(attestClaimSign, contract, 0)
				.then(resolve)
				.catch(reject)
		} else {
			reject('invalid parameter. Source and target required in string format');
		}
    });
}

/**
 * @description Make a verification for a specific data
 * @param {string} data - Data to be attested
 * @param {string} user - Mnid, did or address of the user who will do the verification
 * @param {string} contract - Contract address where the verifications are stored
 * @param {number} validDays - Number of days the verification is valid
 * @return {object}
 */
DigitalIdentity.prototype.verifyData = function (data, user, contract, validDays = 30) {
	return new Promise((resolve, reject) => {
		let proxyAddress = getAddress(user);
		let value = 0;
		if (!proxyAddress) {
    		reject('invalid query param: Mnid, Did or Address');
    	}
    	let contractProxy = this.ethCore.getInstanceContract(proxyAbi, proxyAddress);
    	contractProxy.id.call((error, addressId) => {
			if (error) {
				reject(error);
			} else {
				let verification = generateVerifyObject(data, validDays);
				if (verification && contract) {
					let verificationregistry = this.ethCore.getInstanceContract(verificationregistryAbi, contract);
					let verifyDataSign = verificationregistry.verify.getData(verification.dataHash, validDays);
					let forwardData = contractProxy.forward.getData(contract, value, verifyDataSign);
					this.ethCore.deployTransaction(forwardData, proxyAddress)
						.then(resolve)
						.catch(reject)
				} else {
					reject('invalid parameter. Data required in string format');
				}
			}
		});

    });
}

/**
 * @description Return the verifications for a data
 * @param {string} data - Data verified
 * @return {object}
 */
DigitalIdentity.prototype.getVerifications = function (data) {
	return new Promise((resolve, reject) => {
		let verification = generateVerifyObject(data);
		if (verification) {
			this.ethCore.filterEvent(['Verified(bytes32,address,uint256,uint256)', verification.dataHash])
				.then(async logs => {
					try {
						if (logs.length == 0) {
				        	resolve([]);
				        } else {
							let verifications = [];
							for (let log of logs) {
								let addressAtt = "0x" + log.data.substring(26, 66);
								let didAtt = await addressToDid.call(this, addressAtt);
								let verificationregistry = this.ethCore.getInstanceContract(verificationregistryAbi, log.address);
								verificationregistry.verifications.call(verification.dataHash, addressAtt, (error, dates) => {
									if (error) {
										reject(error);
									}
									verifications.push({ did: didAtt, address: addressAtt, date: Number(dates[0]), dateExp: Number(dates[1]) });
									if (verifications.length == logs.length) {
										let filterVerifications = Array.from(new Set(verifications.map(JSON.stringify))).map(JSON.parse);
										resolve(filterVerifications);
									}
								});
							}
				        }
					} catch(error) {
						reject(error);
					}
				})
				.catch(reject);
		} else {
			reject('invalid data parameter. String is required');
		}
    });
}

/**
 * @description Valid if a mnid is in the same network
 * @param {string} mnidToValidate - mnid to validate
 * @return {boolean}
 */
DigitalIdentity.prototype.validateMnidNetwork = function (mnidToValidate) {
	return new Promise((resolve, reject) => {
		if (mnid.isMNID(mnidToValidate)) {
		    this.ethCore.web3Instance.version.getNetwork((error, networkId) => {
			    if (error) {
			      reject(error);
			    } else {
			      let network = mnid.decode(mnidToValidate).network;
			      resolve(network == this.ethCore.web3Instance.toHex(networkId));
			    }
			});
		} else {
			reject('invalid mnid');
		}
	});
}

/**
 * @description Mark a hash of a document to a single date according to the time when the action is performed
 * @param {string} addressContract - Address of the contract with the timestamps
 * @param {string} documentHash - Document hash
 * @return {number} Timestamp
 */
DigitalIdentity.prototype.stampDocument = function (addressContract, documentHash) {
    return new Promise((resolve, reject) => {
    	if (!addressContract && !documentHash) {
    		reject('invalid param: addressContract, documentHash');
    	}
    	let documentHashHex = this.ethCore.web3Instance.toHex(documentHash);
		let contractProofOfExistence = this.ethCore.getInstanceContract(proofOfExistenceAbi, addressContract);
		let data = contractProofOfExistence.stampDocument.getData(documentHashHex);
		this.ethCore.deployTransaction(data, addressContract, 0)
			.then(response => {
				contractProofOfExistence.stamps.call(documentHashHex, (error, timestamp) => {
					if (error) {
						reject(error);
					} else {
						resolve(timestamp.toNumber());
					}
				})
			})
			.catch(reject);
    });
}

/**
 * @description Gets the timestamp of a stamped document
 * @param {string} addressContract - Address of the contract with the timestamps
 * @param {string} documentHash - Document hash
 * @return {number} Timestamp
 */
DigitalIdentity.prototype.getTimestampStampedDocument = function (addressContract, documentHash) {
    return new Promise((resolve, reject) => {
    	if (!addressContract && !documentHash) {
    		reject('invalid param: addressContract, documentHash');
    	}
    	let documentHashHex = this.ethCore.web3Instance.toHex(documentHash);
		let contractProofOfExistence = this.ethCore.getInstanceContract(proofOfExistenceAbi, addressContract);
		contractProofOfExistence.stamps.call(documentHashHex, (error, timestamp) => {
				if (error) {
					reject(error);
				} else {
					resolve(timestamp.toNumber());
				}
			});
    });
}

/**
 * @description Share information with a certain public key
 * @param {string} to - Address to which the information will be shared
 * @param {object} share - Object with the encrypted data, public key and algoritm used
 * @param {string} user - Mnid, did or address of the user who will share the information
 * @return {object}
 */
DigitalIdentity.prototype.shareInformation = function (to, share, user) {
    return new Promise((resolve, reject) => {
    	if (!share['data']) {
    		reject('data field required');
    	}
    	this.ipfsCore.addInfo(share.data, { encrypted: true, algorithm: share['algorithm'] })
    		.then(hashIpfs => {
    			let proxyAddress = getAddress(user);
				let value = 0;
		    	if (!proxyAddress) {
		    		reject('invalid query param: Mnid, Did or Address');
		    	}
				let contractProxy = this.ethCore.getInstanceContract(proxyAbi, proxyAddress);
				contractProxy.id.call((error, addressId) => {
					if (error) {
						reject(error);
					} else {
						let contractId = this.ethCore.getInstanceContract(idAbi, addressId);
						let hashData = this.ethCore.web3Instance.sha3(share.data);
						let shareInfoData = contractId.shareInfo.getData(hashIpfs, to, hashData);
						let forwardData = contractProxy.forward.getData(addressId, value, shareInfoData);
						this.ethCore.deployTransaction(forwardData, proxyAddress)
							.then(resolve)
							.catch(reject);
					}
				});
    		})
    		.catch(reject);
    });
}

/**
 * @description Returns an object of attestation
 * @param {string} source - User who is going to attest a piece of information
 * @param {string} target - Data to be attested
 * @return {object}
 */
function generateAttestationObject(source, target, validDays = 30) {
    let attestation = {};
    if (typeof source == 'string' && typeof target == 'string') {
	    attestation["sourceHash"] = '0x'+CryptoJS.SHA256(source).toString();
	    attestation["targetHash"] = '0x'+CryptoJS.SHA256(target).toString();
	    attestation["validDays"] = validDays;
	    return attestation;
    } else {
    	return null;
    }
}

/**
 * @description Returns an object of verification
 * @param {string} data - Data to be verified
 * @return {object}
 */
function generateVerifyObject(data, validDays = 30) {
    let verification = {};
    if (typeof data == 'string') {
	    verification["dataHash"] = '0x'+CryptoJS.SHA256(data).toString();
	    verification["validDays"] = validDays;
	    return verification;
    } else {
    	return null;
    }
}

/**
 * @description Returns the corresponding mnid of an address
 * @param {string} address - Address to convert
 * @return {string}
 */
function mnidEncode(address) {
	return new Promise((resolve, reject) => {
		this.ethCore.web3Instance.version.getNetwork((error, _networkId) => {
	      if (error) {
	        reject(error);
	      } else {
			const networkId = this.ethCore.web3Instance.fromDecimal(_networkId);
			resolve(mnid.encode({ network: networkId, address: address }));
	      }
	    });
	});
}

/**
 * @description Convert a Did to an object with its address
 * @param {string} did - Did to convert
 * @return {object}
 */
function didToAddress(did) {
	if (did.startsWith('did:ev:')) {
		let mnidTemp = did.substring(7);
		return mnid.decode(mnidTemp);
	}
	return null;
}

/**
 * @description Convert an address to did
 * @param {string} address - Address to convert to Did
 * @return {string}
 */
function addressToDid(address) {
	return new Promise((resolve, reject) => {
		mnidEncode.call(this, address)
			.then(_mnid => {
				resolve('did:ev:' + _mnid);
			})
			.catch(reject);
	});
}

/**
 * @description According to a given string, it returns its corresponding address
 * @param {string} query - The string must be: String mnid, Did, Object mnid or Address
 * @return {boolean}
 */
function getAddress(query) {
	let address = null;
	if (mnid.isMNID(query)) {
		address = mnid.decode(query).address;
	} else if (typeof query == 'string' && query.startsWith('did:ev:')) {
		address = didToAddress(query).address;
	} else if(typeof query == 'string' && query.startsWith('0x')){
		address = query;
	} else if(typeof query == 'object' && query['address']) {
		address = query.address;
	}
	return address;
}

/**
 * @description Valid if a string is a valid json
 * @param {string} str - String to validate
 * @return {boolean}
 */
function isJsonString(str) {
    try {
    	JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * @description Function to add a timeout to the promises
 * @param {promise} promise - Promise to execute
 * @param {number} ms - The millisecons to wait for reject the promise
 */
function timeoutPromise(promise, ms = 80000) {
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in '+ ms + ' ms.');
    }, ms);
  });
  // Returns a race between our timeout and the passed in promise
  return Promise.race([ promise, timeout ]);
}

module.exports = DigitalIdentity;