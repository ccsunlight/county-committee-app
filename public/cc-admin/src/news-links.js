// in src/posts.js
import React from 'react';
import { Link } from 'react-router-dom';
import { List, Edit,Filter, Create, SimpleList, Responsive,  Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'admin-on-rest';
import { WithPermission, SwitchPermissions,  Permission} from 'aor-permissions';
import authClient from './feathersAuthClient';
import {checkUserCanEdit} from './feathersAuthClient';

export const NewsLinkList = (props) => (
     
                <List {...props} title="News">
                        <Datagrid>
                            <TextField source="title" />
                            <TextField source="description" />
                            <TextField source="url" />
                            <EditButton />        
                        </Datagrid>
                </List>
);


const NewsLinkTitle = ({ record }) => {
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

export const NewsLinkEdit = (props) => (
    <Edit title={<NewsLinkTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="title" />
            <TextInput source="url" type="url" />
            <TextInput source="description" />
        </SimpleForm>
    </Edit>
);

export const NewsLinkCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="url" type="url" />
            <TextInput source="description" />
        </SimpleForm>
    </Create>
);