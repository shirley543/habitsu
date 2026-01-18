/**
 * Prisma known error codes.
 * 
 * Refer to:
 * https://www.prisma.io/docs/orm/reference/error-reference#error-codes
 */

/**
 * Prisma Common / Initialization Errors (P1xxx)
 */
export enum PrismaInitError {
  /** P1000: Authentication failed against the database server. */
  AuthenticationFailed = 'P1000',
  /** P1001: Can't reach the database server (network/host issue). */
  CannotReachDatabase = 'P1001',
  /** P1002: The database server was reached but timed out. */
  DatabaseTimeout = 'P1002',
  /** P1003: Database does not exist at the given path/host. */
  DatabaseDoesNotExist = 'P1003',
  /** P1008: Generic operations timed out (client ↔ database). */
  OperationTimedOut = 'P1008',
  /** P1009: Database already exists on the server. */
  DatabaseAlreadyExists = 'P1009',
  /** P1010: Access denied for the user on the database. */
  AccessDenied = 'P1010',
  /** P1011: Error establishing TLS connection. */
  TLSConnectionError = 'P1011',
  /** P1012: Schema validation/parsing errors (pre-4.0 upgrade issues). */
  SchemaValidationError = 'P1012',
  /** P1013: Provided database connection string is invalid. */
  InvalidDatabaseString = 'P1013',
  /** P1014: Underlying model type/connector does not exist. */
  UnderlyingModelMissing = 'P1014',
  /** P1015: Schema uses features unsupported by the database version. */
  UnsupportedFeatureForDatabaseVersion = 'P1015',
  /** P1016: Raw query had incorrect parameter count. */
  RawQueryBadParameterCount = 'P1016',
  /** P1017: Server closed the connection unexpectedly. */
  ServerClosedConnection = 'P1017',
}

/**
 * Prisma Client (Query Engine / P2xxx)
 */
export enum PrismaClientError {
  /** P2000: Provided value is too long for the column type. */
  ValueTooLongForColumn = 'P2000',
  /** P2001: Record searched for in a where condition does not exist. */
  RecordNotFound = 'P2001',
  /** P2002: Unique constraint failed on a field/constraint. */
  UniqueConstraintFailed = 'P2002',
  /** P2003: Foreign key constraint failed on the given field. */
  ForeignKeyConstraintFailed = 'P2003',
  /** P2004: A database constraint failed. */
  DatabaseConstraintFailed = 'P2004',
  /** P2005: Stored value is invalid for the field’s type. */
  InvalidStoredFieldValue = 'P2005',
  /** P2006: Provided field value is not valid. */
  InvalidProvidedFieldValue = 'P2006',
  /** P2007: Data validation error from the database. */
  DataValidationError = 'P2007',
  /** P2008: Failed to parse the query. */
  QueryParsingFailed = 'P2008',
  /** P2009: Query validation failed. */
  QueryValidationFailed = 'P2009',
  /** P2010: Raw query execution failed. */
  RawQueryFailed = 'P2010',
  /** P2011: Null constraint violation on a constraint. */
  NullConstraintViolation = 'P2011',
  /** P2012: Missing a required value at the given path. */
  MissingRequiredValue = 'P2012',
  /** P2013: Missing required argument for a field. */
  MissingRequiredArgument = 'P2013',
  /** P2014: Change would violate a required relation. */
  RequiredRelationViolation = 'P2014',
  /** P2015: A related record could not be found. */
  RelatedRecordNotFound = 'P2015',
  /** P2016: General query interpretation error. */
  QueryInterpretationError = 'P2016',
  /** P2017: Relation records not connected as expected. */
  RelationNotConnected = 'P2017',
  /** P2018: Required connected records not found. */
  RequiredConnectedRecordNotFound = 'P2018',
  /** P2019: Input error (generic) from the engine. */
  InputError = 'P2019',
  /** P2020: Value out of range for the type. */
  ValueOutOfRange = 'P2020',
  /** P2021: Specified table does not exist in the database. */
  TableDoesNotExist = 'P2021',
  /** P2022: Specified column does not exist in the database. */
  ColumnDoesNotExist = 'P2022',
  /** P2023: Inconsistent column data in the database. */
  InconsistentColumnData = 'P2023',
  /** P2024: Timeout when fetching new connection from pool. */
  ConnectionPoolTimeout = 'P2024',
  /** P2025: Operation failed due to missing dependent records. */
  MissingDependentRecords = 'P2025',
  /** P2026: Unsupported database feature used by the query. */
  UnsupportedFeatureUsed = 'P2026',
  /** P2027: Multiple errors occurred during query execution. */
  MultipleDatabaseErrors = 'P2027',
  /** P2028: Transaction API error encountered. */
  TransactionApiError = 'P2028',
  /** P2029: Query parameter limit exceeded. */
  QueryParameterLimitExceeded = 'P2029',
  /** P2030: Fulltext index not found for search. */
  FulltextIndexNotFound = 'P2030',
  /** P2031: MongoDB needs replica set for transactions (Mongo specific). */
  MongoReplicaSetRequired = 'P2031',
  /** P2033: Numeric value too large for 64-bit signed integer. */
  NumericOverflow = 'P2033',
  /** P2034: Transaction failed due to write conflict or deadlock. */
  TransactionWriteConflict = 'P2034',
  /** P2035: Database assertion violation. */
  DatabaseAssertionViolation = 'P2035',
  /** P2036: Error in an external connector. */
  ExternalConnectorError = 'P2036',
  /** P2037: Too many database connections opened. */
  TooManyDatabaseConnections = 'P2037',
}

