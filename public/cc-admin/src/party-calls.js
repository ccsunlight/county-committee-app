// in src/posts.js
import React from "react";
import {
  List,
  Edit,
  Create,
  Datagrid,
  ReferenceField,
  TextField,
  EditButton,
  DisabledInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  FunctionField,
  FileInput,
  FileField
} from "admin-on-rest";
import RaisedButton from "material-ui/RaisedButton";
import moment from "moment";

export const PartyCallList = props => (
  <List {...props} title="Party Calls">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <ReferenceField
        label="County Committee"
        source="term_id"
        reference="term"
        allowEmpty={true}
        perPage={200}
      >
        <FunctionField
          label="Name"
          render={record =>
            `${record.committee.county} ${record.committee.party}`
          }
        />
      </ReferenceField>
      <EditButton />
    </Datagrid>
  </List>
);

export const PartyPositionsList = ({ record, props }) => {
  let data = {};

  const ids = record.positions
    ? record.positions.slice(0, 50).map(position => {
        data[position._id] = position;
        return position._id;
      })
    : [];
  if (ids.length > 0) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField source="_id" />
        <TextField source="office" />
        <TextField source="assembly_district" />
        <TextField source="electoral_district" />
      </Datagrid>
    );
  } else {
    return (
      <div>
        Loading preview of positions. If it takes a while try hitting refresh.
      </div>
    );
  }
};

export const ExportCSVButton = ({ record, props }) => {
  const host = process.env.REACT_APP_API_HOSTNAME
    ? process.env.REACT_APP_API_HOSTNAME + process.env.REACT_APP_API_BASEPATH
    : window.location.origin + process.env.REACT_APP_API_BASEPATH;

  const downloadLink = `${host}/party-call/${record._id}?format=csv`;

  return (
    <RaisedButton
      label="Export CSV"
      color="primary"
      href={downloadLink}
      target="_blank"
    />
  );
};

export const PartyCallEdit = props => {
  return (
    <Edit title={"Import list members"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <ExportCSVButton {...props} />
        <ReferenceInput
          label="Committee Term"
          source="term_id"
          reference="term"
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Dates"
                render={record =>
                  `${record.committee.county} ${
                    record.committee.party
                  } ${moment(record.start_date).format("ll")} to ${moment(
                    record.end_date
                  ).format("ll")}`
                }
              />
            }
          />
        </ReferenceInput>
        <PartyPositionsList props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const PartyCallCreate = props => {
  return (
    <Create title={"Create Party Call"} {...props}>
      <SimpleForm>
        <ReferenceInput
          label="Committee Term"
          source="term_id"
          reference="term"
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Dates"
                render={record =>
                  `${record.committee.county} + ${
                    record.committee.party
                  } ${moment(record.start_date).format("ll")} to ${moment(
                    record.end_date
                  ).format("ll")}`
                }
              />
            }
          />
        </ReferenceInput>
        <FileInput source="files_to_upload" label="Party Call" accept=".csv">
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
