/**
 * @deprecated
 */

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
  SelectInput,
  SimpleForm,
  TextInput,
  ReferenceManyField,
  SingleFieldList,
  ChipField,
  DateInput
} from "admin-on-rest";
import UnArchiveButton from "./UnArchiveButton";

export const CountyCommitteeArchiveList = props => (
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

export const CountyCommitteeArchiveEdit = props => (
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
      <DateInput source="term_begins" />
      <DateInput source="term_ends" />
      <TextInput source="chairman" />
      <TextInput source="address" />
      <TextInput source="phone" />
      <TextInput source="url" type="url" />
      <TextInput source="party_rules" type="url" />
      <TextInput source="email" type="email" />
      <UnArchiveButton />
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
