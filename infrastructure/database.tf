# RDS PostgreSQL
resource "aws_db_subnet_group" "campstation_db" {
  name       = "campstation-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "campstation-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "campstation_db" {
  identifier             = "campstation-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"  # 프리 티어 사용
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = "campstation"
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.campstation_db.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true

  tags = {
    Name        = "campstation-db"
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "campstation_redis" {
  name       = "campstation-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "campstation-redis-subnet-group"
    Environment = var.environment
  }
}

resource "aws_elasticache_cluster" "campstation_redis" {
  cluster_id           = "campstation-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"  # 프리 티어 사용
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.campstation_redis.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  tags = {
    Name        = "campstation-redis"
    Environment = var.environment
  }
}