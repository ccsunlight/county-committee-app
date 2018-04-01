import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_CHECK, AUTH_ERROR } from 'admin-on-rest';
import { AUTH_GET_PERMISSIONS } from 'aor-permissions';
import decode from 'jwt-decode';

export const checkUserCanEdit = params => {
  // console.log('perms', params.permissions('AUTH_GET_PERMISSIONS'));
  //return params.permissions('AUTH_GET_PERMISSIONS');
  const role = params.permissions('AUTH_GET_PERMISSIONS'); // This is the result of the `authClient` call with type `AUTH_GET_PERMISSIONS`
  //const resource = params.resource; // The resource, eg: 'posts'
  //const record = params.record; // The current record (only supplied for Edit)
  console.log('checkUserCanEdit', role, params);

  // Only      with admin role can edit the posts of the 'announcements' category
  if (role === 'admin') {
    console.log('role', role);
    return true;
  } else {
    return false;
  }
};

export const checkUserHasAccess = resource => {
  console.log(
    'checkUserHasAccess',
    resource.name,
    localStorage.getItem('role')
  );
  switch (resource.name) {
    case 'user':
    case 'invite':
    case 'action-log':
      return localStorage.getItem('role') == 'admin';
      break;
    default:
      return true;
  }
};

export default (client, options = {}) => (type, params) => {
  const { storageKey, authenticate } = Object.assign(
    {},
    {
      storageKey: 'feathers-jwt',
      authenticate: {
        type: 'access'
      }
    },
    options
  );
  console.log('access type', type, params);
  console.log('params', params);
  console.log('storage', localStorage.getItem(storageKey));
  switch (type) {
    case AUTH_GET_PERMISSIONS:
      console.log('AUTH_GET_PERMISSIONS', localStorage.getItem('role'));
      return localStorage.getItem('role');
    case AUTH_LOGIN:
      const { username, password } = params;
      return client
        .authenticate({
          ...authenticate,
          email: username,
          password
        })
        .then(response => {
          console.log('Authenticated!', response);
          localStorage.setItem(storageKey, response.accessToken);
          return client.passport.verifyJWT(response.accessToken);
        })
        .then(payload => {
          console.log('JWT Payload', payload);
          return client.service('user').get(payload.userId);
        })
        .then(user => {
          client.set('user', user);
          console.log('User', client.get('user'));
          localStorage.setItem('userId', client.get('user').id);
          localStorage.setItem('role', client.get('user').role);

          return Promise.resolve();
        })
        .catch(function(error) {
          console.error('Error authenticating!', error);
          return Promise.reject(error);
        });
      break;
    case AUTH_ERROR:
      if (params.status === 401 || params.status === 403) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        return Promise.reject();
      }
      return Promise.reject();
    //}
    case AUTH_LOGOUT:
      // @todo send logout request to server as well.
      localStorage.removeItem(storageKey);
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      return client.logout();

    case AUTH_CHECK:
      console.log('AUTH_CHECK Checking page');
      return localStorage.getItem(storageKey)
        ? Promise.resolve()
        : Promise.reject();
      break;
    default:
      throw new Error(`Unsupported FeathersJS authClient action type ${type}`);
  }
};
