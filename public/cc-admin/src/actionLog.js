// in src/posts.js
import React from "react";
import { List, Datagrid, TextField } from "admin-on-rest";
/*
const MemberTitle = ({ record }) => {
    return <span>Post {record ? `"${record.office_holder}"` : ''}</span>;
};
*/

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Parses the description object. If it's a JSON tries to output the ID of the resource.
 * If it's not a json then it is a login event.
 *
 * @todo       Make this more consistant.
 *
 * @class      ActionDescriptionField (name)
 * @param      {Object}  arg1         The argument 1
 * @param      {<type>}  arg1.record  The record
 * @return     {<type>}  { description_of_the_return_value }
 */
const ActionDescriptionField = ({ record }) => {
  if (record.meta && record.meta.description) {
    if (isJson(record.meta.description)) {
      let parsedJSON = JSON.parse(record.meta.description);
      if (parsedJSON._id) {
        return <span>{parsedJSON._id}</span>;
      } else {
        return <span />;
      }
    } else {
      return <span>{record.meta.description}</span>;
    }
  } else {
    return <span />;
  }
};

export const ActionLogList = props => (
  <List
    {...props}
    title="Action Log"
    sort={{ field: "createdAt", order: "DESC" }}
  >
    <Datagrid>
      <TextField label="User" source="meta.user" />
      <TextField label="Timestamp" source="createdAt" />
      <TextField label="Action" source="message" />
      <TextField label="Resource" source="meta.type" />
      <ActionDescriptionField label="Description" />
    </Datagrid>
  </List>
);
