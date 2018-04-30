// in src/posts.js
import React from 'react';
import { Link } from 'react-router-dom';
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
  TextInput
} from 'admin-on-rest';
import { WithPermission, SwitchPermissions, Permission } from 'aor-permissions';
import authClient from './feathersAuthClient';
import { checkUserCanEdit } from './feathersAuthClient';

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
  return <span>Post {record ? `"${record.title}"` : ''}</span>;
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
