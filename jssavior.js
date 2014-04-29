//Use tracekit to include complete stacktrace?
(function(window){
  'use strict';
  window.JSSavior = {
    version: 0.1,
    config: {
      id: '',
      keepConsoleErrors: true,
      url: window.location.protocol + '//jssavior.com/api/send/'
    },

    init: function() {
      var _this = this;

      _this.setConfig();

      window.onerror = function(message,file,line, column, errorObj) {
        return _this.handleError({
          column: column,
          errorObj: errorObj,
          file: file,
          line: line,
          message: message
        });
      };
    },

//    getClientInfo: function() {
//      if(!JSON || !JSON.parse) return '';
//      var xmlhttp;
//      if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
//      else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//
//      xmlhttp.open("GET","http://api.hostip.info/get_json.php",false);
//      xmlhttp.send();
//
//      return JSON.parse(xmlhttp.responseText);
//    },

    handleError: function(data) {
      var _this = this;

      if (!this.config.id) {
        return !_this.config.keepConsoleErrors;
      }

      //Skip crossdomain error in old browsers if onerror is called from another domain
      if (data.message.indexOf('Script error.') > -1) {
        return !_this.config.keepConsoleErrors;
      }

      data.domain = location.hostname;
      data.project = _this.config.id;
      data.url = document.URL;
      data.userAgent = navigator.userAgent;
      data.version = _this.version;


      if (data.errorObj && data.errorObj.message && data.errorObj.stack) {
        data.stack = {
          message: data.errorObj.message,
          stack: data.errorObj.stack
        };
        delete data.errorObj;
      }

      _this.postErrorData(data);

      return !_this.config.keepConsoleErrors;
    },

    handleResult: function(xmlhttp) {
      try {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status === 200) {

            if (!JSON || !JSON.parse || !xmlhttp.responseText) return null;

            var result = JSON.parse(xmlhttp.responseText);
            if (result.status == 'error') {
              console.log('Javascript error cannot be logged: ' + result.reason);
            }

          } else {
            console.log('JSSavior: Service unavailable');
          }
        }
      }
      catch (err) {}
    },

    postErrorData: function(data) {
      var _this = this;
      if(!_this.config.url) return;

      //data.clientInfo = _this.getClientInfo();
      data.clientInfo = {};

      var xmlhttp;
      if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
      else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

      xmlhttp.open("POST", _this.config.url, true);
      xmlhttp.setRequestHeader('Content-Type', 'application/json');

      xmlhttp.onreadystatechange = function() {
        _this.handleResult(xmlhttp);
      };

      xmlhttp.send(JSON.stringify(data));
    },

    setConfig: function() {
      var _this = this;

      if (typeof console === "undefined") {
        console = {
          log: function (msg) { }
        };
      }

      if (JSSaviorConfig) {
        if (typeof JSSaviorConfig.keepConsoleErrors != "undefined") {
          _this.config.keepConsoleErrors = JSSaviorConfig.keepConsoleErrors;
        }

        if (typeof JSSaviorConfig.projectId != "undefined") {
          _this.config.id = JSSaviorConfig.projectId;
        }
      }

      if (!this.config.id) console.log('JSSavior: You need to provide an account id');
    }
  };

  JSSavior.init();
})(window);
