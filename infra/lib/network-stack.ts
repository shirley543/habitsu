import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  public readonly appSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Build the virtual private network (VPC)
    this.vpc = new ec2.Vpc(this, 'HabitTrackerVpc', {
      maxAzs: 2, //< Maximum availability zones for this region
      natGateways: 0, //< Avoid ~$32/mo NAT cost (TODOs #85: to revisit; may need it for reminder-finder lambda but to confirm)
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 }, // routes to an Internet Gateway
        { name: 'isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 }, // no route out at all, either direction
      ]
    });

    // Security group for the database
    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: this.vpc,
      description: 'Allow Postgres access from app compute only',
      allowAllOutbound: false, // security group for the server side, DB has no reason to initiate outbound connection
    });

    // Security group for the app.
    // Attach to any Lambda/ compute that needs to reach the DB (e.g. reminder-stack)
    this.appSecurityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Lambdas/compute that need DB access',
      allowAllOutbound: true, // security group for the client side, reaching out to the DB, and to SQS/ Logs/ Secrets Manager
    });

    // Add an ingress rule on `dbSecurityGroup`:
    // Allowing inbound TCP:5432 traffic
    // into resources with `dbSecurityGroup` attached,
    // from resources with `appSecurityGroup` attached.
    this.dbSecurityGroup.addIngressRule(
      this.appSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Postgres from app compute'
    )
  }
}
