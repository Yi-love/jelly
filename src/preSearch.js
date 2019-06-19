'use strict';
const URL = require('url').URL;
const request = require('request');
const {HKEX_URL, JELLY_1_URL , JELLY_7_URL} = require('./config');

/**
* [发起请求Promise]
*/
function requestPromise(options){
    return new Promise((resolve , reject)=>{
        request(options , (error , response , body)=>{
            if (!error && response.statusCode == 200) {
                let result = {};
                try{
                    result = JSON.parse(body);
                }catch(err){
                    return reject('@cray/jelly response data parse error.');
                }
                return resolve(result.result || '[]');
            }
            return reject(error);
        });
    });
}
/**
 *  获取上市ipo文件
 * @param {*} week 
 */
function getPreList(week = true){
    return requestPromise({uri:week ? JELLY_7_URL : JELLY_1_URL , timeout: 15 * 1000})
        .then(parseResponse)
        .then(parseList)
}
/**
 * 获取数据列表
 * @param {*} list 
 */
function parseList(list = []){
    let arr = [];

    for( let i = 0 ; i < list.length ; i++ ){
        let stock = parseIPOStockInfo(list[i]);
        if ( stock ){
            arr.push(stock);
        }
    }
    return {list: arr , perfect: arr.length === list.length};
}
/**
 * 获取新股数据
 * @param {*} stock 
 */
function parseIPOStockInfo(stock){
    try{
        let dateTime = stock.DATE_TIME;
        let stockCode = stock.STOCK_CODE;
        let stockName = stock.STOCK_NAME;
        let shortText = (stock.SHORT_TEXT || '').replace('<br/>' , '');
        let fileInfo = stock.FILE_INFO;
        let fileUrl = new URL(stock.FILE_LINK , HKEX_URL).href;
        let fileName = stock.TITLE;
        return {dateTime,stockCode,stockName,shortText,fileInfo,fileUrl,fileName};
    }catch(err){
        console.log('[@cray/jelly] parse stock info error: ' + err.message);
    }
    return undefined;
}
/**
 * parse解析数据
 * @param {*} result 
 */
function parseResponse(result){
    let arr = [];
    try{
        arr = JSON.parse(result);
    }catch( err ){
        console.log('[@cray/jelly] parse result list error: ' + err.message);
    }
    return arr;
}

exports.getPreList = getPreList;