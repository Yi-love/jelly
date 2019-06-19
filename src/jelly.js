'use strict';

const {getPreList} = require('./preSearch');
/** 
 * 获取当天，或7天内的招股文件
*/
exports.pre = function(week = true){
    return getPreList(week);
};