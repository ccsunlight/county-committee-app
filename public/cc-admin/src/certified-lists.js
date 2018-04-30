// in src/posts.js
import React from "react";
import { Link } from "react-router-dom";
import {
  List,
  Edit,
  Filter,
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
  ReferenceManyField,
  SelectInput,
  SimpleForm,
  TextInput,
  BooleanField
} from "admin-on-rest";
import { WithPermission, SwitchPermissions, Permission } from "aor-permissions";
import authClient from "./feathersAuthClient";
import { checkUserCanEdit } from "./feathersAuthClient";
import { ApproveButton } from "./ApproveButton";

export const CertifiedListList = props => (
  <List {...props} title="Imported Certified Lists">
    <Datagrid>
      <TextField source="county" />
      <TextField source="party" />
      <BooleanField label="Approved" source="isApproved" />
      <BooleanField label="Imported" source="isImported" />
      <EditButton />
    </Datagrid>
  </List>
);

export const CertifiedMemberList = ({ record, props }) => {
  let data = {};

  const ids = record.members.slice(0, 100).map(member => {
    data[member._id] = member;
    return member._id;
  });

  return (
    <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
      <TextField source="_id" />
      <TextField source="office_holder" />
      <TextField source="assembly_district" />
      <TextField source="electoral_district" />
      <TextField source="county" />
      <TextField source="party" />
      <TextField source="tally" />
    </Datagrid>
  );
};

export const CertifiedListEdit = props => {
  return (
    <Edit title={"Import list members"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <BooleanField label="Approved" source="isApproved" />
        <BooleanField label="Imported" source="isImported" />
        <ApproveButton {...props} />
        <TextField source="county" />
        <h4>Sample of imported members</h4>
        <TextField source="members.length" label="Total Members imported" />
        <CertifiedMemberList title="Only first 100 rows shown" props={props} />
      </SimpleForm>
    </Edit>
  );
};
