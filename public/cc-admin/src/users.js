// in src/users.js
import React from 'react';
import { Restricted, List, Edit, Filter, RichTextField, Create, SimpleList, Responsive,  Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput, DeleteButton } from 'admin-on-rest';

export const UserList = (props) => (
    <List title="All users" {...props}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="email" />
            <EditButton />
        </Datagrid>
    </List>
);


const UserTitle = ({ record }) => {
    return <span>Edit User</span>;
};



export const UserEdit = (props) => (
    <Edit title={<UserTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput label="Email Address" source="email" type="email" />
            <TextInput source="password" type="password"  />
        </SimpleForm>
    </Edit>
);

export const UserCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput label="Email Address" source="email" type="email" />
            <TextInput source="password" type="password"  />
        </SimpleForm>
    </Create>
);