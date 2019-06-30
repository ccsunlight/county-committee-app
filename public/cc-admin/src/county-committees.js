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
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  ReferenceManyField,
  DateField,
  FunctionField
} from "admin-on-rest";
export const CountyCommitteeList = props => (
  <List {...props} title="County Committees">
    <Datagrid>
      <TextField source="county" />
      <TextField source="party" />
      <EditButton />
    </Datagrid>
  </List>
);

function formatDate(date) {
  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + " " + monthNames[monthIndex] + " " + year;
}

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
      <ReferenceInput
        label="Current Term"
        source="current_term_id"
        reference="term"
        filter={{ committee_id: props.match.params.id }}
      >
        <SelectInput
          optionText={
            <FunctionField
              label="Name"
              render={record =>
                `${formatDate(new Date(record.start_date))} — ${formatDate(
                  new Date(record.end_date)
                )} (${record.id})`
              }
            />
          }
        />
      </ReferenceInput>
      <ReferenceInput
        label="Upcoming Term"
        source="upcoming_term_id"
        reference="term"
        filter={{ committee_id: props.match.params.id }}
      >
        <SelectInput
          optionText={
            <FunctionField
              label="Name"
              render={record =>
                `${formatDate(new Date(record.start_date))} — ${formatDate(
                  new Date(record.end_date)
                )} (${record.id})`
              }
            />
          }
        />
      </ReferenceInput>
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
