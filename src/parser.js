'use strict';

const { URL } = require('url');
const cheerio = require('cheerio');

const HKEX_URL = 'http://www.hkexnews.hk';

function getState(html = ''){
    let $ = cheerio.load(html);

    return {
        state: $('#__VIEWSTATE').val(),
        stateGenerator: $('#__VIEWSTATEGENERATOR').val(),
        stateEncrypted: $('#__VIEWSTATEENCRYPTED').val()
    };
}

function getTotal($) {
    let totalDom = $('#ctl00_lblDisplay');
    if ( !totalDom ){
        return {
            first: 0,
            end: 0,
            count: 0
        };
    }
    let totalHtml = totalDom.text() || '';
    let totalArr = totalHtml.replace(/[^0-9,]/igm ,' ').replace(/\s+/g , ' ').replace(/,/gm,'').trim().split(' ');
    if ( totalArr.length < 3 ){
        return {
            first: 0,
            end: 0,
            count: 0
        };
    }
    return  {
        first: +totalArr[0],
        end: +totalArr[1],
        count: +totalArr[2]
    };
}

function isNotEmpty($){
    let manDom = $('#ctl00_gvMain');
    if ( !manDom ){
        return false;
    }
    let emptyDom = $('#ctl00_gvMain tr .arial12black');
    return emptyDom && emptyDom.length ? false : true;
}

function getIpoList($) {
    $('.headerStyle').remove();
    $('.footerStyle').remove();
    let ipoListDom = $('#ctl00_gvMain tr');
    let list = [];
    for ( let i = 0 ; i < ipoListDom.length ; i++ ){
        let ipoDom = ipoListDom.eq(i);
        list.push(getIpoInformation(ipoDom));
    }
    return list;
};

function getDateTime(str = ''){
    str = ('' + str).replace(/\s*/g,'');

    let time = str.match(/\d{2,2}:\d{2,2}$/g);

    if ( !time || !Array.isArray(time) ){
        return +new Date();
    }
    time = time[0].split(':');
    if ( time.length === 2 ){
        let now = str.replace(/\d{2,2}:\d{2,2}$/g , '');
        let nowArr = now.indexOf('/') >= 0 ? now.split('/') : [];

        if ( nowArr.length !== 3 ){
            return +new Date();
        }
        return +new Date(+nowArr[2] , +nowArr[1] - 1 , +nowArr[0] , +time[0] , +time[1]);
    }
    return +new Date();
}

function getIpoInformation(ipoDom) {
    if ( !ipoDom )
        return {};
    let dataListDom = ipoDom.find('span');

    let dateTime = getDateTime(dataListDom.eq(0).text().trim());
    let stockCode = dataListDom.eq(1).text().trim();
    let stockName = dataListDom.eq(2).text().trim();
    let shortText = dataListDom.eq(3).text().trim();
    let fileInfo = dataListDom.eq(4).text().trim();
    let fileUrl = new URL(ipoDom.find('a').eq(0).attr('href') , HKEX_URL).href;
    let fileName = ipoDom.find('a').eq(0).text().trim();
    return {dateTime,stockCode,stockName,shortText,fileInfo,fileUrl,fileName};
}

exports.getData = (html = '') =>{
    let state = getState(html);
    let $ = cheerio.load(html);
    let pagination = getTotal($);
    let list = [];
    if ( pagination.count !== 0 && isNotEmpty($) ){
        list = getIpoList($);
    }
    return {state , pagination , list};
}

exports.getState = getState;
