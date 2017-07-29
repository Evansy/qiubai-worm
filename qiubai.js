/**
 * created by 小柏 2017/01/17
 * mail: skcy@vip.qq.com
 * git: https://github.com/Evansy/qiubai-worm
 */

// 系统组件 使用方法参考http://www.myexception.cn/javascript/2010018.html
const readline = require('readline'),
	fs = require('fs');

// 第三方组件 使用方法参考http://wiki.jikexueyuan.com/project/node-lessons/superagent-cheerio.html
const cheerio = require('cheerio'),
	superagent = require('superagent');

//创建readline接口实例
var  rl = readline.createInterface({
	input:process.stdin,
	output:process.stdout
});

// 全局参数
var page = 1,			// pageIndex
	allwords = [],		// 所有的笑话语句
	currentIndex = 0;	// 当前笑话索引

// 爬虫实例
var qiubaiWorm = {};

// 爬虫开始执行参数
qiubaiWorm.start = function(){

	let _this = this;

	// 开始调试提示语
	console.log(
		' ----- 糗百小爬虫 -----\r\n\r\n '+
		'* 按下 ENTER 切换下一条\r\n '+
		'* 按下 CTRL + C 可以退出\r\n '+
		'******************************\r\n '+
		'* 输入 QUIT 即可退出哦\r\n ' + 
		'* 输入 AUTO 即可自动间隔4秒切换下一条' +
		'\r\n'
	);
	// 检测是否存在存储数据文件
	let check = _this.checkTime()

	check.then(()=>{

		// 开始获取笑话数据
		_this.getNewWord();

		// 开始执行用户输入监听
		_this.line();

	}).catch((erro)=>{

		// 开始获取笑话数据
		_this.getNewWord();

		// 开始执行用户输入监听
		_this.line();

	})
	
}

qiubaiWorm.checkTime = function () {
	return new Promise((resolve, reject) => {
		// 如果本地存在已经存储的页数
		fs.readFile('default.ini', 'utf8', (err, data) => {

			let parseData = null;
			let nowTime = Date.parse(new Date()) / 1000;	// 当前时间时间戳

			// 如果读取文件发生错误
			if (err) {
				reject(err);
				return false;
				// throw err;
			}

			// 读取文件信息
			fs.stat('default.ini', function(erro, datas){
				// 读取修改时间出错
				if (erro) {
					reject(erro);
					return false;
					// throw erro;
				}

				// 读取文件修改时间
				let FileFixedTime = Date.parse(datas.mtime) / 1000;
				// 与当前时间比对
				let diffTime = (FileFixedTime - nowTime) / 24 / 3600;

				// 如果时间间隔超过一天了 重置笑话条数索引
				if (diffTime > 1){
					page = 0;
					currentIndex = 0;
					resolve();
					return false;
				} 

				// 如果文件内容不为空
				if(data !== "undefined"){
					// 如果转换文件内容为JSON出错
					try{
						parseData = JSON.parse(data);
					}catch(error){}
					
					// 如果成功转换JSON参数
					if(parseData){
						page = parseData.pageIndex;
						currentIndex = parseData.currentIndex;
					}
					resolve();
				} else {
					reject("no data in file.");
				}
				
			});
			
		});
	})
}

qiubaiWorm.getNewWord = function(){

	// 爬虫请求糗百笑话数据
	superagent.get('http://www.qiushibaike.com/hot/page/'+ page)
		.end(function(err,res){

			// 请求错误处理
			if (err) {
				return ("不要按太快啦~");
			}

			// 获取正常返回对象
			var $ = cheerio.load(res.text);
			// 每次请求清空本地数组,重置currentIndex
			allwords.splice(0, currentIndex);
			currentIndex = 0;
			
			// 获取到所有的笑话文本，存储到本地数组
			var spans = $('.article').not('.thumb').find('.content > span');
			spans.each(function(i,item){
				allwords.push($(item).text().trim());
			})
	})
}

qiubaiWorm.line = function(){
	// 监听用户输入
	var _this = this;

	rl.on('line', function(line){

		// 处理用户输入
		switch (line.trim()){
			case 'QUIT':
			// 如果用户输入'QUIT' 则关闭。
				rl.close();
				break;
			case 'AUTO':
				// 如果用戶输入'AUTO'则每隔4秒自动显示下一个
				outputWord();
				setInterval(outputWord, 4000);
				break;
			default:
				outputWord();
				break;
		}

		// 如果用户输入'QUIT' 则关闭。
		// line.trim() == 'QUIT' && rl.close()
	})

	function outputWord() {

		// 如果当前页的看得只剩3条了 就提前开始请求下一页的数据。
		if( currentIndex >= allwords.length - 3 ){
			page ++;				// PAGEINDEX
			_this.getNewWord();		// 请求数据
		}

		// console.log("currentIndex: ", currentIndex, "allwords: ", allwords.length, "page", page);

		// 如果当前不是最后一条
		if(currentIndex != allwords.length - 1 && allwords.length > 0){
			// 如果当前这一条内容不为undefined，说明有内容，否则表示接口请求出问题了, 或者记录条数超过了一页的数据
			if(typeof allwords[currentIndex] != "undefined"){
				// 输出笑话
				console.log(allwords[currentIndex] + "\n");
				// 笑话条数+1
				currentIndex ++;
			}else{
				console.log('爬虫出小差啦~，有问题请一定反馈给小柏君！skcy@vip.qq.com')
			}
		}
	}
}

// close事件监听
rl.on("close", function(){
	// 记录当前页数 如果超过一天即从第一页开始
	var resultBuffer = new Buffer(JSON.stringify(
		{
			"tips": "请不要更改此文件，否则无法记录上次看到哪儿了哦",
			"pageIndex": page, 
			"currentIndex": currentIndex
		}
	));
	// fs.createWriteStream('default.ini');
	fs.writeFile('default.ini', resultBuffer, (err) => {
		// if (err) throw err;
		// console.log('It\'s saved!');

		console.log('\r\n记得下次还来看我哦。');
		// 结束程序
		process.exit(0);
	});

	
});

// 开始任务
qiubaiWorm.start();
