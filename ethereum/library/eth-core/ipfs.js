'use strict'

var ipfsAPI = require('ipfs-mini');
const mime = require('mime-types');

//require('isomorphic-fetch');
 const fetch = require('node-fetch'); // Only for NodeJs
const MANIFEST = "manifest";
const DATA = "data";
const DIR = "directory";
const ENCODING = {
	LATIN1: "latin1",
	BASE64: "base64",
	BASE64URL: "base64url",
	HEX: "hex",
	NONE: "none"
};
const ALGORITHM = {
	RSA: "RSA",
	AES256: "AES256",
	ECDH: "ECDH",
	NONE: "none"
};

var IPFS = function (connection) {
	this.ipfs = new ipfsAPI({host: connection.host, port: connection.port, protocol: connection.protocol});
}

IPFS.prototype.addFile = function (path, fileType = null) {
    return new Promise((resolve, reject)=>{
    	let extension = fileType || path.split('.').pop();
    	let mimeType = mime.lookup(extension);
    	let name = path.split('/').pop();
    	let data = new FormData();
    	data.append('file',{
			uri: path,
			name,
			type: mimeType
		});
		fetch(this.ipfs.requestBase+'/add', {
		        method: "POST",
		        mode: "cors",
		        headers: {
		        	'Accept': 'application/json',
		            "Content-Type": "multipart/form-data"
		        },
		        body: data
		    })
			.then(response => response.json())
			.then(response => resolve(response.Hash))
			.catch(reject);
	});
}

IPFS.prototype.addInfo = function (dataContent, options = { encrypted: false }) {
    return new Promise((resolve, reject)=>{
		// Create the manifest file
		console.log("ipfs addInfo");
		var manifestFile = {
			ContentEncryption: null,
			ContentPath: DATA,
			ContentEncoding: ENCODING.BASE64
		};
		// Set Fingerprint if options.encrypted is true
		if (options && options.encrypted){
			if (!options.algorithm) reject('Algorithm is required');
			manifestFile.ContentEncryption = options.algorithm;
			if (options['fingerprint']) {
				manifestFile['Fingerprint']  = options.fingerprint;
			}
		} else {
			manifestFile.ContentEncryption = ALGORITHM.NONE;
		}
		if (typeof dataContent == 'object') {
			dataContent = JSON.stringify(dataContent);
		} else if (typeof dataContent != 'string') {
			dataContent = String(dataContent);
		}
		let contentData = Buffer.from(dataContent).toString('base64');
		contentData = Buffer.from(contentData, ENCODING.BASE64);
		let file = {
		  manifest: manifestFile,
		  data: contentData
		};
		// Send file to ipfs
		console.log("ipfs===", file)
		this.ipfs.addJSON(file, (err, hash) => {
			if (err){
				reject(err);
			} else {
				console.log("ipfs_hash", hash)
			  	resolve(hash);
			}
		});
	});
}

IPFS.prototype.readInfo = function (hashID){
    return new Promise((resolve, reject)=>{
		var manifestFile = null;
		var datFile = null;
		// Validate if hash is a directory
		this.ipfs.cat(hashID, (error, result) => {
			if (error) {
				if (error.message.includes('this dag node is a directory')) {
					ls.call(this, hashID)
						.then(files => {
							files.forEach((node) => {
								if (node["Name"] == MANIFEST) {
									this.ipfs.cat(node["Hash"], (error, result) => {
										if (error) {
											reject(error);
										} else {
											if (isJsonString(result)) {
												let manifest = JSON.parse(result);
												if (!manifest['ContentPath']) reject('There is no ContentPath field in Manifest file');
												cat.call(this, hashID+'/'+manifest.ContentPath)
													.then(resolve)
													.catch(reject);
											} else {
												resolve(result);
											}
										}
									});
								}
							});
						})
						.catch(reject);
				} else {
					reject(error);
				}
			} else {
				this.ipfs.cat(hashID, (error, result) => {
					if (error) {
						reject(error);
					} else {
						if (isJsonString(result)) {
							let dataJson = JSON.parse(result);
							if (dataJson['data']) {
								let parsedData = Buffer.from(dataJson.data, 'base64').toString('utf-8');
								resolve(parsedData);
							} else {
								resolve(dataJson);
							}
						} else {
							resolve(result);
						}
					}
				});
			}
		});
    });
}

function cat(url) {
	return new Promise((resolve, reject) => {
		fetch(this.ipfs.requestBase+'/cat?arg='+url)
			.then((res) => res.json())
			.then((parsedResponse) => {
				resolve(parsedResponse);
			})
			.catch(reject);
	});
}

function ls(hashID) {
	return new Promise((resolve, reject) => {
		fetch(this.ipfs.requestBase+'/file/ls?arg='+hashID)
			.then((res) => res.json())
			.then((parsedResponse) => {
				resolve(parsedResponse.Objects[hashID].Links);
			})
			.catch(reject);
	});
}

function getHashDir(hash) {
	let hashDir = null;
    hash.forEach((file) => {
		if (file.path === DIR) {
			hashDir = file.hash;
		}
    });
    return hashDir;
}

function isJsonString(str) {
    try {
    	JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = IPFS;