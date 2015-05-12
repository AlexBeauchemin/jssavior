//Use tracekit to include complete stacktrace?
(function(window){
  'use strict';
  window.JSSavior = {
    version: "1.2.3",
    config: {
      context: null,
      id: '',
      keepConsoleErrors: true,
      url: window.location.protocol + '//www.jssavior.com/api/send/'
      //url: window.location.protocol + '//localhost:3000/api/send/'
    },

    init: function() {
      var _this = this;

      _this.setConfig();

      // If loaded async, send any errors saved in the queue (happened before jssavior finished loading)
      if (JSSaviorConfig && JSSaviorConfig.errorQueue) {
        for (var index = 0; index < JSSaviorConfig.errorQueue.length; ++index) {
          _this.handleError(JSSaviorConfig.errorQueue[index]);
        }
      }

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
      if (data.message && data.message.indexOf('Script error.') > -1) {
        return !_this.config.keepConsoleErrors;
      }

      data.domain = location.hostname;
      data.project = _this.config.id;
      data.url = document.URL;
      data.userAgent = navigator.userAgent;
      data.version = _this.version;
      if (_this.config.context) data.context = _this.config.context;

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

      if(!!window.jQuery) {
        $.ajax({
          contentType: 'application/json',
          data: JSON.stringify(data),
          type: 'POST',
          url: _this.config.url
        }).done(function(data) {
          _this.handleResult(data);
        }).fail(function() {
          console.log('JSSavior: jQuery failed to send error request to server');
        });

        return;
      }

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

      if (typeof window.console === "undefined") {
        window.console = {
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

        if (typeof JSSaviorConfig.context != "undefined") {
          _this.config.context = JSSaviorConfig.context;
        }

        if (typeof JSSaviorConfig.apiUrl != "undefined") {
          _this.config.url = JSSaviorConfig.apiUrl;
        }
      }

      if (!this.config.id) console.log('JSSavior: You need to provide an account id');
    },

    test: function (msg) {
      var _this = this;

      _this.handleError({
        column: 0,
        errorObj: false,
        file: 'test.js',
        line: 0,
        message: msg
      });
    }
  };

  JSSavior.init();
})(window);
