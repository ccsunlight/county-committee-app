// in src/posts.js
import React from 'react';
import { List, Edit, Filter, RichTextField, Create, SimpleList, Responsive,  Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'admin-on-rest';
import RichTextInput from 'aor-rich-text-input';


export const PageList = (props) => (
    <List {...props} title="Pages">
            <Datagrid>
                <TextField source="title" />
                <TextField source="alias" />
                <TextField source="updatedAt" />
                <TextField source="createdAt" />
                <RichTextField source="content" />

                <EditButton />        
            </Datagrid>
    </List>
);

const PageTitle = ({ record }) => {
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};



export const PageEdit = (props) => (
    <Edit title={<PageTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="title" />
            <TextInput source="alias" type="text" />
            <RichTextInput source="content" />
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