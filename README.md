### QiubaiWarm
> 这是一个控制台程序，没事就看看笑话放松一下吧, (*^__^*) 嘻嘻……

## 运行
```bash
# 安装依赖
npm i

# 运行查看
npm run start
```

## 简介
> 闲来无事，做个一个node爬虫来爬取糗百笑话，涉及模块如下
* `fs`          node自带文件操作模块
* `superagent`  来进行爬虫操作
* `cheerio`     来爬取到的网页内容进行dom操作，用法和JQ的语法几乎一致

## 功能
* 按下 ENTER 切换下一条
* 按下 CTRL + C 可以退出
* 输入 QUIT 即可退出 
* 输入 AUTO 即可自动间隔4秒切换下一条