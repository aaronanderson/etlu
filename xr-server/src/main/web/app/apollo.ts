import { ApolloClient, InMemoryCache, ApolloLink, HttpLink, getMainDefinition } from '@apollo/client/core';

const cache = new InMemoryCache();
const httpLink = new HttpLink({
  uri: '/graphql',
});

//https://github.com/apollographql/apollo-feature-requests/issues/6#issuecomment-659596763
// Used to remove typename property from objects
const isFile = value =>
  (typeof File !== 'undefined' && value instanceof File) || (typeof Blob !== 'undefined' && value instanceof Blob);

// From https://gist.github.com/Billy-/d94b65998501736bfe6521eadc1ab538
const omitDeep = (value, key) => {
  if (Array.isArray(value)) {
    return value.map(i => omitDeep(i, key));
  } else if (typeof value === 'object' && value !== null && !isFile(value)) {
    return Object.keys(value).reduce((newObject, k) => {
      if (k === key) return newObject;
      return Object.assign({ [k]: omitDeep(value[k], key) }, newObject);
    }, {});
  }
  return value;
};

const omitTypenameLink = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    operation.variables = omitDeep(operation.variables, '__typename');
  }
  return forward(operation);
});

 const appLink = ApolloLink.from([omitTypenameLink, httpLink]);

export const graphqlClient = new ApolloClient({
  cache: cache,
  link: appLink,

  name: 'etlu-app-client',
  version: '1.0',
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

