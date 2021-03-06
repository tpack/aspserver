

var Url = require('url');
var QueryString = require('querystring');
var HttpValueCollection = require('./httpvaluecollection');

/**
 * 提供用于在处理 Web 请求时编码和解码 URL 的方法。 
 * @namespace
 */
var HttpUtility = {

	getDateFromHeader: function(value){
		if(!value)
			return null;
		try{
			return new Date(value);
		} catch(e){
			
		}
	},
	
	getAttributeFromHeader: function(headerValue, attrName){
		if(!headerValue){
			return null;
		}
		
		var re  =new RegExp('\\b\\s*' + attrName + '\s*=\s*(.*?)\s*(;|$)', 'i');
		re = headerValue.match(re);
		return re ? re[1] : null;
	},
	
	/**
	 * 将字符串最小限度地转换为 HTML 编码的字符串。
	 * @param {String} value 要编码的字符串。
	 * @returns {String} 一个已编码的字符串。
	 */
	htmlAttributeEncode: function(value){
		if(!value){
			return '';
		}
		
		return value.replace(/\"/g, "&quot;").replace(/&/g, "&amp;").replace(/</g, "&lt;");
	},
	
	/**
	 * 将对象的字符串表示形式转换为 HTML 编码的字符串，并返回编码的字符串。
	 * @param {String} value 要编码的字符串。
	 * @returns {String} 一个已编码的字符串。
	 */
	htmlEncode: (function() {
        var entities = {
            '&': '&amp;',
            '>': '&gt;',
            '<': '&lt;',
            '"': '&quot;'
        };
        
        return function(value) {
            return value ? value.replace(/[&><"]/g, function(match) {
                return entities[match];    
            }) : value;
        };
    })(),
	
	/**
	 * 将已经为 HTTP 传输进行过 HTML 编码的字符串转换为已解码的字符串。
	 * @param {String} value 要解码的字符串。
	 * @returns {String} 一个已解码的字符串。
	 */
	htmlDecode: (function() {
        var entities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&quot;': '"'
        };
        
        return function(value) {
            return (!value) ? value : value.replace(/&(amp|lt|gt|quot|#[0-9]{1,5})/g, function(match, capture) {
                if (capture in entities) {
                    return entities[capture];
                } else {
                    return String.fromCharCode(parseInt(capture.substr(2), 10));
                }
            });
        };
    })(),

    /**
     * Appends content to the query string of a URL, handling logic for whether to place
     * a question mark or ampersand.
     * @param {String} url The URL to append to.
     * @param {String} string The content to append to the URL.
     * @returns (String) The resulting URL
     */
    urlAppend : function(url, string) {
        if (string) {
            return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
        }

        return url;
    },
	
	/**
	 * 使用 UTF8 编码将查询字符串分析成一个 JSON 对象。
	 * @param {String} value 要分析的查询字符串。
	 * @returns {String} 查询参数和值的对象。
	 */
	parseQueryString: function(value){
		value = QueryString.parse(value);
		value.__proto__ = HttpValueCollection.prototype;
		return value;
	},
	
	/**
	 * 将一个 JSON 对象使用 UTF8 编码处理成查询字符串。
	 * @param {String} value 查询参数和值的对象。
	 * @returns {String} 查询字符串。
	 */
	stringifyQueryString: function(value){
		return QueryString.stringify(value);
	},
	
	/**
	 * 将字符串分析成一个 JSON 对象。
	 * @param {String} value 要分析的字符串。
	 * @returns {String} 一个对象。
	 */
	parseJSON: function(value){
		return value === undefined ? value : JSON.parse(value);
	},
	
	/**
	 * 将一个 JSON 对象使用 UTF8 编码处理成字符串。
	 * @param {String} value 一个对象。
	 * @returns {String} 字符串。
	 */
	stringifyJSON: function(value){
		return JSON.stringify(value);
	},
	
	/**
	 * 对字符串进行编码。
	 * @param {String} value 要编码的字符串。
	 * @returns {String} 一个已编码的字符串。
	 */
	javaScriptStringEncode: function(value){
		if(!value){
			return '';
		}
		
		var  metaObject = {
                    '\b': '\\b',
                    '\t': '\\t',
                    '\n': '\\n',
                    '\f': '\\f',
                    '\r': '\\r',
                    '\\': '\\\\'
                },
		str = this.replace(/[\x00-\x1f\\]/g, function (chr) {
                            var special = metaObject[chr];
                            return special ? special : '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4)
                        });
        return '"' + str.replace(/"/g, '\\"') + '"';
	},
	
	/**
	 * 对字符串进行编码。
	 * @param {String} value 要解码的字符串。
	 * @returns {String} 一个已解码的字符串。
	 */
	javaScriptStringDecode: function(value){
		if(!value){
			return '';
		}
		
		return this.replace(/^["']|["']$/g, "").replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\'/,"\\'");
	},
	
	/**
	 * 对 URL 字符串进行编码。
	 * @param {String} value 要解码的字符串。
	 * @returns {String} 一个已解码的字符串。
	 */
	urlEncode: function(value){
		if(!value){
			return null;
		}
		
		try{
			return encodeURIComponent(value);
		}catch(e){
			return value;
		}
		
	},
	
	/**
	 * 将已经为在 URL 中传输而编码的字符串转换为解码的字符串。
	 * @param {String} value 要解码的字符串。
	 * @returns {String} 一个已解码的字符串。
	 */
	urlDecode: function(value){
		if(!value){
			return null;
		}
		
		try{
			return decodeURIComponent(value);
		}catch(e){
			return value;
		}
		
	},
	
	/**
	 * 对 URL 字符串的路径部分进行编码，以进行从 Web 服务器到客户端的可靠的 HTTP 传输。
	 * @param {String} value 要解码的字符串。
	 * @returns {String} 一个已解码的字符串。
	 */
	urlPathEncode: function(value){
		if(!value){
			return null;
		}
		
		try{
			return encodeURI(value);
		}catch(e){
			return value;
		}
		
	},
	
	/**
	 * 将已经为在 URL 中传输而编码的路径部分转换为解码的字符串。
	 * @param {String} value 要解码的字符串。
	 * @returns {String} 一个已解码的字符串。
	 */
	urlPathDecode: function(value){
		if(!value){
			return null;
		}
		
		try{
			return decodeURI(value);
		}catch(e){
			return value;
		}
		
	},
	
    /**
     * 调试输出一个对象。
     * @param {} obj 
     * @returns {} 
     */
	trace: function(obj){
		if(typeof obj === 'object'){
			for(var key in obj) {
				switch(typeof obj[key]){
					case 'number':
					case 'string':
					case 'boolean':
					case 'undefined':
						console.log(key, ": ", obj[key]);
						break;
					case 'object':
						if(obj[key] === null) {
							console.log(key, ": null");
							break;
						}
						
						console.log(key, ": " + obj[key].toString());
						break;
					case 'function':
						console.log(key, ": [Function]");
						break;
						
					default:
						console.log(key, ": ", obj[key]);
						break;
				}
			}
			
			return;
		}
		
		console.log(obj);
	}
};

module.exports = HttpUtility;