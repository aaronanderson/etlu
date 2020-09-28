import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { GraphQLError, OperationDefinitionNode } from "graphql";
import { getMainDefinition } from "apollo-utilities";
import { ApolloLink } from 'apollo-link';

const cache = new InMemoryCache();
const httpLink = new HttpLink({
  uri: '/graphql',
});

//https://github.com/apollographql/apollo-feature-requests/issues/6#issuecomment-552383196
const cleanTypenameLink = new ApolloLink((operation, forward) => {
  const omitTypename = (key: any, value: any) =>
    key === "__typename" ? undefined : value;

  const def = getMainDefinition(operation.query); 
  if (def && (<OperationDefinitionNode>def).operation === "mutation") {
    operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename);
  }
  return forward ? forward(operation) : null;
});

 const appLink = ApolloLink.from([cleanTypenameLink, httpLink]);

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