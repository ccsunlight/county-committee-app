// in src/posts.js
import React from "react";
import {
  List,
  Edit,
  Create,
  Datagrid,
  ReferenceField,
  TextField,
  DateInput,
  DateField,
  EditButton,
  DisabledInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  FunctionField,
  FileInput,
  FileField
} from "admin-on-rest";
import { ExportCSVButton } from "./ExportCSVButton";
import moment from "moment";
/**
 * @deprecated
 * @param {@} props
 */
export const EnrollmentList = props => (
  <List {...props} title="Party Enrollment">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <TextField source="assembly_district" />
      <TextField source="electoral_district" />
      <TextField source="dem" />
      <TextField source="rep" />
      <TextField source="date" />
      <EditButton />
    </Datagrid>
  </List>
);

export const EnrollmentEdit = props => {
  return (
    <Edit title={"Import list members"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <TextField source="source" />
        <TextField source="assembly_district" />
        <TextField source="electoral_district" />
        <hr />
        <TextField source="active.democrat" />
        <TextField source="inactive.democrat" />
        <TextField source="total.democrat" />
        <hr />
        <TextField source="active.republican" />
        <TextField source="inactive.republican" />
        <TextField source="total.republican" />
      </SimpleForm>
    </Edit>
  );
};

export const EnrollmentCreate = props => {
  return (
    <Create title={"Create Enrollment"} redirect="list" {...props}>
      <SimpleForm>
        <FileInput source="files_to_upload" label="Party Call" accept=".csv">
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
