# Nobi
### 纪念 Nobi哒哒哒
Nobi哒哒哒: 马大美，喜欢《哆啦A梦》动画片。妖性十足的一个小姑凉。        
Nobi Nobita: 野比大雄，直译即野比伸太或野比野比太，中文通称大雄，旧译叶大雄、野比太、康夫、大宝等，英/美国版本称Noby。是藤子·F·不二雄的漫画和动画作品《哆啦A梦》中的主人公，也是作品首位出场角色。
![](http://images.hfuusec.cn/18-12-8/33933070.jpg)
# 说明
react库精简版,造轮子,练习技术。
* 项目搭建完成 -- 完成
* Nobi.createElement() -- 完成
* NobiDOM.render() -- 完成
* 虚拟DOM完成 -- 完成
* 组件函数 -- 完成
* 生命周期 -- 完成
* diff算法 -- 完成
* setState 优化 -- 完成
* 事件封装优化  -- 未完成
# 如何开发
会的人一看就会。不会的人看了也不会。      

"start": "webpack-dev-server --open", // 开发模式        
"build": "webpack", // 构建版本，为了方便看webpack和babel处理后的兼容性代码        
"build:babel": "babel src --watch --out-dir babelsrc", //单独查看babel编译后的jsx       
"watch": "webpack --watch",// watch
"test": "echo \"Error: no test specified\" && exit 1"

# 参考
[从零开始实现一个Reac](https://github.com/hujiulong/blog/issues/6)
[Didact: a DIY guide to build your own React](https://engineering.hexacta.com/didact-learning-how-react-works-by-building-it-from-scratch-51007984e5c5)
[Didact Fiber: Incremental reconciliation](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec)