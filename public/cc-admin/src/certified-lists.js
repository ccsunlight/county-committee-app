// in src/posts.js
import React from "react";
import { Link } from "react-router-dom";
import {
  List,
  Edit,
  Filter,
  Create,
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
  BooleanField,
  SingleFieldList,
  ReferenceManyField,
  ReferenceArrayField,
  FunctionField,
  FileInput,
  FileField,
  SelectField
} from "admin-on-rest";
import { WithPermission, SwitchPermissions, Permission } from "aor-permissions";
import authClient from "./feathersAuthClient";
import { checkUserCanEdit } from "./feathersAuthClient";
import moment from "moment";

export const CertifiedListList = props => (
  <List {...props} title="Certified Lists">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <ReferenceField
        label="County Committee"
        source="term_id"
        reference="term"
        allowEmpty={true}
      >
        <FunctionField
          label="Name"
          render={record =>
            `${record.committee.county} ${record.committee.party}`
          }
        />
      </ReferenceField>
      <EditButton />
    </Datagrid>
  </List>
);

export const PartyPositionsList = ({ record, props }) => {
  let data = {};

  const ids = record.positions
    ? record.positions.slice(0, 50).map(position => {
        data[position._id] = position;
        return position._id;
      })
    : [];
  if (ids.length > 0) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField source="_id" />
        <TextField label="AD" source="assembly_district" />
        <TextField label="ED" source="electoral_district" />

        <TextField source="office" />
        <TextField source="office_holder" />
      </Datagrid>
    );
  } else {
    return (
      <div>
        Loading preview of positions. If it takes a while try hitting refresh.
      </div>
    );
  }
};

export const CertifiedListEdit = props => {
  return (
    <Edit title={"Certified List"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <ReferenceInput
          label="Committee Term"
          source="term_id"
          reference="term"
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Dates"
                render={record =>
                  `${record.committee.county} ${
                    record.committee.party
                  } ${moment(record.start_date).format("ll")} to ${moment(
                    record.end_date
                  ).format("ll")}`
                }
              />
            }
          />
        </ReferenceInput>
        <PartyPositionsList props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const CertifiedListCreate = props => {
  return (
    <Create title={"Create Certified List"} {...props}>
      <SimpleForm>
        <ReferenceInput
          label="Committee Term"
          source="term_id"
          reference="term"
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Dates"
                render={record =>
                  `${record.committee.county} + ${
                    record.committee.party
                  } ${moment(record.start_date).format("ll")} to ${moment(
                    record.start_date
                  ).format("ll")}`
                }
              />
            }
          />
        </ReferenceInput>
        <FileInput
          source="files_to_upload"
          label="Certified List"
          accept=".pdf"
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
