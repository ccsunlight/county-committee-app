// in src/posts.js
import React from "react";
import {
  List,
  Edit,
  Filter,
  Create,
  Datagrid,
  TextField,
  EditButton,
  DisabledInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  FunctionField
} from "admin-on-rest";

import moment from "moment";

export const MemberList = props => (
  <List {...props} title={"CC Members"} filters={<MemberFilter />}>
    <Datagrid>
      <TextField source="office_holder" />
      <TextField source="entry_type" />
      <TextField source="electoral_district" />
      <TextField source="assembly_district" />
      <TextField source="county" />
      <EditButton />
    </Datagrid>
  </List>
);

const MemberTitle = ({ record }) => {
  return <span>Post {record ? `"${record.office_holder}"` : ""}</span>;
};

const MemberFilter = props => (
  <Filter {...props}>
    <TextInput label="ED" source="electoral_district" />
    <TextInput label="AD" source="assembly_district" />
    <ReferenceInput label="County Committee" source="term_id" reference="term">
      <SelectInput
        optionText={
          <FunctionField
            label="Terms"
            render={record =>
              `${record.committee.county} + ${record.committee.party} ${moment(
                record.start_date
              ).format("ll")} to ${moment(record.end_date).format("ll")}`
            }
          />
        }
      />
    </ReferenceInput>
  </Filter>
);

export const MemberEdit = props => (
  <Edit title={<MemberTitle />} {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <TextInput source="office_holder" />
      <TextInput source="entry_type" />
      <TextInput source="electoral_district" />
      <TextInput source="assembly_district" />
    </SimpleForm>
  </Edit>
);

export const MemberCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="office_holder" />
      <TextInput source="entry_type" />
      <TextInput source="electoral_district" />
      <TextInput source="assembly_district" />
    </SimpleForm>
  </Create>
);
