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
  TextInput,
  FunctionField,
  FileInput,
  FileField,
  TabbedForm,
  FormTab,
  BooleanInput,
  SelectArrayInput,
  NumberInput
} from "admin-on-rest";
import moment from "moment";

const states = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
];

export const ImportListList = props => (
  <List {...props} title="List Imports">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <TextField source="status" />
      <ReferenceField
        label="County Committee"
        source="term_id"
        reference="term"
        allowEmpty={true}
        perPage={200}
      >
        <FunctionField
          label="Name"
          render={record =>
            `${record.committee.county} ${record.committee.party}`
          }
        />
      </ReferenceField>
      <EditButton />
    </Datagrid>
  </List>
);

export const ListMembersList = ({ record, props }) => {
  let data = {};

  const ids = record.members
    ? record.members.slice(0, 50).map(member => {
        data[member._id] = member;
        return member._id;
      })
    : [];
  if (ids.length > 0) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField source="_id" />
        <TextField source="office" />
        <TextField source="assembly_district" />
        <TextField source="electoral_district" />
      </Datagrid>
    );
  } else {
    return (
      <div>
        Loading preview of positions. If it takes a while try hitting refresh.
      </div>
    );
  }
};

export const ImportListEdit = props => {
  return (
    <Edit title={"Import list members"} {...props}>
      <TabbedForm>
        <FormTab label="main">
          <DisabledInput label="Id" source="id" />
          <TextField label="Status" source="status" />

          <BooleanInput label="Approved" source="approved" />
          <BooleanInput
            label="Create members if not existing"
            source="upsert"
          />
          <ReferenceInput
            label="Committee Term"
            source="term_id"
            reference="term"
          >
            <SelectInput
              optionText={
                <FunctionField
                  label="Dates"
                  render={record =>
                    `${record.committee.county} ${
                      record.committee.party
                    } ${moment(record.start_date).format("ll")} to ${moment(
                      record.end_date
                    ).format("ll")}`
                  }
                />
              }
            />
          </ReferenceInput>

          <TextField label="Total Records" source="importResults.n" />
          <TextField
            label="Records Imported"
            source="importResults.nModified"
          />
          <TextField
            label="Records Not Imported"
            source="importResults.unImportedRecords.length"
          />
          <ListMembersList props={props} />
        </FormTab>
        <FormTab label="Conditionals">
          <TextInput label="Entry Type" source="conditionals.entry_type" />
          <TextInput
            label="Office Holder"
            source="conditionals.office_holder"
          />
          <NumberInput
            label="Election District"
            source="conditionals.election_district"
          />
          <NumberInput
            label="Assembly District"
            source="conditionals.assembly_district"
          />

          <SelectArrayInput
            label="County"
            source="conditionals.county"
            choices={[
              { id: "Queens", name: "Queens" },
              { id: "Bronx", name: "Bronx" },
              { id: "New York", name: "New York" },
              { id: "Kings", name: "Kings" },
              { id: "Richmond", name: "Richmond" }
            ]}
          />
          <SelectArrayInput
            label="State"
            source="conditionals.state"
            choices={states.map(state => {
              return { id: state, name: state };
            })}
          />
        </FormTab>
        <FormTab label="Bulk Fields">
          <TextInput label="Entry Type" source="bulkFields.entry_type" />
          <TextInput label="Office Holder" source="bulkFields.office_holder" />
          <SelectInput
            source="bulkFields.party"
            label="Party"
            choices={[
              { id: "Democratic", name: "Democratic" },
              { id: "Republican", name: "Republican" }
            ]}
          />
          <SelectInput
            label="County"
            source="bulkFields.county"
            choices={[
              { id: "Queens", name: "Queens" },
              { id: "Bronx", name: "Bronx" },
              { id: "New York", name: "New York" },
              { id: "Kings", name: "Kings" },
              { id: "Richmond", name: "Richmond" }
            ]}
          />
          <SelectInput
            source="bulkFields.state"
            label="State"
            choices={states.map(state => {
              return { id: state, name: state };
            })}
          />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const ImportListCreate = props => {
  return (
    <Create title={"Create Import"} {...props}>
      <TabbedForm>
        <FormTab label="main">
          <ReferenceInput
            label="Committee Term"
            source="term_id"
            reference="term"
          >
            <SelectInput
              optionText={
                <FunctionField
                  label="Dates"
                  render={record =>
                    `${record.committee.county} + ${
                      record.committee.party
                    } ${moment(record.start_date).format("ll")} to ${moment(
                      record.start_date
                    ).format("ll")}`
                  }
                />
              }
            />
          </ReferenceInput>
          <BooleanInput
            label="Create members if not existing"
            source="upsert"
          />
          <FileInput source="files_to_upload" label="Party Call" accept=".csv">
            <FileField source="src" title="title" />
          </FileInput>
        </FormTab>
        <FormTab label="Conditionals">
          <TextInput label="Entry Type" source="conditionals.entry_type" />
          <TextInput
            label="Office Holder"
            source="conditionals.office_holder"
          />
          <NumberInput
            label="Election District"
            source="conditionals.election_district"
          />
          <NumberInput
            label="Assembly District"
            source="conditionals.assembly_district"
          />
          <SelectArrayInput
            label="County"
            source="conditionals.county"
            choices={[
              { id: "Queens", name: "Queens" },
              { id: "Bronx", name: "Bronx" },
              { id: "New York", name: "New York" },
              { id: "Kings", name: "Kings" },
              { id: "Richmond", name: "Richmond" }
            ]}
          />
          <SelectArrayInput
            label="State"
            source="conditionals.state"
            choices={states.map(state => {
              return { id: state, name: state };
            })}
          />
        </FormTab>
        <FormTab label="Bulk Fields">
          <TextInput label="Entry Type" source="bulkFields.entry_type" />
          <TextInput label="Office Holder" source="bulkFields.office_holder" />
          <SelectInput
            source="bulkFields.party"
            label="Party"
            choices={[
              { id: "Democratic", name: "Democratic" },
              { id: "Republican", name: "Republican" }
            ]}
          />
          <SelectInput
            source="bulkFields.county"
            label="County"
            choices={[
              { id: "Queens", name: "Queens" },
              { id: "Bronx", name: "Bronx" },
              { id: "New York", name: "New York" },
              { id: "Kings", name: "Kings" },
              { id: "Richmond", name: "Richmond" }
            ]}
          />
          <SelectInput
            source="bulkFields.state"
            label="State"
            choices={states.map(state => {
              return { id: state, name: state };
            })}
          />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};
