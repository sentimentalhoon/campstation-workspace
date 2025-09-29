# MariaDB 설치 및 설정 가이드

## 1. MariaDB 설치 (Windows)

### 방법 1: 공식 설치 프로그램 사용
1. [MariaDB 공식 사이트](https://mariadb.org/download/)에서 Windows용 설치 프로그램 다운로드
2. 설치 프로그램 실행
3. 설치 중 root 비밀번호 설정 (예: `campstation2024`)

### 방법 2: Chocolatey 사용 (관리자 권한 PowerShell)
```powershell
choco install mariadb
```

### 방법 3: winget 사용
```powershell
winget install MariaDB.Server
```

## 2. 데이터베이스 및 사용자 생성

MariaDB가 설치되면 MySQL 클라이언트로 접속:

```bash
mysql -u root -p
```

다음 SQL 명령어들을 실행:

```sql
-- 데이터베이스 생성
CREATE DATABASE campstation 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 부여
CREATE USER 'campstation'@'localhost' IDENTIFIED BY 'campstation2024';
GRANT ALL PRIVILEGES ON campstation.* TO 'campstation'@'localhost';

-- 원격 접속을 위한 사용자 (필요시)
CREATE USER 'campstation'@'%' IDENTIFIED BY 'campstation2024';
GRANT ALL PRIVILEGES ON campstation.* TO 'campstation'@'%';

-- 권한 적용
FLUSH PRIVILEGES;

-- 데이터베이스 선택 및 확인
USE campstation;
SHOW TABLES;
```

## 3. MariaDB 서비스 확인

### Windows 서비스 확인
```powershell
# 서비스 상태 확인
Get-Service -Name MySQL

# 서비스 시작
Start-Service -Name MySQL

# 서비스 중지
Stop-Service -Name MySQL
```

### 포트 확인 (기본: 3306)
```powershell
netstat -an | findstr :3306
```

## 4. 연결 테스트

다음 명령어로 연결 테스트:

```bash
mysql -u campstation -p campstation
```

## 5. 설정 파일 위치

MariaDB 설정 파일 위치:
- Windows: `C:\Program Files\MariaDB 10.x\data\my.ini`

주요 설정:
```ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
```

## 6. 문제 해결

### 포트 충돌 시
1. MySQL/MariaDB가 이미 실행 중인지 확인
2. 다른 포트 사용 (application.properties에서 URL 수정)

### 연결 오류 시
1. MariaDB 서비스가 실행 중인지 확인
2. 방화벽 설정 확인
3. 사용자 권한 확인

## 7. 백엔드 실행

MariaDB 설정 완료 후 백엔드 실행:

```bash
cd backend
./gradlew bootRun
```

성공하면 다음과 같은 로그를 확인할 수 있습니다:
- HikariPool 연결 성공
- Hibernate 테이블 생성
- 샘플 데이터 로드