'use strict'


const API_KEY = 'xxx1';
var APP_ID = 'GNIw1EadTI2DEmRvx5HaRQ';
var path = require('path');

// 设置 api_key
const XAPI = require('../lib/mofan-cloud-api.js')(API_KEY)
XAPI.setPrivateKeyPath(path.join(__dirname, './rsa_private_key.pem'));
const privateKey = XAPI.getPrivateKey()
console.log(privateKey)
const params = {
    "no": "801506154407822772",
    "appid": APP_ID
}

//
XAPI.express.query(params, (err, result) => {
    if (err) {
        console.log("error:", err)
        return
    }
    console.log(result)
    console.log("express create result")
})









