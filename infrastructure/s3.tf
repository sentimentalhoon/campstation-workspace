# S3 버킷
resource "aws_s3_bucket" "campstation_files" {
  bucket = "campstation-files-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "campstation-files"
    Environment = var.environment
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  lower   = true
  upper   = false
  numeric = true
  special = false
}

# S3 버킷 퍼블릭 액세스 차단
resource "aws_s3_bucket_public_access_block" "campstation_files" {
  bucket = aws_s3_bucket.campstation_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 버킷 버전 관리
resource "aws_s3_bucket_versioning" "campstation_files" {
  bucket = aws_s3_bucket.campstation_files.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 버킷 서버 사이드 암호화
resource "aws_s3_bucket_server_side_encryption_configuration" "campstation_files" {
  bucket = aws_s3_bucket.campstation_files.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "campstation" {
  comment = "CampStation CloudFront OAI"
}

# CloudFront 배포 (선택사항 - 정적 파일 최적화)
resource "aws_cloudfront_distribution" "campstation_files" {
  origin {
    domain_name = aws_s3_bucket.campstation_files.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.campstation_files.bucket}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.campstation.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CampStation Files CDN"
  default_root_object = ""

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.campstation_files.bucket}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "campstation-files-cdn"
    Environment = var.environment
  }
}

# S3 버킷 정책 (CloudFront OAI 접근 허용)
resource "aws_s3_bucket_policy" "campstation_files" {
  bucket = aws_s3_bucket.campstation_files.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.campstation.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.campstation_files.arn}/*"
      }
    ]
  })
}