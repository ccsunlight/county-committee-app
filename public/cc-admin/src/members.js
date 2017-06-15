// in src/posts.js
import React from 'react';
import { List, Edit,Filter, Create, SimpleList, Responsive,  Datagrid, ReferenceField, TextField, EditButton, DisabledInput, LongTextInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'admin-on-rest';


export const MemberList = (props) => (
    <List {...props} title="County Committee Members" filters={<MemberFilter />}>
            <Datagrid>
                <TextField source="office_holder" />
                <TextField source="entry_type" />
                <TextField source="electoral_district" />
                <TextField source="assembly_district" />
                <TextField source="county" /> 
                <EditButton />        
            </Datagrid>
    </List>
);

const MemberTitle = ({ record }) => {
    return <span>Post {record ? `"${record.office_holder}"` : ''}</span>;
};

const MemberFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" />
        <TextInput label="Title" source="office_holder" defaultValue="Vacancy" />
    </Filter>
);


export const MemberEdit = (props) => (
    <Edit title={<MemberTitle />} {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="office_holder" />
            <TextInput source="entry_type" />
            <TextInput source="electoral_district" />
            <TextInput source="assembly_district" />
            
        </SimpleForm>
    </Edit>
);

export const MemberCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="office_holder" />
            <TextInput source="entry_type" />
            <TextInput source="electoral_district" />
            <TextInput source="assembly_district" />
        </SimpleForm>
    </Create>
);