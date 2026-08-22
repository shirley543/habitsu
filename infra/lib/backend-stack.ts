import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';

export interface BackendStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  // TODOs #84 currently Backend image, while living in same VPC as RDS,
  // connection info not set up; need to address for Backend
  // to communicate with RDS successfully
  // dbInstance: rds.DatabaseInstance;
  appSecurityGroup: ec2.SecurityGroup;
}

export class BackendStack extends cdk.Stack {
  public readonly ecrRepository: ecr.Repository;
  public readonly loadBalancedFargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // ECR Repository: stores the backend's built container images (pushed via `docker push`),
    // which the Fargate service pulls from to run tasks.
    this.ecrRepository = new ecr.Repository(this, 'HabitTrackerBackendEcrRepository', {
      imageScanOnPush: true,                    // scan each pushed image for known vulnerabilities
      removalPolicy: cdk.RemovalPolicy.DESTROY, // repo is deleted on `cdk destroy`; Use RETAIN for production
      emptyOnDelete: true,                      // let DESTROY succeed even if images are still in the repo
    });

    // Fargate Service: runs the backend container on the cluster, fronted by an
    // Application Load Balancer (ALB + target group + security groups all provisioned by this L3 construct).
    this.loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'BackendService', {
      vpc: props.vpc,
      securityGroups: [props.appSecurityGroup],
      cpu: 256,                 // Fargate task-level vCPU units allocation (1024 = 1 vCPU)
      memoryLimitMiB: 1024,     // Fargate task-level memory allocation (all containers within it)
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository, 'latest'), // image pulled from the ECR repo above
      },
      // Note: below containerCpi/ containerMemoryLimitMiB fields set for example only.
      // Currently only 1 container with no sidecar (via taskDefinition.addContainer()),
      // so set equal to task-level allocation above.
      containerCpu: 256,              // Fargate container-level vCPU units allocation (must be <= task-level cpu)
      containerMemoryLimitMiB: 1024,  // Fargate container-level memory allocation (must be <= task-level memoryLimitMiB)
      minHealthyPercent: 50,          // % of desired task count that must stay healthy during deployments
    });

    // Setup custom health-check for Fargate service
    // TODOs #85 actually define the health-check endpoint in backend
    this.loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/custom-health-path", // path the ALB polls to determine container health
    });
  }
}
