11:08
가상 면접 사례로 배우는 대규모 시스템 설계 기초
— System Design

데이터베이스

사용자가 늘면 서버 하나로는 충분하지 않아서 여러 서버를 두어야 한다. 하나는 웹/모바일 트래픽 처리 용도고, 다른 하나는 데이터베이스용이다(그림 1-3). 웹/모바일 트래픽 처리 서버(웹 계층)와 데이터베이스 서버(데이터 계층)를 분리하면 그 각각을 독립적으로 확장해 나갈 수 있게 된다.

사용자 단말
웹 브라우저
모바일 앱
api.mysite.com
IP 주소
www.mysite.com
api.mysite.com
웹 서버
read/write/update
데이터 반환
DB
데이터베이스
그림 1-3

어떤 데이터베이스를 사용할 것인가?

전통적인 관계형 데이터베이스(relational database)와 비-관계형 데이터베이스 사이에서 고를 수 있다. 그 차이를 알아보자.

관계형 데이터베이스는 관계형 데이터베이스 관리 시스템(Relational Database Management System, RDBMS)이라고도 부른다. RDBMS 가운데 가장 유명한 것으로는 MySQL, 오라클 데이터베이스, PostgreSQL 등이 있다. 관계형 데이터베이스는 자료를 테이블과 열, 칼럼으로 표현한다. SQL을 사용하면 여러 테이블에 있는 데이터를 그 관계에 따라 조인(join)하여 합칠 수 있다.

비 관계형 데이터베이스는 NoSQL이라고도 부른다. 대표적인 것으로는 CouchDB, Neo4j, Cassandra, HBase, Amazon DynamoDB 등이 있다.[2] NoSQL은 다시 네 부류로 나눌 수 있는데, 키-값 저장소(key-value store), 그래프 저

4
1장 사용자 수에 따른 규모 확장성

17 / 321
듣기
목차
독서노트
보기설정
화면설정
