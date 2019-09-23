// in src/posts.js
import React from "react";
import {
  List,
  Edit,
  Create,
  Datagrid,
  TextField,
  EditButton,
  DisabledInput,
  SimpleForm,
  FileInput,
  FileField
} from "admin-on-rest";
import { ExportCSVButton } from "./ExportCSVButton";

export const CertifiedListList = props => (
  <List {...props} title="Imported Certified Lists">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <EditButton />
    </Datagrid>
  </List>
);

export const PartyPositionList = ({ record, props }) => {
  let data = {};

  const ids = record.positions
    ? record.positions.slice(0, 50).map(position => {
        data[position.id] = position;
        return position.id;
      })
    : [];

  return (
    <Datagrid ids={ids} data={data} currentSort={{ id: "ASC" }}>
      <TextField source="id" />
      <TextField source="office" />
      <TextField source="office_holder" />
      <TextField source="assembly_district" />
      <TextField source="electoral_district" />
      <TextField source="tally" />
    </Datagrid>
  );
};

export const CertifiedListCreate = props => {
  return (
    <Create title={"Create Certified List"} {...props}>
      <SimpleForm>
        <FileInput
          source="files_to_upload"
          label="Certified List"
          accept=".pdf"
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};

export const CertifiedListEdit = props => (
  <Edit title={"Import list Positions"} {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <ExportCSVButton props={props} />
      <TextField source="positions.length" label="Total Positions imported" />
      <PartyPositionList title="Only first 100 rows shown" props={props} />
    </SimpleForm>
  </Edit>
);
