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
  SimpleForm,
  FileInput,
  FileField
} from "admin-on-rest";
import { ExportCSVButton } from "./ExportCSVButton";

export const CandidacyListList = props => (
  <List {...props} title="Candidacy Lists">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <EditButton />
    </Datagrid>
  </List>
);

export const Candidates = ({ record, props }) => {
  let data = {};
  let rowIndex = 0;
  const ids = record.positions
    ? record.positions.slice(0, 10).map((position, index) => {
        position.rows.forEach(row => {
          data[rowIndex++] = { position: position.name, row: row };
        });
        return rowIndex;
      })
    : [];

  if (ids.length) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField label="Position" source="position" />
        {record.positions[0].columnNames.map((column, index) => {
          const sourceProp = { source: `row[${index}]` };
          return (
            <TextField key={String(index)} label={column} {...sourceProp} />
          );
        })}
      </Datagrid>
    );
  } else {
    return <div>Nothing yet</div>;
  }
};

export const CandidacyListEdit = props => {
  return (
    <Edit title={"Candidacy List"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <ExportCSVButton props={props} />
        <Candidates props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const CandidacyListCreate = props => {
  return (
    <Create title={"Create Candidacy List"} {...props}>
      <SimpleForm>
        <FileInput
          source="files_to_upload"
          label="Candidacy List"
          accept=".pdf"
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
