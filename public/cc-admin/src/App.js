// in src/App.js
import React from 'react';
import { Admin, Resource, Delete, List } from 'admin-on-rest';
//import { authClient } from 'aor-feathers-client';
import restClient from './feathersRestClient';
//import { WithPermission } from 'aor-permissions';

import authClient from './feathersAuthClient';
import feathersClient from './feathersClient';
import feathers from 'feathers/client';
import { MemberList, MemberEdit, MemberCreate } from './members';
import { PageList, PageEdit, PageCreate } from './pages';
import { UserList, UserEdit, UserCreate } from './users';
import { If, Then, Else } from 'react-if';
import Menu from './Menu';

// import authClient from './authClient';


const authClientOptions = {
  storageKey: 'feathers-jwt',
  authenticate: { strategy: 'local'},
};

const App = () => (
    <Admin 
    	title="CC Admin"
      menu={Menu} 
      authClient={authClient(feathersClient, authClientOptions)}
    	restClient={restClient(feathersClient)}
    >
      <Resource name="county-committee" options={{ label: 'CC Members' }}  list={MemberList} edit={MemberEdit} create={MemberCreate} remove={Delete} /> 
      <Resource name="page" list={PageList} edit={PageEdit} create={PageCreate} remove={Delete} />
      <Resource name="user" list={UserList} edit={UserEdit} create={UserCreate} remove={Delete} />
       
    </Admin>
);


feathersClient.on('created', message => console.log('Created a message', message));



const checkUserCanEdit = (params) => {

    console.log('checkUserCanEdit', params);

   // console.log('perms', params.permissions('AUTH_GET_PERMISSIONS'));
    //return params.permissions('AUTH_GET_PERMISSIONS');
  
    const permissions = params.permissions('AUTH_GET_PERMISSIONS'); // This is the result of the `authClient` call with type `AUTH_GET_PERMISSIONS`
    //const resource = params.resource; // The resource, eg: 'posts'
    //const record = params.record; // The current record (only supplied for Edit)
    console.log('vpermissions', permissions);
 
    // Only user with admin role can edit the posts of the 'announcements' category
    if (permissions) {
        return true;
    }

    return false;
    
}


export default App;