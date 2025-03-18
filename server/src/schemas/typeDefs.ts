import gql from 'graphql-tag';

const typeDefs = gql`
  type Book {
    bookID: String!
    title: String!
    authors: [String!]!
    description: String!
    image: String!
    link: String!
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book!]!
    bookCount: Int
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    getSingleUser(_id: String!, username: String!): User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookId: String!, authors: [String], description: String, title: String, image: String, link: String): User
    deleteBook(bookID: String!): User
  }
`;
  export default typeDefs;