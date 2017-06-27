// in src/users.js
import React from 'react';
import { Restricted, List, Edit, Filter, RichTextField, Create, SimpleList, Responsive,  Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput, DeleteButton } from 'admin-on-rest';
import { SwitchPermissions, Permission } from 'aor-permissions';
import authClient from './feathersAuthClient';
import {checkUserCanEdit} from './feathersAuthClient';

export const UserList = (props) => (  
    <SwitchPermissions authClient={authClient} {...props}>
        <Permission resolve={checkUserCanEdit}>
        <List title="All users" {...props}>
            <Datagrid>
                <TextField source="id" />
                <TextField source="email" />
                <EditButton />
            </Datagrid>   
        </List>
        </Permission>
    </SwitchPermissions>
);



const UserTitle = ({ record }) => {
    return <span>Edit User</span>;
};



export const UserEdit = (props) => (
    <Edit title={<UserTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput label="Email Address" source="email" type="email" />
            <TextInput label="Firstname" source="firstname" type="text" />
            <TextInput label="Lastname" source="lastname" type="text" />
            <TextInput label="Change Password" source="changepassword" type="password" />
            <TextInput label="Confirm Password" source="confirmpassword" type="password" />
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