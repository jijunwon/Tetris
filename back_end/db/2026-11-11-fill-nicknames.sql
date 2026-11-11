-- 일회성 데이터 정리 (2026-11-11)
-- 1. 닉네임이 빈 계정에 아이디 앞 12자를 닉네임으로 넣는다.
-- 2. 그 닉네임을 이미 쓰고 있는 다른 계정은 점수 기록과 함께 삭제한다.
-- 닉네임 비교는 칸의 정렬 규칙(utf8mb4_0900_ai_ci)을 따르므로 대소문자가 달라도 같은 닉네임으로 본다.
--
-- 실행 전 백업: sudo mysqldump --single-transaction tetris > ~/tetris-backup.sql
-- 실행:        sudo mysql tetris < 2026-11-11-fill-nicknames.sql
-- 문 하나라도 실패하면 mysql 클라이언트가 멈추고 COMMIT 전이라 아무것도 바뀌지 않는다.

START TRANSACTION;

CREATE TEMPORARY TABLE nickname_fill AS
SELECT id, username, LEFT(username, 12) AS nickname
FROM users
WHERE nickname IS NULL;

-- 앞 12자가 같은 긴 아이디끼리는 같은 닉네임이 되므로, 그런 경우가 있으면 여기서 중복 키 오류로 멈춘다.
CREATE TEMPORARY TABLE nickname_fill_check (nickname VARCHAR(12) PRIMARY KEY);
INSERT INTO nickname_fill_check (nickname) SELECT nickname FROM nickname_fill;

CREATE TEMPORARY TABLE nickname_victims AS
SELECT u.id, u.username, u.nickname
FROM users u
JOIN nickname_fill f ON u.nickname = f.nickname;

SELECT 'delete' AS action, v.id, v.username, v.nickname,
       (SELECT COUNT(*) FROM score s WHERE s.user_id = v.id) AS scores
FROM nickname_victims v;

SELECT 'fill' AS action, id, username, nickname FROM nickname_fill;

DELETE s FROM score s JOIN nickname_victims v ON s.user_id = v.id;
DELETE u FROM users u JOIN nickname_victims v ON u.id = v.id;
UPDATE users u JOIN nickname_fill f ON u.id = f.id SET u.nickname = f.nickname;

COMMIT;

-- 정리 후에도 닉네임이 겹치는 계정이 남아 있으면 보여 준다 (있으면 unique 조건 추가가 실패한다).
SELECT 'remaining_duplicate' AS action, nickname, COUNT(*) AS accounts
FROM users
WHERE nickname IS NOT NULL
GROUP BY nickname
HAVING COUNT(*) > 1;
