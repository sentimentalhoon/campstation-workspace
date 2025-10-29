# ECR 리포지토리
resource "aws_ecr_repository" "frontend" {
  name                 = "campstation-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "campstation-frontend"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "backend" {
  name                 = "campstation-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "campstation-backend"
    Environment = var.environment
  }
}

# ECS 클러스터
resource "aws_ecs_cluster" "campstation" {
  name = "campstation-cluster"

  tags = {
    Name        = "campstation-cluster"
    Environment = var.environment
  }
}

resource "aws_ecs_cluster_capacity_providers" "campstation" {
  cluster_name       = aws_ecs_cluster.campstation.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# IAM 역할
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "campstation-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "campstation-ecs-task-execution-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# CloudWatch 로그 그룹
resource "aws_cloudwatch_log_group" "campstation_frontend" {
  name              = "/ecs/campstation-frontend"
  retention_in_days = 30

  tags = {
    Name        = "campstation-frontend-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "campstation_backend" {
  name              = "/ecs/campstation-backend"
  retention_in_days = 30

  tags = {
    Name        = "campstation-backend-logs"
    Environment = var.environment
  }
}