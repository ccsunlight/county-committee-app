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
  TextInput,
  DateInput
} from "admin-on-rest";
export const NewsLinkList = props => (
  <List {...props} title="News">
    <Datagrid>
      <TextField source="title" />
      <TextField source="url" />
      <TextField source="site_name" />
      <EditButton />
    </Datagrid>
  </List>
);

const NewsLinkTitle = ({ record }) => {
  return <span>Post {record ? `"${record.title}"` : ""}</span>;
};

export const NewsLinkEdit = props => (
  <Edit title={<NewsLinkTitle />} {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <TextInput source="title" />
      <TextInput source="url" type="url" />
      <TextInput source="description" />
      <DateInput source="published_on" />
      <TextInput source="site_name" />
    </SimpleForm>
  </Edit>
);

export const NewsLinkCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput
        source="url"
        type="url"
        options={{
          hintText:
            "If you enter an article url and save it will fetch all the meta info."
        }}
      />

      <TextInput source="description" />
      <DateInput source="published_on" />
      <TextInput source="site_name" />
    </SimpleForm>
  </Create>
);
