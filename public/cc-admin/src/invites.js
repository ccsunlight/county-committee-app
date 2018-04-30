// in src/users.js
import React from 'react';
import {
  Restricted,
  ToolbarGroup,
  SaveButton,
  List,
  Edit,
  Filter,
  RichTextField,
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
  DeleteButton
} from 'admin-on-rest';
import { SwitchPermissions, Permission } from 'aor-permissions';
import authClient from './feathersAuthClient';
import { checkUserCanEdit } from './feathersAuthClient';

export const InviteList = props => (
  <SwitchPermissions authClient={authClient} {...props}>
    <Permission resolve={checkUserCanEdit}>
      <List title="Invites" {...props}>
        <Datagrid>
          <TextField source="id" />
          <TextField source="email" />
          <DeleteButton />
        </Datagrid>
      </List>
    </Permission>
  </SwitchPermissions>
);

export const InviteCreate = props => (
  <Create {...props}>
    <SimpleForm redirect="list">
      <TextInput label="Email Address" source="email" type="email" />
      <SelectInput
        source="role"
        defaultValue="user"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'user', name: 'User' },
          { id: 'visitor', name: 'Visitor' }
        ]}
      />
    </SimpleForm>
  </Create>
);

export const InviteEdit = props => (
  <Edit {...props}>
    <SimpleForm redirect="list">
      <TextInput label="Email Address" source="email" type="email" />
      <SelectInput
        source="role"
        defaultValue="user"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'user', name: 'User' },
          { id: 'visitor', name: 'Visitor' }
        ]}
      />
    </SimpleForm>
  </Edit>
);
