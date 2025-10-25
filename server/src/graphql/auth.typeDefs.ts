export const authTypeDefs = `
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    ADMIN
    MANAGER
    FULFILLMENT
    SUPPORT
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    refreshExpiresAt: String!
    user: User!
  }

  type Query {
    me: User!
  }

  type Mutation {
    register(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
      role: UserRole
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    refreshToken(
      refreshToken: String!
    ): AuthPayload!

    logout(
      refreshToken: String!
    ): Boolean!

    requestPasswordReset(
      email: String!
    ): Boolean!

    resetPassword(
      token: String!
      newPassword: String!
    ): Boolean!
  }
`;

