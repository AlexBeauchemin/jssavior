JSSavior
========

JSSavior is a **free** (and [opensource](https://github.com/AlexBeauchemin/jssavior-platform)) javascript error logging platform. Simply add a javascript file to your project and javascript errors on your site will be logged in the [JSSavior](http://jssavior.com) platform.

How to use
================

[Complete doc available on jssavior.com/setup](http://jssavior.com/setup)

1) Create an account and log in on [jssavior.com](http://jssavior.com)

2) Create a project

3) Add the javascript file jssavior.min.js in your project (this file should be the first javascript file to load in your project, ideally the first script to be loaded in the header) 
```
<script src="//cdn.jsdelivr.net/jssavior/latest/jssavior.min.js"></script>
```

If you want to load jssavior asynchronously and catch errors happening before the file is loaded, add this code at the beginning of the body of the site :
```
window.onerror = function(message,file,line, column, errorObj) {
  JSSaviorConfig.errorQueue.push({
    column: column,
    errorObj: errorObj,
    file: file,
    line: line,
    message: message
  });
};
```

4) Add the ID of your project right above the code from step 3 
```
<script> 
  var JSSaviorConfig = { 
    projectId: 'xxxxxxxxx',
    errorQueue: []
  }; 
</script>
```

5) Go to your project and add the domain that you will log your errors from. If there is a javascript error in your project and the domain is not listed in the project's domains list, the error will not be logged.

6) That's it! JSSavior is now ready to log your bad coding! :)

[More info/options on how to use JSSavior here](http://jssavior.com/setup)
