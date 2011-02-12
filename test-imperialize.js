/**
 * Process the test results.
 */
function processTestResults() {
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
}

$(document).ready(function() {
    // Add a special signaling element to the body.
    var body = document.getElementsByTagName('body')[0];
    var bodyHtml = body.innerHTML;
    var signalElementHtml = '<a href="#" id="metrify-done-notifier" ' +
                            'style="display: none !important;" ' +
                            'onclick="processTestResults(); return false"></a>';
    bodyHtml += signalElementHtml;
    body.innerHTML = bodyHtml;
    
    //Load metrify bookmarklet.
    
    var s=document.createElement('script');
    s.setAttribute('type','text/javascript');
    s.setAttribute('charset','UTF-8');
    s.setAttribute('src', 'imperialize.js');
    document.documentElement.appendChild(s);
    
    //Setup checking test results.
//    $('#metrify-done-notifier').live("click", function() {
//        processTestResults();
//        return false;
//    });
});