// in src/Menu.js
import React from 'react';
import PropTypes from 'prop-types';
import inflection from 'inflection';
import MenuItem from 'material-ui/MenuItem';
import { Link } from 'react-router-dom';
import pure from 'recompose/pure';
import compose from 'recompose/compose';

import { WithPermission, SwitchPermissions,  Permission} from 'aor-permissions';
import authClient from './feathersAuthClient';
import {checkUserCanEdit, checkUserHasAccess} from './feathersAuthClient';

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
  const onMenuTap = props.onMenuTap;

  console.log('MyMenu', props);

  if (checkUserHasAccess(resource)) {
	  return (
	    <MenuItem
		    key={resource.name}
		    value={resource.name}
		    containerElement={<Link to={`/${resource.name}`} />}
		    primaryText={inflection.titleize(inflection.humanize(inflection.pluralize(resource.name)))}
		    leftIcon={<resource.icon />}
		   onTouchTap={onMenuTap}  />
	  );
  } else {

  		return false;
  }
}

export default ({ onMenuTap, resources,  logout }) => (
    <div>
        {resources
            .filter(r => r.list)
            .map(resource => <MenuItemWithAccess resource={resource} onMenuTap={onMenuTap} />)
               
        }
        {logout}
    </div>
);