/**
 * Prisma Migrate (Schema Engine / P3xxx)
 */
export enum PrismaMigrateError {
  /** P3000: Failed to create database. */
  CreateDatabaseFailed = 'P3000',
  /** P3001: Migration has destructive changes (data loss risk). */
  DestructiveChanges = 'P3001',
  /** P3002: Migration was rolled back due to error. */
  Rollback = 'P3002',
  /** P3010: Migration name is too long (over 200 bytes). */
  MigrationNameTooLong = 'P3010',
  /** P3011: Cannot rollback migration that was never applied. */
  CannotRollbackMigrationNotApplied = 'P3011',
  /** P3012: Cannot rollback migration not in a failed state. */
  CannotRollbackMigrationNotFailed = 'P3012',
  /** P3013: Unsupported datasource provider arrays in migrate. */
  UnsupportedDatasourceArrays = 'P3013',
  /** P3014: Shadow database creation failed during migrate. */
  ShadowDatabaseCreationFailed = 'P3014',
}

/**
 * Prisma "db pull" / Introspection Errors (P4xxx)
 */
export enum PrismaIntrospectionError {
  /** P4000: Introspection failed to produce a schema file. */
  Failed = 'P4000',
  /** P4001: The introspected database was empty. */
  DatabaseEmpty = 'P4001',
  /** P4002: Schema of introspected database was inconsistent. */
  SchemaInconsistent = 'P4002',
}

/**
 * Prisma Accelerate (P6xxx)
 */
export enum PrismaAccelerateError {
  /** P6000: Generic server error. */
  ServerError = 'P6000',
  /** P6001: Invalid Accelerate data source URL. */
  InvalidDataSource = 'P6001',
  /** P6002: Unauthorized (invalid API key). */
  Unauthorized = 'P6002',
  /** P6003: Plan limit exceeded on free plan. */
  PlanLimitReached = 'P6003',
  /** P6004: Prisma Accelerate global query timeout. */
  QueryTimeout = 'P6004',
  /** P6005: Invalid parameters supplied to Accelerate. */
  InvalidParameters = 'P6005',
  /** P6006: Prisma version not supported by Accelerate. */
  VersionNotSupported = 'P6006',
  /** P6008: Accelerate connection/engine start error. */
  ConnectionError = 'P6008',
  /** P6009: Accelerate response size limit exceeded. */
  ResponseSizeLimitExceeded = 'P6009',
  /** P6010: Project disabled error in Accelerate. */
  ProjectDisabled = 'P6010',
  /** P5011: Too many requests (rate limit) for Prisma Accelerate. */
  TooManyRequests = 'P5011',
}

export type PrismaErrorCode =
  | PrismaInitError
  | PrismaClientError
  | PrismaMigrateError
  | PrismaIntrospectionError
  | PrismaAccelerateError;
