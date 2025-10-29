output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.campstation.dns_name
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_lb.campstation.dns_name}"
}

output "backend_url" {
  description = "Backend application URL"
  value       = "http://${aws_lb.campstation.dns_name}:8080"
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.campstation_db.endpoint
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_cluster.campstation_redis.cache_nodes[0].address
}

output "s3_bucket_name" {
  description = "S3 bucket for file storage"
  value       = aws_s3_bucket.campstation_files.bucket
}

# CloudFront output - 주석 처리 (계정 검증 후 활성화)
# output "cloudfront_distribution_url" {
#   description = "CloudFront distribution URL"
#   value       = aws_cloudfront_distribution.campstation_files.domain_name
# }

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.campstation.name
}

output "ecr_frontend_repository_url" {
  description = "ECR frontend repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_repository_url" {
  description = "ECR backend repository URL"
  value       = aws_ecr_repository.backend.repository_url
}