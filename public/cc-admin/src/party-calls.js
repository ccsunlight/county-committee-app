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
  SelectField
} from "admin-on-rest";
import { WithPermission, SwitchPermissions, Permission } from "aor-permissions";
import authClient from "./feathersAuthClient";
import { checkUserCanEdit } from "./feathersAuthClient";

export const PartyCallList = props => (
  <List {...props} title="Party Calls">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <ReferenceField
        label="County Committee"
        source="committee_id"
        reference="county-committee"
        allowEmpty={true}
      >
        <FunctionField
          label="Name"
          render={record => `${record.county} ${record.party}`}
        />
      </ReferenceField>
      <EditButton />
    </Datagrid>
  </List>
);

export const PartyPositionsList = ({ record, props }) => {
  let data = {};

  const ids = record.positions.slice(0, 100).map(position => {
    data[position._id] = position;
    return position._id;
  });

  return (
    <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
      <TextField source="_id" />
      <TextField source="office" />
      <TextField source="assembly_district" />
      <TextField source="electoral_district" />
    </Datagrid>
  );
};

export const PartyCallEdit = props => {
  return (
    <Edit title={"Import list members"} {...props}>
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
        <PartyPositionsList title="Only first 100 rows shown" props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const PartyCallCreate = props => {
  return (
    <Create title={"Create Party Call"} {...props}>
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
        <FileInput source="party_call_files" label="Party Call" accept=".csv">
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
