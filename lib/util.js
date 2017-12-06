'use strict';

exports.getDateInformation = ( date = new Date() )=>{
    date = new Date(+date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    return {
        formate: '' + year + '' + month + '' + day,
        year,
        month,
        day
    };
};

exports.getRandomInt = ( min , max ) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}