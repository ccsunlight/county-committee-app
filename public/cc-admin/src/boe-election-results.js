// in src/posts.js
import React from "react";
import {
  List,
  Edit,
  Create,
  Datagrid,
  TextField,
  TextInput,
  EditButton,
  DisabledInput,
  SimpleForm,
  required
} from "admin-on-rest";
import RaisedButton from "material-ui/RaisedButton";

const TABLE_SELECTOR =
  "body > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table";

const TABLE_HEADER_SELECTOR =
  "body > table > tbody > tr > td > table > tbody > tr > td > table  > tbody > tr > th";

export const BOEElectionResultsList = props => (
  <List {...props} title="Certified Lists">
    <Datagrid>
      <TextField source="id" />
      <TextField source="url" />
      <EditButton />
    </Datagrid>
  </List>
);

export const ResultsList = ({ record, props }) => {
  let data = {};
  const ids = record.results
    ? record.results.slice(0, 500).map((office, index) => {
        data[index] = office;
        console.log(data[index]);
        return index;
      })
    : [];

  if (ids.length) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField source="office" />
        <TextField source="Name" />
        <TextField source="assembly_district" />
        <TextField source="electoral_district" />
        <TextField source="Party" />
        <TextField source="Votes" />
        <TextField source="voteFor" />
      </Datagrid>
    );
  } else {
    return <div>Nothing yet</div>;
  }
};

export const ExportCSVButton = ({ record, props }) => {
  const host = process.env.REACT_APP_API_HOSTNAME
    ? process.env.REACT_APP_API_HOSTNAME + process.env.REACT_APP_API_BASEPATH
    : window.location.origin + process.env.REACT_APP_API_BASEPATH;

  const downloadLink = `${host}/boe-election-results/${record._id}?format=csv`;

  return (
    <RaisedButton
      label="Export CSV"
      color="primary"
      href={downloadLink}
      target="_blank"
    />
  );
};

export const BOEElectionResultsEdit = props => {
  return (
    <Edit title={"BOE Election Results"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <TextField source="url" />
        <ExportCSVButton {...props} />
        <ResultsList props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const BOEElectionResultsCreate = props => {
  return (
    <Create title={"Create Certified List"} {...props}>
      <SimpleForm>
        <TextInput source="url" validate={required} />
        <TextInput
          source="tableSelector"
          defaultValue={TABLE_SELECTOR}
          validate={required}
        />
        <TextInput
          source="tableHeaderSelector"
          validate={required}
          defaultValue={TABLE_HEADER_SELECTOR}
        />
      </SimpleForm>
    </Create>
  );
};
