// in src/posts.js
import React from 'react';
import { List, Edit, Filter, RichTextField, Create, SimpleList, Responsive,  Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'admin-on-rest';
import RichTextInput from 'aor-rich-text-input';
import { SwitchPermissions, Permission } from 'aor-permissions';
import authClient from './feathersAuthClient';
import {checkUserCanEdit} from './feathersAuthClient';

export const PageList = (props) => (
     
            <List {...props} title="Pages">
                    <Datagrid>
                        <TextField source="title" />
                        <TextField source="alias" />
                        <TextField source="updatedAt" />
                        <TextField source="createdAt" />

                        <EditButton />        
                    </Datagrid>
            </List>
);

const PageTitle = ({ record }) => {
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};


const toolbarProps = [
    [{
        header: [1, 2, 3, false]
    }],
    ['bold', 'italic', 'underline'],
    ['image', 'video', 'link', 'code']
];

const quillModules = {
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

export const PageEdit = (props) => (
    <Edit title={<PageTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="title" />
            <TextInput source="alias" type="text" />
            <RichTextInput source="content" module={quillModules} theme="bubble" toolbar={toolbarProps}/>
        </SimpleForm>
    </Edit>
);

export const PageCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="alias" type="text" />
            <RichTextInput source="content" />
        </SimpleForm>
    </Create>
);