// mongo-redact.js
//
// A mongo shell function to redact sensitive information while 
// retaining the shape of the document.
//
// Jon Rangel, January 2015


// Note:
// - ints and floats are replaced with 999
// - longs are replaced with 999999
// - strings are replaced with "XXXXXXXX"


function redactValue(val) {
    if (typeof val == "number") {
        return 999;
    } else if (val instanceof NumberLong) {
        return 999999;                
    } else if (typeof val == "string") {
        return "XXXXXXXX";
    } else if (val instanceof Date) {
        // return the same date
    } else if (val instanceof ObjectId) {
        // return the same Object ID
    } else if (val instanceof Array) {
        return redactArray(val);
    } else if (val instanceof Object) {
        return redactDoc(val);
    }

    return val;
}


function redactArray(arr) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = redactValue(arr[i]);
    }

    return arr;
}


function redactDoc(doc) {
    for (var prop in doc) {
        if (doc.hasOwnProperty(prop)) {
            doc[prop] = redactValue(doc[prop]);
        }
    }

    return doc;
}


function printRedactedDoc(doc) {
    printjson(redactDoc(doc));
}
