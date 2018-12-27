import React, { Component } from "react";
import { UPDATE, PATCH } from "admin-on-rest";
import feathersRestClient from "./feathersRestClient";
import feathersClient from "./feathersClient";
import FlatButton from "material-ui/FlatButton";
import { showNotification as showNotificationAction } from "admin-on-rest";

const certifiedListApprove = (id, data, basePath) => ({
  type: "APPROVE",
  payload: { id, data: { ...data, approved: true } },
  meta: { resource: "term", fetch: UPDATE, cancelPrevious: false }
});

export class ApproveButton extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { record } = this.props;
    feathersRestClient(feathersClient)(PATCH, "term", {
      id: record.id,
      data: { approved: true },
      previousData: { approved: false }
    });
  }

  render() {
    return (
      <FlatButton
        label="Convert to Members"
        disabled={this.props.record.isApproved}
        secondary={true}
        onClick={this.handleClick}
      />
    );
  }
}

export default ApproveButton;
