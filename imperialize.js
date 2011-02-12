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
            var ch = amount.charAt(i);
            
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
        var normalizedNumber = Math.abs(number);
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
        
        if (normalizedNumber < 0) {
            multiplier = -1;
            normalizedNumber = -normalizedNumber;
        }
        
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
        var normalizedNumber = Math.abs(number);
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
        
        // Take out the unary + or -.
        var sign = "";
        var firstChar = numberAsString.charAt(0);
        
        if (firstChar == '+' || firstChar == '-') {
            sign = firstChar;
            numberAsString = numberAsString.substring(1);
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
        
        var result = sign + wholePart;
        if (numberParts.length > 1) {
            result += decimalMark + numberParts[1];
        }
        
        return result;
    };
    
    /**
     * Escape special regex characters.
     */
    var escapeRegex = function(str) {
        return str.replace(/([\\\.\$\^\{\}\(\)\+\*\?\|])/g, '\$1');
    };
    
    // The general regular expression used to find the quantities to convert.
    var quantityPattern = 
        /\b([\+\-]?(\d+|\d{1,3}(([\s,])\d{3})+)(([.])\d+)?)(\s*|-)?(kilometers?|km|meters?|metres?|m|centimeters?|centimetres?|cm|mm|millimeters?|millimetres?|grams?|grammes?|g|kilograms?|kilogrammes?|kg|Â°C|ÂºC|&deg;C|celsius|degrees? celsius)\b/i;
    var fullQuantityGroup = 0;
    var amountGroup = 1;
    var wholePartGroup = 2;
    var decimalMarkGroup = 6;
    var thousandsSeparatorGroup = 4;
    var unitSeparatorGroup = 7;

    // Start converting the quantities in the body of the page.
    var body = document.getElementsByTagName('body')[0];
    var bodyHtml = body.innerHTML;
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
        var unitSeparator = quantityMatch[unitSeparatorGroup]
        
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
        
        // Record the presence of any unary '+' on front of the number.
        var hasUnaryPlus = (fullQuantity.charAt(0) == '+');
        
        // Figure out which units we're working with.
        var intercept = 0;
        var slope = 1;
        var toUnits = "";
        
        if (/kilometers?|km/i.test(units)) {
            intercept = 0;
            slope = 0.621371192;
            toUnits = "miles";
            
        } else if (/(meters?|metres?|m)/i.test(units)) {
            intercept = 0;
            slope = 3.2808399;
            toUnits = "ft";
            
        } else if (/centimeters?|centimetres?|cm/i.test(units)) {
            intercept = 0;
            slope = 0.393700787;
            toUnits = "in";
            
        } else if (/mm|millimeters?|millimetres?/i.test(units)) {
            intercept = 0;
            slope = 0.0393700787;
            toUnits = "in";
            
        } else if (/grams?|grammes?|g/i.test(units)) {
            intercept = 0;
            slope = 0.0352739619;
            toUnits = "oz";
            
        } else if (/kilograms?|kilogrammes?|kg/i.test(units)) {
            intercept = 0;
            slope = 2.20462262;
            toUnits = "lb";
            
        } else if (/(Â°C|ÂºC|&deg;C|celsius|degrees? celsius)/i.test(units)) {
            intercept = 32;
            slope = 9/5;
            toUnits = "&deg;F";
        }
        
        // Convert the number.
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
        
        var convertedQuantity = strConvertedAmount + unitSeparator + toUnits;
        
        if (hasUnaryPlus && convertedAmount > 0) {
            strConvertedAmount = '+' + strConvertedAmount;
        }
        
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
    
    if (document.createEvent) {
        //
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, 
                        false, false, false, false, 0, null);
        signalElement.dispatchEvent(evt);
    
    } else if (document.createEventObject) {
        var evt = document.createEventObject();
        signalElement.fireEvent('onclick', evt);
    }
    //(evt)? signalElement.dispatchEvent(evt) : (signalElement.click && signalElement.click());

})();
