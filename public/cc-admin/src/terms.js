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
  ReferenceManyField,
  FunctionField,
  DateInput,
  DateField
} from "admin-on-rest";
import ApproveButton from "./ApproveButton";

export const TermList = props => (
  <List {...props} title="Terms">
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
          perPage={200}
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

        <ReferenceManyField
          label="Certified List"
          target="term_id"
          reference="certified-list"
        >
          <Datagrid>
            <TextField source="_id" />
            <TextField source="source" />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>

        <ApproveButton />

        <ReferenceManyField
          label="Party Call"
          target="term_id"
          reference="party-call"
        >
          <Datagrid>
            <TextField source="_id" />
            <TextField source="source" />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>

        <ReferenceManyField
          label="CC Members"
          target="term_id"
          reference="county-committee-member"
          perPage={200}
        >
          <Datagrid>
            <TextField source="_id" />
            <TextField source="electoral_district" />
            <TextField source="assembly_district" />
            <TextField source="office_holder" />
            <EditButton />
          </Datagrid>
        </ReferenceManyField>

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
          perPage={200}
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
