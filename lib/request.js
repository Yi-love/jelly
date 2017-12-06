'use strict';

const http = require('http');
const { URL } = require('url');
const querystring = require('querystring');

const REQUEST_TIMEOUT = 15 * 1000;

/**
 * [getHostInformation 获取对应url数据信息]
 * @param  {String} sourceUrl [description]
 * @return {[type]}           [description]
 */
function getHostInformation( sourceUrl = '' ) {
    let url = new URL(sourceUrl);

    let protocol = url.protocol || 'http:';
    let auth = url.auth || '';
    let hostname = url.host;
    let port = url.port || 80;
    let pathname = url.pathname || '/';
    let query = '';
    if ( url.search ){
        query = url.search.replace(/^\?/,'');
    }
    query = querystring.parse(query);
    return {protocol , auth , hostname , port , pathname , query};
}

/**
 * [getRealPath 获取请求path参数]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function getRealPath( options ){
    let query = querystring.stringify(options.query);
    return options.pathname + (query ? ('?' + query) : '');
}

/**
 * [getOptions 获取options]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function getOptions( options ) {
    return typeof options === 'string' ? getHostInformation(options) : getMergeOptions(options);
}

/**
 * [getMergeOptions 根据options获取options]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function getMergeOptions( options ) {
    let urls = getHostInformation(options.url);

    let encoding = options.encoding || 'utf-8';
    let data = options.data || {};
    let resolveWithFullResponse = options.resolveWithFullResponse || false;
    let query = options.query || {};
    query = Object.assign({} , urls.query , options.query);
    
    let headers = options.headers || {};
    let timeout = options.timeout || REQUEST_TIMEOUT;

    return options = Object.assign({} , urls , {headers , resolveWithFullResponse , encoding , data , query , timeout});
}

/**
 * [setCommonOptions 设置参数]
 * @param {[type]} options [description]
 * @param {String} method  [description]
 * @param {Object} headers [description]
 */
function setCommonOptions( options , method = 'get' , headers = {} ) {
    options.encoding = options.encoding || 'utf-8';
    options.method = method;
    
    options.path = getRealPath(options);
    
    options.headers = Object.assign({} , headers , options.headers);
    
    if ( method === 'post' && options.headers['Content-Type'] !== 'application/json' ){
        options.data = querystring.stringify(options.data);
        options.headers['Content-Length'] = Buffer.byteLength(options.data);
    }
    return options;
}

/**
 * [setPostOption 设置post参数]
 * @param {[type]} options [description]
 */
function setPostOption( options ) {
    options = getOptions(options);
    
    let headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    
    return setCommonOptions(options , 'post' , headers);
}

/**
 * [setGetOptions 设置get参数]
 * @param {[type]} options [description]
 */
function setGetOptions(options) {
    return setCommonOptions(getOptions(options) , 'get');
}

/**
 * [handlerError 错误]
 * @param  {[type]}  response [description]
 * @param  {Boolean} isFull   [description]
 * @return {[type]}           [description]
 */
function handlerError(response , isFull){
    return Promise.reject(isFull ? response : response.message);
}
/**
 * [handlerResponse 请求成功]
 * @param  {[type]}  response [description]
 * @param  {[type]}  data     [description]
 * @param  {Boolean} isFull   [description]
 * @return {[type]}           [description]
 */
function handlerResponse(response , data , isFull){
    return Promise.resolve(isFull ? Object.assign({} , response , {data}) : data);
}

/**
 * [requestPromise 请求]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function requestPromise(options) {
    return new Promise((resolve , reject)=>{
        const req = http.request(options, (res) => {
            res.setEncoding(options.encoding);

            let {statusCode} = res;
            //返回不是200
            if ( statusCode !== 200 ){
                return reject(handlerError(Object.assign({} , res , {message:new Error(`request error. statusCode == ${statusCode}`)}) , options.resolveWithFullResponse));
            }

            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });
            res.on('end', () => {
                //正确 success
                return resolve(handlerResponse(res , response , options.resolveWithFullResponse));
            });
        });

        //请求出错
        req.on('error', (err) => {
            return reject(handlerError(Object.assign({} , res , {message:err}) , options.resolveWithFullResponse));
        });
        
        //post写数据
        if ( options.method === 'post' && options.data ){
            req.write(options.data);
        }
        req.end();
    });
}

const request = {};

//{url,resolveWithFullResponse,encoding,headers,query,data}
request.post = (options)=>{
    return requestPromise(setPostOption(options));
}
//{url,resolveWithFullResponse,encoding,headers,query}
request.get = (options)=>{
    return requestPromise(setGetOptions(options));
}

module.exports = request;