// in src/posts.js
import React from "react";
import { Link } from "react-router-dom";
import {
  List,
  Edit,
  Filter,
  Create,
  Datagrid,
  ReferenceField,
  TextField,
  EditButton,
  DisabledInput,
  LongTextInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanField,
  SingleFieldList,
  ReferenceManyField,
  ReferenceArrayField,
  FunctionField,
  FileInput,
  FileField,
  SelectField,
  DateInput,
  DateField
} from "admin-on-rest";
import { WithPermission, SwitchPermissions, Permission } from "aor-permissions";
import authClient from "./feathersAuthClient";
import { checkUserCanEdit } from "./feathersAuthClient";

export const TermList = props => (
  <List {...props} title="County Committee Terms">
    <Datagrid>
      <TextField source="id" />
      <ReferenceField
        label="Committee"
        source="committee_id"
        reference="county-committee"
      >
        <FunctionField
          label="Name"
          render={record => `${record.county} ${record.party}`}
        />
      </ReferenceField>
      <DateField source="start_date" />
      <DateField source="end_date" />
      <EditButton />
    </Datagrid>
  </List>
);

export const TermEdit = props => {
  return (
    <Edit title={"Edit Term"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <ReferenceInput
          label="County Committee"
          source="committee_id"
          reference="county-committee"
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Name"
                render={record => `${record.county} ${record.party}`}
              />
            }
          />
        </ReferenceInput>

        <DateInput source="start_date" />
        <DateInput source="end_date" />
      </SimpleForm>
    </Edit>
  );
};

export const TermCreate = props => {
  return (
    <Create title={"Create Term"} {...props}>
      <SimpleForm>
        <ReferenceInput
          label="County Committee"
          source="committee_id"
          reference="county-committee"
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Name"
                render={record => `${record.county} ${record.party}`}
              />
            }
          />
        </ReferenceInput>
        <DateInput source="start_date" />
        <DateInput source="end_date" />
      </SimpleForm>
    </Create>
  );
};
