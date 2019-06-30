import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { PATCH } from "admin-on-rest";
import feathersRestClient from "./feathersRestClient";
import feathersClient from "./feathersClient";
import FlatButton from "material-ui/FlatButton";
import { push as pushAction } from "react-router-redux";
import { showNotification as showNotificationAction } from "admin-on-rest";

class ApproveButton extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { record, showNotification } = this.props;

    feathersRestClient(feathersClient)(PATCH, "term", {
      id: record.id,
      data: { approved: true },
      previousData: { approved: false }
    })
      .then(result => {
        showNotification("Members created");
      })
      .catch(error => {
        showNotification(error.message);
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

ApproveButton.propTypes = {
  push: PropTypes.func,
  record: PropTypes.object,
  showNotification: PropTypes.func
};

export default connect(null, {
  showNotification: showNotificationAction,
  push: pushAction
})(ApproveButton);
