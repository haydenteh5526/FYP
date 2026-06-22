terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "networking" {
  source = "./modules/networking"
  project_name = var.project_name
}

module "database" {
  source           = "./modules/database"
  project_name     = var.project_name
  vpc_id           = module.networking.vpc_id
  private_subnets  = module.networking.private_subnets
  db_password      = var.db_password
}

module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
}

module "auth" {
  source       = "./modules/auth"
  project_name = var.project_name
}

module "compute" {
  source          = "./modules/compute"
  project_name    = var.project_name
  vpc_id          = module.networking.vpc_id
  public_subnets  = module.networking.public_subnets
  private_subnets = module.networking.private_subnets
  db_endpoint     = module.database.endpoint
  db_password     = var.db_password
  s3_bucket       = module.storage.bucket_name
  container_image = var.container_image
}
