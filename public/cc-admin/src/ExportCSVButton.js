import React from "react";
import RaisedButton from "material-ui/RaisedButton";

/**
 * Connects to CC Sunlight API passing a format=csv param
 * retrieves the result and opens a download dialog.
 *
 * Designed to hook into AOR standard state objects
 * to derive necessary information
 *
 * @usage:
 * `<ExportCSVButton props={props} />`
 */
export const ExportCSVButton = ({ record, props }) => {
  const host = process.env.REACT_APP_API_HOSTNAME
    ? process.env.REACT_APP_API_HOSTNAME + process.env.REACT_APP_API_BASEPATH
    : window.location.origin + process.env.REACT_APP_API_BASEPATH;
  const downloadLink = `${host}/${props.resource}/${record._id}?format=csv`;
  const jwtToken = localStorage.getItem("feathers-jwt");
  return (
    <RaisedButton
      label="Export CSV"
      color="primary"
      onClick={() => {
        fetch(downloadLink, {
          method: "GET",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "text/plain",
            Authorization: jwtToken
          },
          redirect: "follow",
          referrer: "no-referrer" // no-referrer, *client
        })
          .then(response => response.blob())
          .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            const currentUTCString = new Date().toUTCString();
            a.download = `${props.resource}-${record._id}-${currentUTCString}.csv`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); //afterwards we remove the element again
          });
      }}
      target="_blank"
    />
  );
};
