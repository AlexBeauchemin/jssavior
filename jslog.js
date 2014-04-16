//Use tracekit to include complete stacktrace?
//http://danlimerick.wordpress.com/2014/01/18/how-to-catch-javascript-errors-with-window-onerror-even-on-chrome-and-firefox/
//Track ajax errors ? http://davidwalsh.name/track-errors-google-analytics
(function($){
  'use strict';
  var JSLog = {
    serviceUrl: 'http://localhost:3000/api/send/',

    init: function() {
      var _this = this;

      window.onerror = function(msg,file,line, column, errorObj) {
        //Filter out errors from a cdn file (cross-domain error), should add crossorigin attribute to the script :
        //<script src="//cdn.xxx/x.js" crossorigin></script>
//        if (msg.indexOf('Script error.') > -1) {
//          return;
//        }

        if(!JSLogConfig) {
          console.log('JSLog: You need to provide an account id');
          return;
        }

        var data = {
          domain: location.hostname,
          file: file,
          line: line,
          message: msg,
          project: JSLogConfig.projectId,
          userAgent: navigator.userAgent
        };

        if(column) data.column = column;
        if(errorObj && errorObj.message && errorObj.stack) data.stack = {message: errorObj.message, stack: errorObj.stack};

        _this.postErrorData(data);

        return true;
      };
    },

    postErrorData: function(data) {
      var _this = this;
      if(!_this.serviceUrl) return;

      data.clientInfo = _this.getClientInfo();

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

    getClientInfo: function() {
      if(!JSON || !JSON.parse) return '';
      var xmlhttp;
      if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
      else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

      xmlhttp.open("GET","http://api.hostip.info/get_json.php",false);
      xmlhttp.send();

      return JSON.parse(xmlhttp.responseText);
    },

    handleResult: function(xmlhttp) {
      if (xmlhttp.readyState==4) {
        if(xmlhttp.status === 200) {

          if(!JSON || !JSON.parse || !xmlhttp.responseText) return null;

          var result = JSON.parse(xmlhttp.responseText);
          if (result.status == 'error') {
            console.log('Javascript error cannot be logged: ' + result.reason);
          }

        } else {
          console.log('JSLog: Service unavailable');
        }
      }
    }
  };

  JSLog.init();
})(window.jQuery);
