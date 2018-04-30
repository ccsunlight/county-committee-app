// in src/posts.js
import React from 'react';
import {
  List,
  Edit,
  Filter,
  RichTextField,
  Create,
  SimpleList,
  Responsive,
  Datagrid,
  ReferenceField,
  TextField,
  EditButton,
  DisabledInput,
  LongTextInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextInput,
  SaveButton,
  Toolbar
} from 'admin-on-rest';
import RichTextInput from './aor-rich-text-input';
import { SwitchPermissions, Permission } from 'aor-permissions';
import authClient from './feathersAuthClient';
import { checkUserCanEdit } from './feathersAuthClient';

export const PageList = props => (
  <List {...props} title="Pages">
    <Datagrid>
      <TextField source="title" />
      <TextField source="alias" />
      <TextField source="updatedAt" />
      <TextField source="createdAt" />
      <EditButton />
    </Datagrid>
  </List>
);

const PageTitle = ({ record }) => {
  return <span>Post {record ? `${record.title}` : ''}</span>;
};

const toolbarProps = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],
  ['image', 'video', 'link', 'code'],
  ['clean'] // remove formatting button
];

const quillModules = {
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true
  }
};
console.log('quillOptions');

const quillOptions = {
  toolbar: toolbarProps,
  onEditorReady(editor) {
    console.log('editor ready');
    let qlEditor = null;
    for (let i = 0; i < editor.container.childNodes.length; i++) {
      if (editor.container.childNodes[i].className === 'ql-editor') {
        qlEditor = editor.container.childNodes[i];
        break;
      }
    }
    if (qlEditor === null) return;
    for (let i = 0; i < qlEditor.childNodes.length; i++) {
      if (
        qlEditor.childNodes[i].nextSibling &&
        qlEditor.childNodes[i].nextSibling.className !== 'ql-syntax'
      ) {
        continue;
      }
      if (qlEditor.childNodes[i].innerHTML === '<br>') {
        qlEditor.removeChild(qlEditor.childNodes[i]);
      }
    }
  }
};

export const PageEdit = props => (
  <Edit title={<PageTitle />} {...props}>
    <SimpleForm redirect={true}>
      <DisabledInput label="Id" source="id" />
      <SelectInput
        source="status"
        choices={[
          { id: 'draft', name: 'Draft' },
          { id: 'published', name: 'Published' }
        ]}
      />
      <TextInput source="title" />
      <TextInput source="alias" type="text" />
      <RichTextInput source="content" options={quillOptions} />
    </SimpleForm>
  </Edit>
);

export const PageCreate = props => (
  <Create {...props}>
    <SimpleForm redirect={true}>
      <TextInput source="title" />
      <SelectInput
        source="status"
        choices={[
          { id: 'draft', name: 'Draft' },
          { id: 'published', name: 'Published' }
        ]}
      />
      <TextInput source="alias" type="text" />
      <RichTextInput
        elStyle={{ height: '500px' }}
        options={quillOptions}
        source="content"
        module={quillModules}
        toolbar={toolbarProps}
      />
    </SimpleForm>
  </Create>
);
