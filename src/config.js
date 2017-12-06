'use strict';

const {getDateInformation , getRandomInt} = require('../lib/util');

let dateInfo = getDateInformation(Date.now());

exports.JELLY_URL = 'http://www.hkexnews.hk/listedco/listconews/advancedsearch/search_active_main_c.aspx';

exports.JELLY_POST_OPTIONS = {
    __VIEWSTATE: '',
    __VIEWSTATEGENERATOR: '',
    __VIEWSTATEENCRYPTED: '',

    ctl00$txt_today: dateInfo.formate, //今天

    ctl00$hfStatus: 'ACM',

    ctl00$rdo_SelectDocType: 'rbAfter2006',
    ctl00$sel_DocTypePrior2006: -1,

    ctl00$sel_tier_2_group: -2,
    ctl00$sel_tier_1: 3,
    ctl00$sel_tier_2: 153,
    ctl00$ddlTierTwo: '59,1,7',
    ctl00$ddlTierTwoGroup: '26,5',

    ctl00$sel_DateOfReleaseFrom_d: dateInfo.day,//开始日期
    ctl00$sel_DateOfReleaseFrom_m: dateInfo.month,
    ctl00$sel_DateOfReleaseFrom_y: dateInfo.year,

    ctl00$sel_DateOfReleaseTo_d: dateInfo.day, //结束日期
    ctl00$sel_DateOfReleaseTo_m: dateInfo.month,
    ctl00$sel_DateOfReleaseTo_y: dateInfo.year,

    ctl00$rdo_SelectDateOfRelease: 'rbManualRange',

    ctl00$rdo_SelectSortBy: 'rbDateTime', //按时间排序

    ctl00$sel_defaultDateRange:'SevenDays'
};

exports.JELLY_GET_OPTIONS = {
    __VIEWSTATE: '',
    __VIEWSTATEGENERATOR: '',
    __VIEWSTATEENCRYPTED: ''
};

exports.JELLY_NEXT_OPTIONS = {
    __VIEWSTATE: '',
    __VIEWSTATEGENERATOR: '',
    __VIEWSTATEENCRYPTED: '',
    'ctl00$btnNext.x': getRandomInt(20 , 1),
    'ctl00$btnNext.y': getRandomInt(10 , 1)
};
