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
  CreateButton,
  DisabledInput,
  LongTextInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  ReferenceManyField,
  SingleFieldList,
  ChipField,
  DateInput,
  FileInput,
  FileField,
  ImageInput,
  ImageField,
  DateField
} from "admin-on-rest";
import ArchiveButton from "./ArchiveButton";

export const CountyCommitteeList = props => (
  <List {...props} title="County Committees">
    <Datagrid>
      <TextField source="county" />
      <TextField source="party" />
      <EditButton />
    </Datagrid>
  </List>
);

const CountyCommitteeTitle = ({ record }) => {
  return (
    <span>
      {record
        ? `Edit "${record.county}" County Committee`
        : "Create County Committee"}
    </span>
  );
};

export const CountyCommitteeEdit = props => (
  <Edit title={<CountyCommitteeTitle />} {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <TextInput source="county" />
      <SelectInput
        source="party"
        choices={[
          { id: "Democratic", name: "Democratic" },
          { id: "Republican", name: "Republican" }
        ]}
      />
      <ReferenceManyField
        perPage={5}
        label="Terms"
        reference="term"
        target="committee_id"
      >
        <Datagrid>
          <TextField source="id" />
          <DateField source="start_date" />
          <DateField source="end_date" />
          <EditButton />
        </Datagrid>
      </ReferenceManyField>
      <TextInput source="chairman" />
      <TextInput source="address" />
      <TextInput source="phone" />
      <TextInput source="url" type="url" />
      <TextInput source="party_rules" type="url" />
      <TextInput source="email" type="email" />

      {/* <ArchiveButton /> */}
      <h4>Sample of members. </h4>

      <ReferenceManyField
        perPage={5}
        label="Members"
        reference="county-committee-member"
        target="committee"
      >
        <Datagrid>
          <TextField source="id" />
          <TextField source="office" />
          <TextField source="office_holder" />
          <TextField source="assembly_district" />
          <TextField source="electoral_district" />
          <EditButton />
        </Datagrid>
      </ReferenceManyField>
    </SimpleForm>
  </Edit>
);

export const CountyCommitteeCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="county" />
      <SelectInput
        source="party"
        choices={[
          { id: "Democratic", name: "Democratic" },
          { id: "Republican", name: "Republican" }
        ]}
      />
      <TextInput source="chairman" />
      <TextInput source="address" />
      <TextInput source="phone" />
      <TextInput source="url" type="url" />
      <TextInput source="party_rules" type="url" />
      <TextInput source="email" type="email" />
    </SimpleForm>
  </Create>
);
