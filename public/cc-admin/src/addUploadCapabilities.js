import base64 from "base64topdf";

/**
 * Convert a `File` object returned by the upload input into
 * a base 64 string. That's easier to use on FakeRest, used on
 * the ng-admin example. But that's probably not the most optimized
 * way to do in a production database.
 */
const convertFileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsBinaryString(file.rawFile);

    reader.onload = () => {
      resolve({ title: file.title, data:btoa(reader.result) });
    };

    reader.onerror = reject;
  });

/**
 * For posts update only, convert uploaded image in base 64 and attach it to
 * the `picture` sent property, with `src` and `title` attributes.
 */
const addUploadCapabilities = requestHandler => (type, resource, params) => {
  // @todo generalize this for multiple uploads

  if (type === "CREATE") {
    // @todo PDF uploads not encoding properly
    if (params.data.hasOwnProperty("files_to_upload")) {
      // only freshly dropped pictures are instance of File
      const formerFiles = params.data.files_to_upload.filter(
        p => !(p.rawFile instanceof File)
      );
      const newFiles = params.data.files_to_upload.filter(
        p => p.rawFile instanceof File
      );

      return Promise.all(newFiles.map(convertFileToBase64))
        .then(base64Files =>
          base64Files.map(file64 => ({
            src: file64.data,
            title: `${file64.title}`
          }))
        )
        .then(transformedNewFiles =>
          requestHandler(type, resource, {
            ...params,
            data: {
              ...params.data,
              file_data: [...transformedNewFiles, ...formerFiles]
            }
          })
        );
    } else {
      requestHandler(type, resource, params);
    }
  }

  return requestHandler(type, resource, params);
};

export default addUploadCapabilities;
