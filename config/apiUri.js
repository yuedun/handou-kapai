
var FunModules = {
	GIFT: 'gift',
    PROCESS: 'process',
    ADDRESS: 'address',
    USERGIFT: 'userGift',
    CATEGORY: 'category',
    PICTURE: 'pictures',
    SHARE: 'share',
    NEWS: 'news',
    NEWSWX: 'newswx',
    COMMENTS: 'comments',
    ZANBIAN: 'zanbian',
    NEWSFILTER: 'newsFilter',
    ISLIKE: 'isLike',
    FEEDBACKPDS: 'feedbackPds'
};

var URI_PREFIX = '/lofti/api/', PATH_SEPT = '/';

var apiUri = {
	baseApi: URI_PREFIX,
	giftUri: URI_PREFIX + FunModules.GIFT,
	giftProcessUri: URI_PREFIX + FunModules.GIFT + PATH_SEPT + FunModules.PROCESS,
    addressUri: URI_PREFIX + FunModules.GIFT + PATH_SEPT + FunModules.ADDRESS,
    userGiftUri: URI_PREFIX + FunModules.GIFT + PATH_SEPT + FunModules.USERGIFT,
    categoryUri: URI_PREFIX + FunModules.GIFT + PATH_SEPT + FunModules.CATEGORY,
    pictureUri: URI_PREFIX + FunModules.PICTURE,
    shareUri: URI_PREFIX + FunModules.SHARE,
    newsUri: URI_PREFIX + FunModules.NEWS,
    newswxUri: URI_PREFIX + FunModules.NEWSWX,
    newsFilterUri: URI_PREFIX + FunModules.NEWS + PATH_SEPT + FunModules.NEWSFILTER,
    commentsUri: URI_PREFIX + FunModules.COMMENTS,
    zanbianUri: URI_PREFIX + FunModules.ZANBIAN,
    isLikeUri: URI_PREFIX + FunModules.ISLIKE,
    feedbackPdsUri: URI_PREFIX + FunModules.FEEDBACKPDS
};

module.exports = apiUri;