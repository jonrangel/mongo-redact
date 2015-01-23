# redaction
Tools for redacting data.

## mongo-redact
A simple MongoDB shell script to redact a document, removing potentially sensitive information while retaining the shape (_including field names_) of the document.

- Ints and floats are replaced by 999
- Longs are replaced by 999999
- Strings are replaced by "XXXXXXXX"

Usage:

1. Start an interactive `mongo` shell, running the `mongo-redact.js` script at startup:

   ```
   mongo mongo-redact.js --shell
   ```

2. The functions `redactDoc()` and `printRedactedDoc()` are now available in the shell.  e.g.

   ```javascript
   var doc = db.collection.findOne();
   printRedactedDoc(doc);
   ```
