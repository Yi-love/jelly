'use strict';

const jelly = require('../index');

jelly().load().then((result)=>{
  console.log('pagination: ' , result.pagination);
  console.log('list: ' , result.list);
});
