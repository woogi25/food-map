const jwt = require("jsonwebtoken");

const secret = "this is my secret";

const token = jwt.sign(
        { userIdx: 100, nickname: "김철수" }, // payload 정의
        secret // 서버 비밀키
      );

console.log(token);

const verifiedToken = jwt.verify(eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWR4IjoxMDAsIm5pY2tuYW1lIjoi6rmA7Lg7IiYIiwiaWF0IjoxNjY5MDgzMDYwfQ.ORj22zlzIdsIUZKPumPVLIWdz0SpCMDqEg6tsNrB9eA, secret);

console.log(verifiedToken)