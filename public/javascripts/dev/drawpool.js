var totalCapacity = 100;
/**
 * 在totalCapacity(1000)个候选字中，随机获取一个字
 * @param {Object} drawpool
 */
var lightAWord = function(drawpool) {
	var randomIndex = getRandom(totalCapacity);
	return drawpool[randomIndex];
};
var removeSequenceUnit = function(arr,removeIndex){
	arr.splice(removeIndex,1);
};
var getRandom = function(max) {
	return Math.floor(Math.random() * max); //可均衡获取0到max的随机整数。
};
var dispatchWordProportion = function() {
	var wordPool = [];
	var wordDispatchProportion = []; //提取字库，用于字库装在时进行抽取
	var proportion = [23, 15, 19, 11, 16, 15, 1];
//分配每个字出现的概率
	for (var i = 0,j=7; i < 7; i++,j--) {
		var index = getRandom(j);
		wordDispatchProportion[i] = {
			volumn:proportion[index],
			word:i
		};
		removeSequenceUnit(proportion,index);
	}
	//按照比例装载字库
	while(true){
		index = getRandom(wordDispatchProportion.length);
		var word = wordDispatchProportion[index].word;
		wordDispatchProportion[index].volumn--;
		//向字库装载当前提取的字
		wordPool.push(word);
		//当前字的比例完全分配完后，从提取字库中剔除
		if(wordDispatchProportion[index].volumn <= 0){
			removeSequenceUnit(wordDispatchProportion,index);
		}
		if(wordDispatchProportion.length == 0){
			break;
		}
	}
	return wordPool;
};