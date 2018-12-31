// in src/users.js
import React from "react";
import {
  Restricted,
  List,
  Edit,
  Filter,
  RichTextField,
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
  TextInput,
  DeleteButton
} from "admin-on-rest";
import { SwitchPermissions, Permission } from "aor-permissions";
import authClient from "./feathersAuthClient";
import { checkUserCanEdit } from "./feathersAuthClient";

export const ProfileList = props => (
  <List
    title="Profile"
    {...props}
    filter={{ _id: localStorage.getItem("userId") }}
  >
    <Datagrid>
      <TextField source="id" />
      <TextField source="email" />
      <TextField label="Firstname" source="firstname" />
      <TextField label="Lastname" source="lastname" />
      <EditButton />
    </Datagrid>
  </List>
);

const UserTitle = ({ record }) => {
  return <span>Edit User</span>;
};

export const ProfileEdit = props => (
  <Edit title={<UserTitle />} {...props}>
    <SimpleForm>
      <DisabledInput label="Id" source="id" />
      <TextInput label="Email Address" source="email" type="email" />
      <TextInput label="Firstname" source="firstname" type="text" />
      <TextInput label="Lastname" source="lastname" type="text" />
      <DisabledInput label="role" source="role" />
      <TextInput
        label="Change Password"
        source="changepassword"
        type="password"
      />
      <TextInput
        label="Confirm Password"
        source="confirmpassword"
        type="password"
      />
    </SimpleForm>
  </Edit>
);
