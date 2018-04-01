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

export const CountyCommitteeList = props => (
  <List {...props} title="County Committees">
    <Datagrid>
      <TextField source="county" />
      <TextField source="party" />
      <EditButton />
    </Datagrid>
  </List>
);

const CountyCommitteeTitle = ({ record }) => {
  return (
    <span>
      {record
        ? `Edit "${record.county}" County Committee`
        : 'Create County Committee'}
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
          { id: 'Democratic', name: 'Democratic' },
          { id: 'Republican', name: 'Republican' }
        ]}
      />
      <TextInput source="chairman" />
      <TextInput source="address" />
      <TextInput source="phone" />
      <TextInput source="url" type="url" />
      <TextInput source="party_rules" type="url" />
      <TextInput source="email" type="email" />
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
          { id: 'Democratic', name: 'Democratic' },
          { id: 'Republican', name: 'Republican' }
        ]}
      />
      <TextInput source="party" />
      <TextInput source="chairman" />
      <TextInput source="address" />
      <TextInput source="phone" />
      <TextInput source="url" type="url" />
      <TextInput source="party_rules" type="url" />
      <TextInput source="email" type="email" />
    </SimpleForm>
  </Create>
);
