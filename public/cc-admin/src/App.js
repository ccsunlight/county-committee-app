// in src/App.js
import React from "react";
import { Admin, Resource, Delete } from "admin-on-rest";
//import { authClient } from 'aor-feathers-client';
//import { WithPermission } from 'aor-permissions';

import GlossaryTermIcon from "material-ui/svg-icons/action/speaker-notes";
import ActionLogIcon from "material-ui/svg-icons/device/storage";
import PostIcon from "material-ui/svg-icons/action/book";
import UserIcon from "material-ui/svg-icons/social/group";
import PersonAddIcon from "material-ui/svg-icons/social/person-add";
import AccountIcon from "material-ui/svg-icons/action/account-box";

import feathersRestClient from "./feathersRestClient";
import feathersAuthClient from "./feathersAuthClient";
import feathersClient from "./feathersClient";
import addUploadCapabilities from "./addUploadCapabilities";

import { MemberList, MemberEdit, MemberCreate } from "./members";
import {
  CountyCommitteeList,
  CountyCommitteeEdit,
  CountyCommitteeCreate
} from "./county-committees";

import { PartyCallList, PartyCallEdit, PartyCallCreate } from "./party-calls";

import { TermList, TermEdit, TermCreate } from "./terms";

import {
  CertifiedListList,
  CertifiedListEdit,
  CertifiedListCreate
} from "./certified-lists";

import { PageList, PageEdit, PageCreate } from "./pages";
import { UserList, UserEdit } from "./users";
import {
  GlossaryTermList,
  GlossaryTermCreate,
  GlossaryTermEdit
} from "./glossary-term";

import {
  ImportListList,
  ImportListCreate,
  ImportListEdit
} from "./import-lists";

import {
  BOEElectionResultsList,
  BOEElectionResultsCreate,
  BOEElectionResultsEdit
} from "./boe-election-results";

import { NewsLinkList, NewsLinkCreate, NewsLinkEdit } from "./news-links";
import { ActionLogList } from "./actionLog";
import { ProfileList, ProfileEdit } from "./profile";
import { InviteList, InviteCreate } from "./invites";

import Menu from "./Menu";

// import authClient from './authClient';

const authClientOptions = {
  storageKey: "feathers-jwt",
  authenticate: { strategy: "local" }
};

const App = () => (
  <Admin
    title="CC Admin"
    menu={Menu}
    authClient={feathersAuthClient(feathersClient, authClientOptions)}
    restClient={addUploadCapabilities(feathersRestClient(feathersClient))}
  >
    <Resource
      name="county-committee"
      options={{ label: "County Committees" }}
      list={CountyCommitteeList}
      edit={CountyCommitteeEdit}
      create={CountyCommitteeCreate}
      remove={Delete}
    />

    <Resource
      name="term"
      options={{ label: "Terms" }}
      icon={ActionLogIcon}
      list={TermList}
      edit={TermEdit}
      create={TermCreate}
      remove={Delete}
    />

    <Resource
      name="certified-list"
      options={{ label: "Certified Lists" }}
      icon={ActionLogIcon}
      list={CertifiedListList}
      edit={CertifiedListEdit}
      create={CertifiedListCreate}
      remove={Delete}
    />

    <Resource
      name="party-call"
      options={{ label: "Party Calls" }}
      icon={ActionLogIcon}
      list={PartyCallList}
      edit={PartyCallEdit}
      create={PartyCallCreate}
      remove={Delete}
    />

    <Resource
      name="county-committee-member"
      options={{ label: "CC Members" }}
      list={MemberList}
      edit={MemberEdit}
      create={MemberCreate}
      remove={Delete}
    />

    <Resource
      name="import-list"
      options={{ label: "Imports" }}
      icon={UserIcon}
      list={ImportListList}
      edit={ImportListEdit}
      create={ImportListCreate}
      remove={Delete}
    />

    <Resource
      name="boe-election-results"
      options={{ label: "BOE Scraper" }}
      icon={UserIcon}
      list={BOEElectionResultsList}
      edit={BOEElectionResultsEdit}
      create={BOEElectionResultsCreate}
      remove={Delete}
    />

    {/* <Resource
      name="county-committee-archive"
      options={{ label: "Archive" }}
      list={CountyCommitteeArchiveList}
      edit={CountyCommitteeArchiveEdit}
      remove={Delete}
    /> */}

    <Resource
      name="profile"
      icon={AccountIcon}
      options={{ label: "My Profile" }}
      list={ProfileList}
      edit={ProfileEdit}
    />

    <Resource
      name="page"
      icon={PostIcon}
      list={PageList}
      edit={PageEdit}
      create={PageCreate}
      remove={Delete}
    />

    <Resource
      name="user"
      icon={UserIcon}
      list={UserList}
      edit={UserEdit}
      remove={Delete}
    />

    <Resource
      name="invite"
      icon={PersonAddIcon}
      list={InviteList}
      create={InviteCreate}
      remove={Delete}
    />

    <Resource
      name="glossary-term"
      options={{ label: "Glossary" }}
      icon={GlossaryTermIcon}
      list={GlossaryTermList}
      create={GlossaryTermCreate}
      edit={GlossaryTermEdit}
      remove={Delete}
    />

    <Resource
      name="action-log"
      options={{ label: "Action Log" }}
      icon={ActionLogIcon}
      list={ActionLogList}
    />

    <Resource
      name="news-link"
      options={{ label: "News" }}
      icon={ActionLogIcon}
      list={NewsLinkList}
      create={NewsLinkCreate}
      edit={NewsLinkEdit}
      remove={Delete}
    />
  </Admin>
);

// feathersClient.on("created", message =>
//   console.log("Created a message", message)
// );

export default App;
