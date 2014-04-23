//Use tracekit to include complete stacktrace?
(function($){
  'use strict';
  var JSSavior = {
    version: 0.1,
    serviceUrl: window.location.protocol + '//jssavior.com/api/send/',
    keepConsoleErrors: true,

    init: function() {
      var _this = this;

      if (typeof console === "undefined") {
        console = {
          log: function (msg) { }
        };
      }

      window.onerror = function(msg,file,line, column, errorObj) {
        //Skip crossdomain error in old browsers if onerror is called from another domain
        if (msg.indexOf('Script error.') > -1) {
          return;
        }

        if (!JSSaviorConfig) {
          console.log('JSSavior: You need to provide an account id');
          return;
        }

        var data = {
          domain: location.hostname,
          file: file,
          line: line,
          message: msg,
          project: JSSaviorConfig.projectId,
          userAgent: navigator.userAgent,
          version: _this.version
        };

        if (column) data.column = column;
        if (errorObj && errorObj.message && errorObj.stack) data.stack = {message: errorObj.message, stack: errorObj.stack};

        _this.postErrorData(data);

        return !_this.keepConsoleErrors;
      };
    },

    postErrorData: function(data) {
      var _this = this;
      if(!_this.serviceUrl) return;

      //data.clientInfo = _this.getClientInfo();
      data.clientInfo = {};

      var xmlhttp;
      if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
      else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

      xmlhttp.open("POST", _this.serviceUrl, true);
      xmlhttp.setRequestHeader('Content-Type', 'application/json');

      xmlhttp.onreadystatechange = function() {
        _this.handleResult(xmlhttp);
      };

      xmlhttp.send(JSON.stringify(data));
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
    }
  };

  JSSavior.init();
})(window.jQuery);
