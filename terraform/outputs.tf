output "api_url" {
  value = module.compute.api_url
}

output "s3_bucket" {
  value = module.storage.bucket_name
}

output "db_endpoint" {
  value     = module.database.endpoint
  sensitive = true
}
