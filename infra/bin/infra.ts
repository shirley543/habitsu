#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib/core';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { ReminderStack } from '../lib/reminder-stack';

const app = new cdk.App();
// new InfraStack(app, 'InfraStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

const env: cdk.Environment = { account: '790072401370', region: 'ap-southeast-2' };

const network = new NetworkStack(app, 'NetworkStack', { env });
const database = new DatabaseStack(app, 'DatabaseStack', { env, vpc: network.vpc, dbSecurityGroup: network.dbSecurityGroup });

new ReminderStack(app, 'ReminderStack', {
  env,
  vpc: network.vpc,
  dbInstance: database.dbInstance,
  appSecurityGroup: network.appSecurityGroup,
})
