# jelly
Get ipo stock list from hkexnews.

```js
const jelly = require('@cray/jelly');

jelly.pre().then((result)=>{
  console.log('ipo result: ' , result);
});
```


## jelly.pre(week , options)

- week 最近7天 ，true: 默认最近7天 , false: 当天
- options  request配置
 