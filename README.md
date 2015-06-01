# mongo-redact
A MongoDB shell script that adds data redaction capabilities to the mongo shell, providing the option to automatically remove potentially sensitive information from documents that are read out of MongoDB, while retaining the shape (_including field names_) of the data.

Note: Data redaction works entirely in the shell at the 'presentation' layer.  The data read out of MongoDB and transmitted on the wire to the client is not redacted in any way.

## Installation
There are two ways to load the script: one-time (if you just want to test how it works) and permanent (for frequent use).

### 1. Load the script directly (one-time usage)

Invoke the `mongo` shell using this command:

```
mongo <basepath>/mongo-redact.js --shell
```

It will first load `mongo-redact.js` and then open the shell as usual. Replace the `<basepath>` part with the actual path where the `mongo-redact.js` file is located.

### 2. Load the script via the `.mongorc.js` file (permanent usage)

You can also add the following line to your `~/.mongorc.js` file to always load the file on shell startup (unless started with `--norc`):

```javascript
load('<basepath>/mongo-redact.js')
```

Replace the `<basepath>` part with the actual path where the `mongo-redact.js` file is located.

## Usage

Three levels of redaction are provided:
- **0** - Redaction is OFF. Data read from MongoDB is displayed normally. This is the default level (when the script is first loaded).
- **1** - Redaction is ON.  The shape of the data is retained by performing the following transformations to each document:
 - Strings are replaced by their MD5 hash
 - Values for all other data types (numerical, date, etc.) are left unchanged
- **2** - Redaction is ON.  Most aggressive redaction.  No values are left unredacted, however the document schema, including _type_ information, is preserved.  The following transformations are performed to each document:
  - 32-bit Ints are replaced by 999
  - 64-bit Ints are replaced by 999999
  - Floats are replaced by 999.123
  - Strings are replaced by "XXXXXXXX", where the length of the replacement string is the same as the length of the original string
  - Values for all other data types (e.g. date) are left unchanged

The script overrides the `next()` method on the `DBQuery` and `DBCommandCursor` objects to provide automatic redaction according to the currently configured redaction level, so in typical usage only the `Redact.setRedactionLevel()` function (described below) is needed.  Automatic redaction is provided for `find()` and (for MongoDB 2.6+) `aggregate()`.

The following functions are available:

---
```javascript
Redact.setRedactionLevel(<level>)
```
Set the (global) redaction level for all queries issued in this shell session.

---
```javascript
Redact.getRedactionLevel()
```
Return the current global redaction level.

---
The script extends the `DBQuery` object with a new method: `redact()`. On a collection called foo, run it with:

```javascript
db.foo.find().redact()
```

This will override the globally configured redaction level on per-query basis, displaying results of the query at redaction level 1.

---
```javascript
db.foo.find().redact(<level>)
```

This will override the globally configured redaction level on per-query basis, displaying results of the query at the specified redaction level.

---
```javascript
Redact.redactValue(<value>, <level>)
```

Redact a value and return it. The `<value>` parameter is the input value to be redacted and the (optional) `<level>` parameter specifies the redaction level (default: 1).

---
```javascript
Redact.redactArray(<array>, <level>)
```

Redact an array and return it. The `<array>` parameter is the input array to be redacted and the (optional) `<level>` parameter specifies the redaction level (default: 1).

---
```javascript
Redact.redactDoc(<doc>, <level>)
```

Redact a document and return it. The `<doc>` parameter is the input document to be redacted and the (optional) `<level>` parameter specifies the redaction level (default: 1).

## DISCLAIMER

This software is not supported by [MongoDB, Inc.](http://www.mongodb.com) under any of their commercial support subscriptions or otherwise.  Any usage of `mongo-redact` is at your own risk.  Bug reports, feature requests and questions can be posted in the [Issues](https://github.com/jonrangel/mongo-redact/issues?state=open) section here on GitHub.
