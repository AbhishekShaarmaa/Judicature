const { ApolloServer } = require('apollo-server');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const path = require('path');

const typeDefsArray = loadFilesSync(path.join(__dirname, './**/*.gql'));
const typeDefs = mergeTypeDefs(typeDefsArray);

const resolversArray = loadFilesSync(
    path.join(__dirname, './resolvers/**/*.js')
);
const resolvers = mergeResolvers(resolversArray);

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}graphql`);
});
