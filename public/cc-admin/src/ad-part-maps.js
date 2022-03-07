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
  FileField,
  BooleanInput
} from "admin-on-rest";
import { Card, CardHeader } from "material-ui/Card";
import moment from "moment";
/**
 * @deprecated
 * @param {@} props
 */
export const ADPartMapList = props => (
  <List {...props} title="AD Part Mappings">
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

const InfoCard = ({ title, subtitle }) => (
  <Card>
    <CardHeader title={title} subtitle={subtitle} />
    {/* <CardActions style={{ textAlign: "right" }}>
      <FlatButton
        label={translate("pos.dashboard.welcome.aor_button")}
        icon={<HomeIcon />}
        href="https://marmelab.com/admin-on-rest/"
      />
      <FlatButton
        label={translate("pos.dashboard.welcome.demo_button")}
        icon={<CodeIcon />}
        href="https://github.com/marmelab/admin-on-rest-demo"
      />
    </CardActions> */}
  </Card>
);

export const PartMappingsList = ({ record, props }) => {
  let data = {};

  const ids = record.partMappings
    ? record.partMappings
        .filter(
          partMapping =>
            partMapping.status === "Failed" || partMapping.status === "Pending"
        )
        .slice(0, 50)
        .map(partMapping => {
          data[partMapping._id] = partMapping;
          return partMapping._id;
        })
    : [];
  if (ids.length > 0) {
    return (
      <Datagrid ids={ids} data={data} currentSort={{ _id: "ASC" }}>
        <TextField source="_id" />
        <TextField source="status" />
        <TextField source="part" />
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

export const ADPartMapEdit = props => {
  return (
    <Edit title={"AD Part Mappings"} {...props}>
      <SimpleForm>
        <DisabledInput label="Id" source="id" />
        <BooleanInput source="approved" label="Approved" />
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
        <InfoCard title={"Part Mappings"} subtitle={"The imported mappings"} />
        <TextField source="importResults.successCount" label="Success Count" />
        <TextField source="importResults.failedCount" label="Failed Count" />
        <TextField source="importResults.pendingCount" label="Pending Count" />
        <TextField source="importResults.totalCount" label="Total Count" />
        <TextField
          source="importResults.unmappedTermMembersCount"
          label="Remaing Unmapped Members Count"
        />
        <PartMappingsList props={props} />
      </SimpleForm>
    </Edit>
  );
};

export const ADPartMapCreate = props => {
  return (
    <Create title={"Create AD Part Map"} {...props}>
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
        <FileInput
          source="files_to_upload"
          label="AD Part Mapping"
          accept=".csv"
        >
          <FileField source="src" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
};
