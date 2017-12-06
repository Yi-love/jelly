'use strict';

const jelly = require('../index');

jelly(new Date('2017-12-05') , new Date('2017-12-06')).load().then((result)=>{
  console.log('pagination: ' , result.pagination);
  console.log('list: ' , result.list);
});
