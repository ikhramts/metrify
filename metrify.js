(function() {
    /**
     * Count the number of significant figures in a number
     * represented as a string.
     */
    var countSigFigs = function(numberAsString) {
        var numSigFigs = 0;
        var numPossiblySignificantZeros = 0;
        var hasPassedDecimalMark = false;
        
        for (var i = 0; i < amount.length; i++) {
            var ch = amount[i];
            
            if (numSigFigs == 0) {
                if (ch == '.') {
                    hasPassedDecimalMark == true;
                
                } else if (ch != '0') {
                    numSigFigs = 1;
                }
            
            } else if (ch == '0') {
                if (hasPassedDecimalMark) {
                    numSigFigs++;
                
                } else {
                    numPossiblySignificantZeros++;
                }
            
            } else if (ch == '.') {
                hasPassedDecimalMark = true;
                
                // If we got here, then numSigFigs > 0; 
                // therefore any zeros we've seen so far are significant.
                numSigFigs += numPossiblySignificantZeros;
                numPossiblySignificantZeros = 0;
                
            } else {
                // Neither '0' nor decimal mark.
                numSigFigs += (numPossiblySignificantZeros + 1);
                numPossiblySignificantZeros = 0;
            }
        }
        
        return numSigFigs;
    };
    
    /**
     * Find the second significant digit in a number.  E.g. if 
     * the number is 0.0284, the function would return '8'.
     */
    var getNthDigit = function(number, n) {
        var normalizedNumber = number;
        var upperBound = Math.pow(10, n);
        var lowerBound = Math.pow(10, n - 1);
        
        while (normalizedNumber >= upperBound || normalizedNumber < lowerBound) {
            if (normalizedNumber >= upperBound) {
                normalizedNumber /= 10;
            
            } else if (normalizedNumber < lowerBound) {
                normalizedNumber *= 10;
            }
        }
        
        var nthDigit = Math.floor(normalizedNumber) % 10;
        return nthDigit;
    };
    
    /**
     * Round the number to show only a specified number of significant
     * figures.
     */
    var roundToSigFigs = function(number, numSigFigs) {
        var normalizedNumber = number;
        var upperBound = Math.pow(10, numSigFigs);
        var lowerBound = Math.pow(10, numSigFigs-1);
        var multiplier = 1;
        
        while (normalizedNumber >= upperBound || normalizedNumber < lowerBound) {
            if (normalizedNumber >= upperBound) {
                normalizedNumber /= 10;
                multiplier *= 10;
            
            } else if (normalizedNumber < lowerBound) {
                normalizedNumber *= 10;
                multiplier /= 10;
            }
        }
        
        var roundedNumber = Math.round(normalizedNumber) * multiplier;
        return roundedNumber;
    }
    
    /**
     * Get the order of magnitude of the number, i.e. the decimal place
     * associated with the most significant digit.
     */
    var getOrderOfMagnitude = function(number) {
        var normalizedNumber = number;
        var orderOfMagnitude = 1;
        
        while (normalizedNumber >= 10 || normalizedNumber < 1) {
            if (normalizedNumber >= 10) {
                normalizedNumber /= 10;
                orderOfMagnitude++;
            
            } else if (normalizedNumber < 1) {
                normalizedNumber *= 10;
                orderOfMagnitude--;
            }
        }
        
        return orderOfMagnitude;
    };
    
    /**
     * Insert thousands separators into a number kept in a string.
     */
    var insertThousandsSeparators = 
      function(numberAsString, thousandsSeparator, decimalMark) {
        if (thousandsSeparator == '') {
            return numberAsString;
        }
        
        var numberParts = numberAsString.split(decimalMark);
        var wholePart = numberParts[0];
        var i = wholePart.length - 3;
        
        while (i > 0) {
            wholePart = wholePart.substring(0, i) + 
                        thousandsSeparator +
                        wholePart.substring(i);
            i -= 3;
        }
        
        /*
        var replacement = "$1" + thousandsSeparator + $2";
        while (/\d+\d{3}\b/.test(wholePart)) {
            wholePart.replace(/(\d+)(\d{3})\b/, replacement);
        }
        */
        
        var result = wholePart;
        if (numberParts.length > 1) {
            result += decimalMark + numberParts[1];
        }
        
        return result;
    };
    
    /**
     * Escape special regex characters.
     */
    var escapeRegex = function(str) {
        return str.replace(/([\\\.\$\^\{\}\(\)])/g, '\$1');
    };
    
    // The general regular expression used to find the quantities to convert.
    var quantityPattern = 
        /\b((\d+|\d{1,3}(([\s,])\d{3})+)(([.])\d+)?)\s*(miles?|mi|foot|feet|ft|inch|inches|in|"|yards?|yd|ounces?|oz|pounds?|lb|°F|fahrenheit|degrees? fahrenheit)\b/i;
    var fullQuantityGroup = 0;
    var amountGroup = 1;
    var wholePartGroup = 2;
    var decimalMarkGroup = 6;
    var thousandsSeparatorGroup = 4;

    // Start converting the quantities in the body of the page.
    var body = document.getElementsByTagName('body')[0];
    var bodyHtml = body.innerHTML;
    var newBodyHtml = "";
    var madeChanges = false;
    
    do {
        // Find the first occurence of the quantity to convert.
        var convertPosition = bodyHtml.search(quantityPattern);
        if (convertPosition == -1) {
            break;
        }
        
        madeChanges = true;
        var quantityMatch = quantityPattern.exec(bodyHtml);
        var fullQuantity = quantityMatch[fullQuantityGroup];
        var units = quantityMatch[quantityMatch.length - 1];
        var amount = quantityMatch[amountGroup];
        
        var wholePart = quantityMatch[wholePartGroup];
        if (typeof(wholePart) == 'undefined') {
            wholePart = '';
        }
        
        // For now, assume that the numbers are written American-style,
        // i.e. thousands separator is ',' or ' ', and the decimal mark
        // is '.'.
        var decimalSeparator = '.';
        var thousandsSeparator = quantityMatch[thousandsSeparatorGroup];
        if (typeof(thousandsSeparator) == 'undefined') {
            thousandsSeparator = '';
        }
        
        if (wholePart.length < 4 && thousandsSeparator == '') {
            thousandsSeparator = ',';
        }
        
        // Figure out which units we're working with.
        var intercept = 0;
        var slope = 1;
        var toUnits = "";
        
        if (/miles?|mi/i.test(units)) {
            intercept = 0;
            slope = 1.609344;
            toUnits = "km";
            
        } else if (/(foot|feet|ft)/i.test(units)) {
            intercept = 0;
            slope = 0.3048;
            toUnits = "m";
            
        } else if (/inch|inches|in|"/i.test(units)) {
            intercept = 0;
            slope = 2.54;
            toUnits = "cm";
            
        } else if (/yards?|yd/i.test(units)) {
            intercept = 0;
            slope = 0.9144;
            toUnits = "m";
            
        } else if (/ounces?|oz/i.test(units)) {
            intercept = 0;
            slope = 28.3495231;
            toUnits = "g";
            
        } else if (/pounds?|lb/i.test(units)) {
            intercept = 0;
            slope = 0.45359237;
            toUnits = "kg";
            
        } else if (/°F|fahrenheit|degrees fahrenheit/i.test(units)) {
            intercept = -32*5/9;
            slope = 5/9;
            toUnits = "°C";
        }
        
        // Convert the number.
        if (amount == "1,000,000") {
            var x = 2;
        }
        
        if (thousandsSeparator != "") {
            var allSeparatorsPattern = new RegExp(escapeRegex(thousandsSeparator), 'g');
            amount = amount.replace(allSeparatorsPattern, "");
        }
        
        var convertedAmount = parseFloat(amount) * slope + intercept;
        
        // Format the amount as a string.
        var numSigFigs = countSigFigs(amount);
        var secondDigit = getNthDigit(convertedAmount, 2);
        
        if (numSigFigs == 1 && slope > 1 && secondDigit != 0) {
            numSigFigs = 2;
        }
        
        convertedAmount = roundToSigFigs(convertedAmount, numSigFigs);
        var numDecimals = Math.max(numSigFigs - getOrderOfMagnitude(convertedAmount), 0);
        strConvertedAmount = convertedAmount.toFixed(numDecimals);
        strConvertedAmount = 
            insertThousandsSeparators(strConvertedAmount, thousandsSeparator, '.');
        
        var convertedQuantity = strConvertedAmount + " " + toUnits;

        // Replace the old quantity with the new converted one.
        var oldQuantityPatternString = "\\b" + escapeRegex(fullQuantity) + "\\b";
        var oldQuantityPattern = new RegExp(oldQuantityPatternString, 'g');
        bodyHtml = bodyHtml.replace(oldQuantityPattern, convertedQuantity);
        
        //alert(convertedQuantity);
        
        //break;
        
    } while(true);
    
    //Append a special signal element if it does not exist.
    
    var signalElement = document.getElementById('metrify-done-notifier');
    if (signalElement == null) {
        var signalElementHtml = '<a href="javascript:void(0)" id="metrify-done-notifier" ' +
                        'style="display: none !important;"></a>';
        bodyHtml += signalElementHtml;
    }
        
    body.innerHTML = bodyHtml;
    
    //Signal that we're done.
    signalElement = document.getElementById('metrify-done-notifier');
    var event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, 
                       false, false, false, false, 0, null);
    (event)? signalElement.dispatchEvent(event) : (signalElement.click && signalElement.click());

})();