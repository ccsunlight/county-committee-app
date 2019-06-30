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
  TextInput
} from "admin-on-rest";

export const GlossaryTermList = props => (
  <List {...props} title="Glossary">
    <Datagrid>
      <TextField source="title" />
      <TextField source="content" />
      <EditButton />
    </Datagrid>
  </List>
);

const GlossaryTermTitle = ({ record }) => {
  return <span>Post {record ? `"${record.title}"` : ""}</span>;
};

export const GlossaryTermEdit = props => (
  <Edit title={<GlossaryTermTitle />} {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <TextInput source="title" />
      <TextInput source="content" />
    </SimpleForm>
  </Edit>
);

export const GlossaryTermCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="content" />
    </SimpleForm>
  </Create>
);
