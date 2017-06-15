// in src/App.js
import React from 'react';
import { Admin, Resource, Delete, List } from 'admin-on-rest';
import { authClient, restClient } from 'aor-feathers-client';
import feathersClient from './feathersClient';
import { MemberList, MemberEdit, MemberCreate } from './members';
import { PageList, PageEdit, PageCreate } from './pages';


const authClientOptions = {
  storageKey: 'feathers-jwt',
  authenticate: { strategy: 'local' },
};

const App = () => (
  <Admin 
  	restClient={restClient(feathersClient)}
  >
    <Resource name="county-committee" options={{ label: 'CC Members' }}  list={MemberList} edit={MemberEdit} create={MemberCreate} remove={Delete}/> 
    <Resource name="page" list={PageList} edit={PageEdit} create={PageCreate} remove={Delete} />
    
  </Admin>
);


export default App;