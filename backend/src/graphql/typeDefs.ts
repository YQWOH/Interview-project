import gql from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    createdAt: String!
  }

  type Image {
    id: ID!
    name: String!
    originalName: String!
    filename: String!
    filepath: String!
    size: Int!
    mimetype: String!
    isBookmarked: Boolean!
    uploadedAt: String!
    updatedAt: String!
  }

  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  type ImageList {
    images: [Image!]!
    pagination: PaginationInfo!
  }

  type AnalyticsSummary {
    totalImages: Int!
    bookmarkedCount: Int!
    unbookmarkedCount: Int!
    totalSize: Float!
    bookmarkPercentage: String!
  }

  type SizeByBookmark {
    isBookmarked: Boolean!
    totalSize: Float!
    count: Int!
  }

  type UploadTrend {
    date: String!
    count: Int!
  }

  type Analytics {
    summary: AnalyticsSummary!
    sizeByBookmark: [SizeByBookmark!]!
    uploadTrend: [UploadTrend!]!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    # Auth
    me: User!

    # Images
    images(
      search: String
      bookmarked: Boolean
      page: Int
      limit: Int
      sortBy: String
      order: String
    ): ImageList!

    image(id: ID!): Image!

    # Analytics
    analytics: Analytics!
  }

  type Mutation {
    # Auth
    register(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    # Images
    toggleBookmark(id: ID!): Image!
    deleteImage(id: ID!): Boolean!
  }
`;
