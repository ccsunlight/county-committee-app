// in src/Menu.js
import React from "react";
import inflection from "inflection";
import MenuItem from "material-ui/MenuItem";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { getResources } from "admin-on-rest";

// import { WithPermission, SwitchPermissions, Permission } from "aor-permissions";

import { checkUserHasAccess } from "./feathersAuthClient";

/* <MenuItem
                        key={resource.name}
                        value={resource.name}
                        containerElement={<Link to={`/${resource.name}`} />}
                        primaryText={inflection.titleize(inflection.humanize(inflection.pluralize(resource.name)))}
                        leftIcon={<resource.icon />}
                        onTouchTap={onMenuTap}  />
*/

function MenuItemWithAccess(props) {
  const resource = props.resource;

  if (!checkUserHasAccess(resource)) {
    return null;
  } else {
    return (
      <MenuItem
        key={resource.name}
        value={resource.name}
        containerElement={<Link to={`/${resource.name}`} />}
        primaryText={
          resource.options.label
            ? resource.options.label
            : inflection.titleize(
                inflection.humanize(inflection.pluralize(resource.name))
              )
        }
        leftIcon={<resource.icon />}
      />
    );
  }
}

const Menu = ({ resources, onMenuTap, logout }) => {
  return (
    <div>
      {resources
        .filter(r => r.list)
        .map((resource, index) => (
          <MenuItemWithAccess
            key={index}
            resource={resource}
            onMenuTap={onMenuTap}
          />
        ))}
      {logout}
    </div>
  );
};

const mapStateToProps = state => ({
  resources: getResources(state)
});
export default connect(mapStateToProps)(Menu);
