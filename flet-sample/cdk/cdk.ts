#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecrdeploy from 'cdk-ecr-deployment';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as dotenv from 'dotenv';
dotenv.config();

// 環境変数の取得
const PROJECT_TAG = process.env.PROJECT_TAG ?? "Sandbox";
const BILLING_TAG = process.env.BILLING_TAG ?? "Sandbox";
const CDK_STACK_NAME = process.env.CDK_STACK_NAME ?? "cdkStack";
const ECR_REPOSITORY_NAME = process.env.ECR_REPOSITORY_NAME ?? "cdk_flet_repo";

// CDKのスタックを作成
const app = new cdk.App();
const stack = new cdk.Stack(app, CDK_STACK_NAME, {});

// ECR
const repository = new ecr.Repository(stack, "fletAppRepo", {
  repositoryName: ECR_REPOSITORY_NAME,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});
// Containerイメージ
const image = new DockerImageAsset(stack, "fletAppImage", {
  directory: '../app',
  file: 'Dockerfile',
  platform: Platform.LINUX_AMD64,
});
// ECRにイメージをpush
const tag = 'dev';
const ecrDeploy = new ecrdeploy.ECRDeployment(stack, "fletAppDeploy", {
  src: new ecrdeploy.DockerImageName(image.imageUri),
  dest: new ecrdeploy.DockerImageName(repository.repositoryUri + ':' + tag),
});
// AppRunner
const appRunner = new apprunner.Service(stack, "fletAppRunner", {
  source: apprunner.Source.fromEcr({
    imageConfiguration: {
      port: 8000,
    },
    repository,
    tag,
  }),
});

// AWSリソースにタグを付ける
cdk.Tags.of(stack).add('Project', PROJECT_TAG)
cdk.Tags.of(stack).add('Billing', BILLING_TAG)
