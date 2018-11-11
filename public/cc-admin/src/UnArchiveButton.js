// in src/comments/ApproveButton.js
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FlatButton from "material-ui/FlatButton";
import { showNotification as showNotificationAction } from "admin-on-rest";
import { push as pushAction } from "react-router-redux";

class UnArchiveButton extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { push, record, showNotification } = this.props;
    const updatedRecord = { ...record, is_archived: false };
    fetch(`/api/v1/county-committee-archive/${record.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(updatedRecord)
    })
      .then(() => {
        showNotification("County Committee Un-Archived");
        push(`/county-committee-archive`);
      })
      .catch(e => {
        console.error(e);
        showNotification("Error: comment not approved", "warning");
      });
  }

  render() {
    return <FlatButton label="Un-Archive" onClick={this.handleClick} />;
  }
}

UnArchiveButton.propTypes = {
  push: PropTypes.func,
  record: PropTypes.object,
  showNotification: PropTypes.func
};

export default connect(null, {
  showNotification: showNotificationAction,
  push: pushAction
})(UnArchiveButton);
