/**
 * Created by admin on 2015/6/15.
 */
var obj=null;
var As=document.getElementById('navbar').getElementsByTagName('a');
obj = As[0];
for(var i=1;i<As.length;i++){if(window.location.href.indexOf(As[i].href)>=0)
    obj=As[i];}
obj.className='active';