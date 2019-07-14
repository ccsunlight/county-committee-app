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
  NumberInput,
  required
} from "admin-on-rest";
import moment from "moment";
import { ExportCSVButton } from "./ExportCSVButton";

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
        <TextField source="assembly_district" />
        <TextField source="electoral_district" />
        <TextField source="office" />
        <TextField source="office_holder" />
        <TextField source="entry_type" />
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

export const ImportResultsList = ({ record, importResultsSource, props }) => {
  let data = {};

  if (!record.importResults) {
    return null;
  }
  const ids = record.importResults[importResultsSource]
    ? record.importResults[importResultsSource]
        .slice(0, 50)
        .map((result, index) => {
          data[index] = result;
          return index;
        })
    : [];
  if (ids.length > 0) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField source="member._id" />
        <TextField source="member.assembly_district" />
        <TextField source="member.electoral_district" />
        <TextField source="member.office" />
        <TextField source="member.office_holder" />
        <TextField source="member.entry_type" />
        <TextField source="member.party" />
      </Datagrid>
    );
  } else {
    return <div>No results found</div>;
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
            validate={required}
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
          <ExportCSVButton props={props} />
          <TextField label="Total Records" source="importResults.n" />
          <TextField
            label="Records Modified"
            source="importResults.nModified"
          />
          <TextField
            label="Records Inserted"
            source="importResults.nInserted"
          />
          <TextField
            label="Records Not Matched"
            source="importResults.nNotMatched"
          />
        </FormTab>
        <FormTab label="Conditionals">
          <TextInput label="Entry Type" source="conditionals.entry_type" />
          <TextInput
            label="Office Holder"
            source="conditionals.office_holder"
          />
          <TextInput label="Party" source="conditionals.party" />
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
        <FormTab label="CSV Pending">
          <p>* Shows first 50 rows</p>
          <ListMembersList {...props} />
        </FormTab>
        <FormTab label="Inserted">
          <p>* Shows first 50 rows</p>
          <ImportResultsList {...props} importResultsSource="insertedResults" />
        </FormTab>
        <FormTab label="Modified">
          <p>* Shows first 50 rows</p>
          <ImportResultsList {...props} importResultsSource="modifiedResults" />
        </FormTab>
        <FormTab label="Not Matched">
          <p>* Shows first 50 rows</p>
          <ImportResultsList
            {...props}
            importResultsSource="notMatchedResults"
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
            validate={required}
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
                      record.end_date
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
      </TabbedForm>
    </Create>
  );
};
