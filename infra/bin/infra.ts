#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib/core';
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

new ReminderStack(app, 'ReminderStack', {
  // TODOs #84 figure out which AWS account to use
  env: { account: '123456789012', region: 'ap-southeast-4' },
})
