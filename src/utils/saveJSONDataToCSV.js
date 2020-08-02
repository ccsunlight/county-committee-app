/**
 * Checks for a data json string for a list and if present uses that
 * to create the list. For use with JSON rest POST requests.
 *
 * @param {Object} context The hook context
 * @return {Object} The modified hook context
 */
module.exports = function saveJSONDataToCSV(context) {
  if (context.data.hasOwnProperty("file_data")) {
    let csvBase64DataObject = context.data.file_data.pop();
    if (csvBase64DataObject) {
      let csvFileTempFilePath = context.app
        .service("utils")
        .saveBase64CSVDataToTempFile(
          csvBase64DataObject.src,
          csvBase64DataObject.title
        );

      context.data.filepath = csvFileTempFilePath;
    }
  }

  return context;
};
