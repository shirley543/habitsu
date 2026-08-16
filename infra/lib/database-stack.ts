import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  dbSecurityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dbInstance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    this.dbInstance = new rds.DatabaseInstance(this, 'HabitTrackerDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED // place DB in private isolated subnet
      },
      securityGroups: [props.dbSecurityGroup],
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'), // auto-creates a Secrets Manager secret for DB password, with username 'postgres'
      databaseName: 'habittracker',
      publiclyAccessible: false,
      multiAz: false,
      allocatedStorage: 20,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // so `cdk destroy` doesn't orphan it and keep billing running
      deletionProtection: false,
    })
  }
}
