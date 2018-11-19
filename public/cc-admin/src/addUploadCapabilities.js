/**
 * Convert a `File` object returned by the upload input into
 * a base 64 string. That's easier to use on FakeRest, used on
 * the ng-admin example. But that's probably not the most optimized
 * way to do in a production database.
 */
const convertFileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.rawFile);

    reader.onload = () => {
      resolve({ title: file.title, data: reader.result });
    };
    reader.onerror = reject;
  });

/**
 * For posts update only, convert uploaded image in base 64 and attach it to
 * the `picture` sent property, with `src` and `title` attributes.
 */
const addUploadCapabilities = requestHandler => (type, resource, params) => {
  // @todo generalize this for multiple uploads
  if (type === "CREATE" && resource === "county-committee") {
    if (params.data.party_call_files && params.data.party_call_files.length) {
      // only freshly dropped pictures are instance of File
      const formerFiles = params.data.party_call_files.filter(
        p => !(p.rawFile instanceof File)
      );
      const newFiles = params.data.party_call_files.filter(
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
              party_call_uploads: [...transformedNewFiles, ...formerFiles]
            }
          })
        );
    }
  }

  return requestHandler(type, resource, params);
};

export default addUploadCapabilities;
