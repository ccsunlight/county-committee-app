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
  SelectInput,
  SimpleForm,
  TextInput
} from "admin-on-rest";

// import { SwitchPermissions, Permission } from "aor-permissions";
// import authClient from "./feathersAuthClient";
// import { checkUserCanEdit } from "./feathersAuthClient";
import tinymce from "tinymce/tinymce";

import "tinymce/themes/modern/theme";
import "tinymce/skins/lightgray/skin.min.css";

import TinyMCEInput from "aor-tinymce-input";

window.tinymce = tinymce;

export const PageList = props => (
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
  return <span>Post {record ? `${record.title}` : ""}</span>;
};

export const PageEdit = props => (
  <Edit title={<PageTitle />} {...props}>
    <SimpleForm redirect={true}>
      <DisabledInput label="Id" source="id" />
      <SelectInput
        source="status"
        choices={[
          { id: "draft", name: "Draft" },
          { id: "published", name: "Published" }
        ]}
      />
      <TextInput source="title" />
      <TextInput source="alias" type="text" />
      <TinyMCEInput source="content" config={{ height: "600", skin: false }} />
    </SimpleForm>
  </Edit>
);

export const PageCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={true}>
      <TextInput source="title" />
      <SelectInput
        source="status"
        choices={[
          { id: "draft", name: "Draft" },
          { id: "published", name: "Published" }
        ]}
      />
      <TextInput source="alias" type="text" />
      <TinyMCEInput source="content" config={{ height: "600", skin: false }} />
    </SimpleForm>
  </Create>
);
