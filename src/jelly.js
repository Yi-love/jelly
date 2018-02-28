'use strict';

const ajiax = require('@cray/ajiax');
const util = require('../lib/util');
const config = require('./config');
const parser = require('./parser');

class Jelly {
    constructor(options){
        this.startTime = options.startTime || Date.now();
        this.endTime = options.endTime || Date.now();

        this.startTime = new Date(+this.startTime);
        this.endTime = new Date(+this.endTime);

        this.isFull = 'isFull' in options ? !!options.isFull : true;

        this.isFirst = true;

        this.state = '';
        this.stateGenerator = '';
        this.stateEncrypted = '';

        this.list = [];
        this.pagination = {};
    }
    setSate(state){
        this.state = state.state;
        this.stateGenerator = state.stateGenerator;
        this.stateEncrypted = state.stateEncrypted;
        return this;
    }
    setFirst(frist){
        this.isFirst = false;
        return this;
    }
    setList(list = []){
        this.list = list;
        return this;
    }
    setPagination(pagination){
        this.pagination = pagination;
        return this;
    }
    setInformation(result){
        this.setFirst(false);
        this.setSate(result.state);
        this.setPagination(result.pagination);
        this.setList(result.list);
        return this;
    }
    appendInformation(result){
        this.setFirst(false);
        this.setSate(result.state);
        this.setPagination(result.pagination);
        let list = [].concat(result.list , this.list);
        this.setList(list);
        return this;
    }
    getPostOptions(){
        let options = this.getStateOptions();
        options = Object.assign({} , options , this.getTodayOptions() , this.getStartTimeOptions());
        options = Object.assign({} , options , this.getEndTimeOptions());
        return Object.assign({} , config.JELLY_POST_OPTIONS , options);
    }
    getStateOptions(){
        return {
            __VIEWSTATE: this.state,
            __VIEWSTATEGENERATOR: this.stateGenerator,
            __VIEWSTATEENCRYPTED: this.stateEncrypted
        };
    }
    getTodayOptions(){
        return {
            ctl00$txt_today: util.getDateInformation(Date.now()).formate
        }
    }
    getStartTimeOptions(){
        let startTimeInfo = util.getDateInformation(this.startTime);
        return {
            ctl00$sel_DateOfReleaseFrom_d: startTimeInfo.day,//开始日期
            ctl00$sel_DateOfReleaseFrom_m: startTimeInfo.month,
            ctl00$sel_DateOfReleaseFrom_y: startTimeInfo.year
        };
    }
    getEndTimeOptions(){
        let endTimeInfo = util.getDateInformation(this.endTime);
        return {
            ctl00$sel_DateOfReleaseTo_d: endTimeInfo.day, //结束日期
            ctl00$sel_DateOfReleaseTo_m: endTimeInfo.month,
            ctl00$sel_DateOfReleaseTo_y: endTimeInfo.year
        }
    }
    getNextOptions(){
        return {
            'ctl00$btnNext.x': util.getRandomInt(20 , 1),
            'ctl00$btnNext.y': util.getRandomInt(10 , 1)
        }
    }
    getNextPostOptions(){
        return Object.assign({} ,config.JELLY_NEXT_OPTIONS , this.getStateOptions() , this.getNextOptions());
    }
    load(){
        return this.fristLoad()
            .then(parser.getState)
            .then(this.setSate.bind(this))
            .then(this.getPostOptions.bind(this))
            .then(this.loadData.bind(this))
            .then(parser.getData)
            .then(this.setInformation.bind(this))
            .then(this.loadFullData.bind(this));
    }
    next(){
        if ( !this.isNeedLoadNext() ){
            return this;
        }
        if ( this.frist ){
            return this.load();
        }
        return this.loadData(this.getNextPostOptions())
            .then(parser.getData)
            .then(this.appendInformation.bind(this))
            .then(this.loadFullData.bind(this));
    }
    fristLoad(){
        return ajiax.get(config.JELLY_URL);
    }
    loadData(data){
        return ajiax.post({url: config.JELLY_URL,data});
    }
    loadFullData(){
        if ( this.isFull ){
            return this.next();
        }
        return this;
    }
    isNeedLoadNext(){
        if ( this.frist ){
            return true;
        }
        if ( this.pagination.end && this.pagination.count && this.pagination.end !== this.pagination.count ){
            return true;
        }
        return false;
    }
}

module.exports = (startTime , endTime , isFull = true)=>{
    return new Jelly({startTime , endTime , isFull});
}
