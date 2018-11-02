const utils = require('../lib/utils')
const fs =require('fs')
const path =require('path')
const crypto =require('crypto')



const privatekey = fs.readFileSync(path.join(__dirname, './rsa_private_key.pem'), 'utf8')
console.log(privatekey)

const data = 'hello'
// rsa加密
const signStr = utils.generateSign(data, privatekey)


const publicKey = fs.readFileSync(path.join(__dirname, './rsa_public_key.pem'), 'utf8')

console.log('publicKey.length')
console.log(publicKey.length)

function signer(algorithm,key,data){
    var sign = crypto.createSign(algorithm);
    sign.update(data);
    const  sig = sign.sign(key, 'hex');
    return sig;
}

function verify(algorithm,pubkey,sig,data){
    var verify = crypto.createVerify(algorithm);
    verify.update(data);
    return verify.verify(pubkey, sig, 'base64')
}

const result = verify('sha256',publicKey,signStr,data)
console.log(result)