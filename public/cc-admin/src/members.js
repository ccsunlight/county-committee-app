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
      <TextInput source="office" />
      <TextInput source="office_holder" />
      <TextInput source="data_source" />
      <TextInput source="entry_type" />
      <TextInput source="electoral_district" />
      <TextInput source="assembly_district" />
      <SelectInput
        source="part"
        choices={[
          { id: "", name: "" },
          { id: "A", name: "A" },
          { id: "B", name: "B" },
          { id: "C", name: "C" },
          { id: "D", name: "D" }
        ]}
      />
      <SelectInput
        source="sex"
        choices={[
          { id: "", name: "" },
          { id: "Male", name: "Male" },
          { id: "Female", name: "Female" }
        ]}
      />
      <TextInput source="state" />
      <TextInput source="county" />
      <TextInput source="address" />
      <ReferenceInput
        label="Committee"
        source="committee"
        reference="county-committee"
        perPage={200}
      >
        <SelectInput
          optionText={
            <FunctionField
              label="Committees"
              render={committee => `${committee.county} + ${committee.party}`}
            />
          }
        />
      </ReferenceInput>
      <ReferenceInput
        label="Term"
        source="term_id"
        reference="term"
        perPage={200}
      >
        <SelectInput
          optionText={
            <FunctionField
              label="Terms"
              render={term =>
                `${term.committee.county} + ${term.committee.party} ${moment(
                  term.start_date
                ).format("ll")} to ${moment(term.end_date).format("ll")}`
              }
            />
          }
        />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const MemberCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <TextInput source="office" />
      <TextInput source="office_holder" />
      <TextInput source="data_source" />
      <TextInput source="entry_type" />
      <TextInput source="electoral_district" />
      <TextInput source="assembly_district" />
      <SelectInput
        source="part"
        choices={[
          { id: "", name: "" },
          { id: "A", name: "A" },
          { id: "B", name: "B" },
          { id: "C", name: "C" },
          { id: "D", name: "D" }
        ]}
      />
      <SelectInput
        source="sex"
        choices={[
          { id: "", name: "" },
          { id: "Male", name: "Male" },
          { id: "Female", name: "Female" }
        ]}
      />
      <TextInput source="state" />
      <TextInput source="county" />
      <TextInput source="address" />
      <ReferenceInput
        label="Committee"
        source="committee"
        reference="county-committee"
        perPage={200}
      >
        <SelectInput
          optionText={
            <FunctionField
              label="Committees"
              render={committee => `${committee.county} + ${committee.party}`}
            />
          }
        />
      </ReferenceInput>
      <ReferenceInput
        label="Term"
        source="term_id"
        reference="term"
        perPage={200}
      >
        <SelectInput
          optionText={
            <FunctionField
              label="Terms"
              render={term =>
                `${term.committee.county} + ${term.committee.party} ${moment(
                  term.start_date
                ).format("ll")} to ${moment(term.end_date).format("ll")}`
              }
            />
          }
        />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);
