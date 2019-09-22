// in src/posts.js
import React from "react";
import { Link } from "react-router-dom";
import {
  List,
  Edit,
  Filter,
  Create,
  SimpleList,
  Responsive,
  Datagrid,
  ReferenceField,
  TextField,
  EditButton,
  DisabledInput,
  LongTextInput,
  ReferenceInput,
  ReferenceManyField,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanField,
  FileInput,
  FileField
} from "admin-on-rest";
import { WithPermission, SwitchPermissions, Permission } from "aor-permissions";
import authClient from "./feathersAuthClient";
import { checkUserCanEdit } from "./feathersAuthClient";

export const CertifiedListList = props => (
  <List {...props} title="Imported Certified Lists">
    <Datagrid>
      <TextField source="_id" />
      <TextField source="source" />
      <EditButton />
    </Datagrid>
  </List>
);

export const PartyPositionList = ({ record, props }) => {
  let data = {};

  const ids = record.positions.slice(0, 100).map(position => {
    data[position._id] = position;
    return position._id;
  });

  return (
    <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
      <TextField source="_id" />
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

export const CertifiedListEdit = props => {
  return (
    <Edit title={"Import list Positions"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <h4>Sample of imported members</h4>
        <TextField source="positions.length" label="Total Positions imported" />
        <PartyPositionList title="Only first 100 rows shown" props={props} />
      </SimpleForm>
    </Edit>
  );
};
