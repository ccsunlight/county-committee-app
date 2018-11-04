import React, { Component } from "react";
import { UPDATE, PATCH } from "admin-on-rest";
import feathersRestClient from "./feathersRestClient";
import feathersClient from "./feathersClient";
import FlatButton from "material-ui/FlatButton";
import { showNotification as showNotificationAction } from "admin-on-rest";

const certifiedListApprove = (id, data, basePath) => ({
  type: "APPROVE",
  payload: { id, data: { ...data, is_approved: true } },
  meta: { resource: "certified-list", fetch: UPDATE, cancelPrevious: false }
});

export class ApproveButton extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { record } = this.props;
    feathersRestClient(feathersClient)(PATCH, "certified-list", {
      id: record.id,
      data: { isApproved: true },
      previousData: { isApproved: false }
    });
  }

  render() {
    return (
      <FlatButton
        label="Approve to Import"
        disabled={this.props.record.isApproved}
        secondary={true}
        onClick={this.handleClick}
      />
    );
  }
}

export default ApproveButton;
