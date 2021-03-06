var Http = require('http');var Path = require('path');var Crypto = require('crypto');/** * 包含当前请求的会话状态值和会话级别设置。 * @class */function HttpSessionState(application) {
    this._app = application;    this._sessionItems = {};    this._clearTimer = this.clearSession.bind(this);
}HttpSessionState.prototype = {

    constructor: HttpSessionState,
    _app: null,    /**	 * 实际存储的 SESSION 项。	 * @type {Object}	 */    _sessionItems: null,    _clearTimer: null,    /**	 * 获取当前 HttpSessionState 的默认超时时间。	 * @type {Integer}	 */    get timeout() {
        return this._app.timeout;
    },    /**	 * 获取当前 HttpSessionState 的默认 Session 键。	 * @type {Integer}	 */    get sessionKey() {
        return this._app.sessionKey;
    },    /**	 * 获取当前 HttpSessionState 的默认 Session 键。	 * @type {Integer}	 */    get sessionCryptoKey() {
        return this._app.sessionCryptoKey;
    },    getRawSessionId: function (context) {
        var cookie = context.request.getHeader('cookie');        var m = new RegExp('\\b' + this.sessionKey + '=(.*?)(;|$)').exec(cookie);        if (m) {
            return m[1];
        }        return null;
    },    setRawSessionId: function (context, id) {
        var cookie = this.sessionKey + '=' + id;        if (this.timeout >= 0) {
            var d = new Date();            d.setMinutes(d.getMinutes() + this.timeout);            cookie += '; Expires=' + d.toFullString();
        }        cookie += '; HttpOnly';        context.response._externalCookie = cookie;
    },    createSessionId: function (context, clock) {
        return context.request.userHostAddress + Date.now() + clock;
    },    /**	 * 获取一个 {@link HttpContext} 对象的 SessionId 。	 * @param {HttpContext} context 要获取的 context 。	 * @returns {String} SessionId 。	 */    getSessionId: function (context) {
        var id = this.getRawSessionId(context);        try {
            var c = Crypto.createDecipher('aes128', this.sessionCryptoKey);            id = c.update(id, 'hex', 'utf8') + c.final('utf8');            return id;
        } catch (e) {
            return null;
        }
    },    /**	 * 绑定一个 {@link HttpContext} 对象的 SessionId 到存储区。	 * @param {HttpContext} context 要获取的 context 。	 * @returns {String} SessionId 。	 */    setSessionId: function (context, id) {
        var c = Crypto.createCipher('aes128', this.sessionCryptoKey);        id = c.update(id, 'utf8', 'hex') + c.final('hex');        this.setRawSessionId(context, id);
    },    /**	 * 获取一个 {@link HttpContext} 对象关联的 Session 对象。	 * @param {HttpContext} context 要获取的 context 。	 * @returns {Object} 返回 Session 对象。如果不存在则返回 null 。	 */    getSession: function (context) {
        var sessionId = this.getSessionId(context);        return sessionId && this._sessionItems[sessionId];
    },    /**
     * 创建一个新的会话。	 * @param {HttpContext} context 要获取的 context 。
     * @returns {String} 返回会话 ID。 
     */    createSession: function (context) {
        var clock = 0;        var id;        do {
            id = this.createSessionId(context, clock++);
        } while (id in this._sessionItems);        return id;
    },    /**	 * 设置一个 {@link HttpContext} 对象关联的 Session 对象。	 * @param {HttpContext} context 要设置的 context 。	 * @param {Object} session 要设置的 Session 对象。	 */    setSession: function (context, session) {
        var sessionId = this.createSession(context);        this.setSessionId(context, sessionId);        this._sessionItems[sessionId] = session;        this.resetTimeout();
    },    /**
     * 清除所有会话信息。
     */    clearSession: function () {
        this._sessionItems = {};
    },    /**
     * 重置会话超时。
     */    resetTimeout: function () {
        if (this.timer) {
            clearTimeout(this.timer);            this.timer = null;
        }        if (this.timeout >= 0) {
            this.timer = setTimeout(this._clearTimer, this.timeout * 60000);
        }
    }
};module.exports = HttpSessionState;