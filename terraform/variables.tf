variable "aws_region" {
  description = "AWS region"
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  default     = "docvault"
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

variable "container_image" {
  description = "Docker image URI for the API service"
  default     = "docvault-api:latest"
}
