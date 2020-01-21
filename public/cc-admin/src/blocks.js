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
import "tinymce/plugins/link";
import "tinymce/plugins/preview";

import TinyMCEInput from "aor-tinymce-input";

window.tinymce = tinymce;

export const BlockList = props => (
  <List {...props} title="Blocks">
    <Datagrid>
      <TextField source="title" />
      <TextField source="alias" />
      <TextField source="updatedAt" />
      <TextField source="createdAt" />
      <EditButton />
    </Datagrid>
  </List>
);

const BlockTitle = ({ record }) => {
  return <span>Post {record ? `${record.title}` : ""}</span>;
};

export const BlockEdit = props => (
  <Edit title={<BlockTitle />} {...props}>
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
      <TinyMCEInput
        source="content"
        config={{ height: "600", skin: false, plugins: ["link", "preview"] }}
      />
    </SimpleForm>
  </Edit>
);

export const BlockCreate = props => (
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
      <TinyMCEInput
        source="content"
        config={{
          plugins: ["link"]
        }}
      />
    </SimpleForm>
  </Create>
);
