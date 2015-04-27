/*
 * mongo-redact.js
 *
 * A mongo shell script to redact sensitive information
 * read from MongoDB, while retaining the shape of the data.
 *
 * Copyright (c) 2015, Jon Rangel
 */

load("md5.js");

var Redact = (function() {
    "use strict";

    function redactValue(val, level) {
        if (level == undefined) level = 1;

        if (typeof val == "number") {
            if (level == 2) {
                if (val === (val|0)) {
                    return 999;
                } else {
                    return 999.123;
                }
            } else {
                // return the same number
            }
        } else if (val instanceof NumberLong) {
            if (level == 2) {
                return new NumberLong(999999);
            } else {
                // return the same number
            }
        } else if (typeof val == "string") {
            if (level == 2) {
                var s = "";
                for (var i = 0; i < val.length; i++) {
                    s += "X";
                }
                return s;
            } else {
                // return MD5 hash of the string
                return MD5Hash.hex_md5(val);
            }
        } else if (val instanceof Date) {
            // return the same date
        } else if (val instanceof ObjectId) {
            // return the same Object ID
        } else if (val instanceof Array) {
            return redactArray(val, level);
        } else if (val instanceof Object) {
            return redactDoc(val, level);
        }

        return val;
    }

    function redactArray(arr, level) {
        if (level == undefined) level = 1;
        for (var i = 0; i < arr.length; i++) {
            arr[i] = redactValue(arr[i], level);
        }

        return arr;
    }

    function redactDoc(doc, level) {
        if (level == undefined) level = 1;
        for (var prop in doc) {
            if (doc.hasOwnProperty(prop)) {
                doc[prop] = redactValue(doc[prop], level);
            }
        }

        return doc;
    }

    /*
     * Override DBQuery.prototype.next() method to allow for automatic redaction.
     */
    (function() {
        var re = /^\$cmd|^system/;
        var proxied = DBQuery.prototype.next;
        DBQuery.prototype.next = function() {
            var res = proxied.apply(this, arguments);
            if (this._redactionLevel && !this._collection.getName().match(re)) {
                res = redactDoc(res, this._redactionLevel);
            }
            return res;
        };
    })();

    /*
     * Override DBCommandCursor.prototype.next() method to allow for automatic redaction.
     */
    var re = /([0-9]+)\.([0-9]+)\.([0-9]+)/;
    var version_match = version().match(re);
    var major = parseInt(version_match[1]);
    var minor = parseInt(version_match[2]);
    if (major > 2 || (major == 2 && minor >= 6)) {
        (function() {
            var proxied = DBCommandCursor.prototype.next;
            DBCommandCursor.prototype.next = function() {
                var res = proxied.apply(this, arguments);
                if (this._redactionLevel) {
                    res = redactDoc(res, this._redactionLevel);
                }
                return res;
            };
        })();
    }

    /*
     * Disable automatic redaction by default when this script is loaded.
     */
    DBQuery.prototype._redactionLevel = 0;
    if (major > 2 || (major == 2 && minor >= 6)) {
        DBCommandCursor.prototype._redactionLevel = 0;
    }

    /*
     * Enable/disable automatic redaction globally.
     */
    function setRedactionLevel(level) {
        if (level == undefined) level = true;
        if (!(level === 0 || level === 1 || level === 2)) throw Error("redaction level must be 0, 1 or 2");
        DBQuery.prototype._redactionLevel = level;
        if (major > 2 || (major == 2 && minor >= 6)) {
            DBCommandCursor.prototype._redactionLevel = level;
        }
    }

    function getRedactionLevel() {
        var level = DBQuery.prototype._redactionLevel;
        if (major > 2 || (major == 2 && minor >= 6)) {
            assert(DBCommandCursor.prototype._redactionLevel == level);
        }
        return level;
    }

    /*
     * Enable/disable redaction on a per query basis (for find()).
     */
    DBQuery.prototype.redact = function(level) {
        if (level == undefined) level = 1;
        if (!(level === 0 || level === 1 || level === 2)) throw Error("redaction level must be 0, 1 or 2");
        this._redactionLevel = level;
        return this;
    };

    return {
        redactValue: redactValue,
        redactArray: redactArray,
        redactDoc: redactDoc,
        setRedactionLevel: setRedactionLevel,
        getRedactionLevel: getRedactionLevel
    };
})();
