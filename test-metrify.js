$(document).ready(function() {
    //Load metrify bookmarklet.
    window.baseUrl='http://173.255.237.136';
    window.metrifyToken='';
    
    var s=document.createElement('script');
    s.setAttribute('type','text/javascript');
    s.setAttribute('charset','UTF-8');
    s.setAttribute('src',baseUrl + '/metrify.js');
    document.documentElement.appendChild(s);
    
    //Setup checking test results.
    $('#metrify-done-notifier').live('click', function() {
        var testCases = $('.test-case');
        var numTestCases = testCases.length;
        var numPassed = 0;
        var numFailed = 0;
        
        for (var i = 0; i < numTestCases; i++) {
            var testCase = $(testCases[i]);
            var testResult = testCase.find('.test-result').text();
            var expectedResult = testCase.find('.expected-result').text();
            
            var hasPassed = (testResult === expectedResult);
            
            if (hasPassed) {
                testCase.addClass("passed");
                numPassed++;
                testCase.find('.test-outcome').text('Passed');
            } else {
                testCase.addClass("failed");
                numFailed++;
                testCase.find('.test-outcome').text('Failed');
            }
        }

        //Display the total results.
        $('#num-total').text(numTestCases);
        $('#num-passed').text(numPassed);
        $('#num-failed').text(numFailed);
    });
});