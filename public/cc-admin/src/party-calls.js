// in src/posts.js
import React from "react";
import {
  List,
  Edit,
  Create,
  Datagrid,
  ReferenceField,
  TextField,
  EditButton,
  DisabledInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  FunctionField,
  FileInput,
  FileField
} from "admin-on-rest";
import { ExportCSVButton } from "./ExportCSVButton";
import moment from "moment";
/**
 * @deprecated
 * @param {@} props
 */
export const PartyCallList = props => (
  <List {...props} title="Party Calls">
    <Datagrid>
      <TextField source="id" />
      <TextField source="source" />
      <ReferenceField
        label="County Committee"
        source="term_id"
        reference="term"
        allowEmpty={true}
        perPage={200}
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
        <TextField source="office" />
        <TextField source="assembly_district" />
        <TextField source="electoral_district" />
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

export const PartyCallEdit = props => {
  return (
    <Edit title={"Import list members"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <ExportCSVButton props={props} />
        <ReferenceInput
          label="Committee Term"
          source="term_id"
          reference="term"
          perPage={200}
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

export const PartyCallCreate = props => {
  return (
    <Create title={"Create Party Call"} {...props}>
      <SimpleForm>
        <ReferenceInput
          label="Committee Term"
          source="term_id"
          reference="term"
          perPage={200}
        >
          <SelectInput
            optionText={
              <FunctionField
                label="Dates"
                render={record =>
                  `${record.committee.county} + ${
                    record.committee.party
                  } ${moment(record.start_date).format("ll")} to ${moment(
                    record.end_date
                  ).format("ll")}`
                }
              />
            }
          />
        </ReferenceInput>
        <FileInput source="files_to_upload" label="Party Call" accept=".csv">
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
