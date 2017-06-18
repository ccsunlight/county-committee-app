// in src/App.js
import React from 'react';
import { Admin, Resource, Delete, List } from 'admin-on-rest';
//import { authClient } from 'aor-feathers-client';
import restClient from './feathersRestClient';
import authClient from './feathersAuthClient';
import feathersClient from './feathersClient';
import feathers from 'feathers/client';
import { MemberList, MemberEdit, MemberCreate } from './members';
import { PageList, PageEdit, PageCreate } from './pages';
import { UserList, UserEdit, UserCreate } from './users';
// import authClient from './authClient';


const authClientOptions = {
  storageKey: 'feathers-jwt',
  authenticate: { strategy: 'local', secret: 'super secret' },
};

const App = () => (
  <Admin 
  	title="CC Admin"
    authClient={authClient(feathersClient, authClientOptions)}
  	restClient={restClient(feathersClient)}
  >
    <Resource name="county-committee" options={{ label: 'CC Members' }}  list={MemberList} edit={MemberEdit} create={MemberCreate} remove={Delete}/> 
    <Resource name="page" list={PageList} edit={PageEdit} create={PageCreate} remove={Delete} />
    <Resource name="user" list={UserList} edit={UserEdit} create={UserCreate} remove={Delete} />

  </Admin>
);


feathersClient.on('created', message => console.log('Created a message', message));


export default App;