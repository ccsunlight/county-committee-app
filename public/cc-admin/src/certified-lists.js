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
  FunctionField,
  FileInput,
  FileField
} from "admin-on-rest";
import moment from "moment";

export const CertifiedListList = props => (
  <List {...props} title="Certified Lists">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <EditButton />
    </Datagrid>
  </List>
);

export const PartyPositionsList = ({ record, props }) => {
  let data = {};
  let rowIndex = 0;
  const ids = record.positions
    ? record.positions.slice(0, 10).map((position, index) => {
        position.rows.map(row => {
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

export const CertifiedListEdit = props => {
  return (
    <Edit title={"Certified List"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <PartyPositionsList props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const CertifiedListCreate = props => {
  return (
    <Create title={"Create Certified List"} {...props}>
      <SimpleForm>
        <FileInput
          source="files_to_upload"
          label="Certified List"
          accept=".pdf"
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
