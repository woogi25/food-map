const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");
const indexDao = require("../dao/indexDao");

// 회원가입
exports.createUsers = async function (req, res) {
  const { userID, password, nickname } = req.body;

  // 1. 유저 데이터 검증
  const userIDRegExp = /^[a-z]+[a-z0-9]{5,19}$/; // 아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20
  const passwordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합
  const nicknameRegExp = /^[가-힣|a-z|A-Z|0-9|]{2,10}$/; // 닉네임 정규식 2-10 한글, 숫자 또는 영문

  if (!userIDRegExp.test(userID)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20",
    });
  }

  if (!passwordRegExp.test(password)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "비밀번호 정규식 8-16 문자, 숫자 조합",
    });
  }

  if (!nicknameRegExp.test(nickname)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "닉네임 정규식 2-10 한글, 숫자 또는 영문",
    });
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // 아이디 중복 검사가 필요. 직접 구현해보기.

      // 2. DB 입력
      const [rows] = await indexDao.insertUsers(
        connection,
        userID,
        password,
        nickname
      );

        console.log(rows);

      // 입력된 유저 인덱스
      const userIdx = rows.insertId;

      // 3. JWT 발급
      const token = jwt.sign(
        { userIdx: userIdx, nickname: nickname }, // payload 정의
        secret.jwtsecret // 서버 비밀키
      );

      return res.send({
        result: { jwt: token },
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "회원가입 성공",
      });
    } catch (err) {
      logger.error(`createUsers Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`createUsers DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 로그인
exports.createJwt = async function (req, res) {
  const { userID, password } = req.body;

  if (!userID || !password) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "회원정보를 입력해주세요.",
    });
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // 2. DB 회원 검증
      const [rows] = await indexDao.isValidUsers(connection, userID, password);

      if (rows.length < 1) {
        return res.send({
          isSuccess: false,
          code: 410, // 요청 실패시 400번대 코드
          message: "회원정보가 존재하지 않습니다.",
        });
      }

      const { userIdx, nickname } = rows[0];

      // 3. JWT 발급
      const token = jwt.sign(
        { userIdx: userIdx, nickname: nickname }, // payload 정의
        secret.jwtsecret // 서버 비밀키
      );

      return res.send({
        result: { jwt: token },
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "로그인 성공",
      });
    } catch (err) {
      logger.error(`createJwt Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`createJwt DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 로그인 유지, 토큰 검증
exports.readJwt = async function (req, res) {
  const { userIdx, nickname } = req.verifiedToken;

  return res.send({
    result: { userIdx: userIdx, nickname: nickname },
    code: 200, // 요청 실패시 400번대 코드
    message: "유효한 토큰입니다.",
  });
};

// 식당 조회
exports.readRestaurants = async function (req, res) {
    const { category } = req.query;

    // 카테고리 값이 넘어 왔다면, 유효한 값인지 체크
if (category) {
    const validCategory = [
        "한식",
        "중식",
        "일식",
        "양식",
        "분식",
        "구이",
        "회/초밥",
        "기타"
    ];

    if (!validCategory.includes(category)) {
        return res.send({
            isSuccess: false,
            code: 400, // 요청 실패시 400번대 코드
            message: "유효한 카테고리가 아닙니다.",
        });
    }
}


    try {
            const connection = await pool.getConnection(async (conn) => conn);
            try {
              const [rows] = await indexDao.selectRestaurants(connection, category);
        
              return res.send({
                result: rows,
                isSuccess: true,
                code: 200, // 요청 실패시 400번대 코드
                message: "식당 목록 요청 성공",
              });
            } catch (err) {
              logger.error(`readRestaurants Query error\n: ${JSON.stringify(err)}`);
              return false;
            } finally {
              connection.release();
            }
          } catch (err) {
            logger.error(`readRestaurants DB Connection error\n: ${JSON.stringify(err)}`);
            return false;
          }
};

// //학생 삭제
// exports.deleteStudent = async function (req, res) {
//   const { studentIdx } = req.params;

//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//       const isValidStudentIdx = await indexDao.isValidStudentIdx(connection, studentIdx);
//       if (!isValidStudentIdx) {
//         return res.send({
//           isSuccess: false,
//           code: 410, // 요청 실패시 400번대 코드
//           message: "유효한 학생 인덱스가 아닙니다.",
//         });
//       }

//       const [rows] = await indexDao.deleteStudent(connection,studentIdx);

//       return res.send({
//         isSuccess: true,
//         code: 200, // 요청 실패시 400번대 코드
//         message: "학생 삭제 성공",
//       });
//     } catch (err) {
//       logger.error(`deleteStudent Query error\n: ${JSON.stringify(err)}`);
//       return false;
//     } finally {
//       connection.release();
//     }
//   } catch (err) {
//     logger.error(`deleteStudent DB Connection error\n: ${JSON.stringify(err)}`);
//     return false;
//   }
// };



// // 학생 업데이트
// exports.updateStudents = async function (req, res) {
//   const { studentName, marjor, birth, address } = req.body;
//   const { studentIdx } = req.params;

//   if (studentName && typeof studentName !== "string") {
//     return res.send({
//       isSuccess : false,
//       code: 400, // 요청 실패 시 400번대 코드
//       message: "값을 정확히 입력해주세요.",
//     });
//   }
//   if (marjor && typeof marjor !== "string") {
//     return res.send({
//       isSuccess : false,
//       code: 400, // 요청 실패 시 400번대 코드
//       message: "값을 정확히 입력해주세요.",
//     });
//   }
//   if (address && typeof address !== "string") {
//     return res.send({
//       isSuccess : false,
//       code: 400, // 요청 실패 시 400번대 코드
//       message: "값을 정확히 입력해주세요.",
//     });
//   }
//   // birth : YYYY-MM-DD 형식 검사
//   var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
//   if (birth && !regex.test(birth)) {
//     return res.send({
//       isSuccess : false,
//       code: 400, // 요청 실패 시 400번대 코드
//       message: "날짜 형식을 확인해주세요.",
//     });
//   }


//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//       const isValidStudentIdx = await indexDao.isValidStudentIdx(connection, studentIdx);
//       if (!isValidStudentIdx) {
//         return res.send({
//           isSuccess: false,
//           code: 410, // 요청 실패시 400번대 코드
//           message: "유효한 학생 인덱스가 아닙니다.",
//         });
//       }



//       const [rows] = await indexDao.updateStudents(connection,studentIdx, studentName, marjor, birth, address);
      
//       // console.log(2);
      
//       return res.send({
//         isSuccess: true,
//         code: 200, // 요청 실패시 400번대 코드
//         message: "학생 수정 성공",
//       });
//     } catch (err) {
//       logger.error(`updateStudents Query error\n: ${JSON.stringify(err)}`);
//       return false;
//     } finally {
//       connection.release();
//     }
//   } catch (err) {
//     logger.error(`updateStudents DB Connection error\n: ${JSON.stringify(err)}`);
//     return false;
//   }
// }

// //학생 생성
// exports.createStudent = async function (req, res) {
//   const { studentName, marjor, birth, address } = req.body;

//   // studentName, marjor, address : 문자열
//   if (
//     typeof studentName !== "string" ||
//     typeof marjor !== "string" ||
//     typeof address !== "string"
//   ) {
//     return res.send({
//       isSuccess : false,
//       code: 400, // 요청 실패 시 400번대 코드
//       message: "값을 정확히 입력해주세요.",
//     });
//   }
//   // birth : YYYY-MM-DD 형식 검사
//   var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
//   if (!regex.test(birth)) {
//     return res.send({
//       isSuccess : false,
//       code: 400, // 요청 실패 시 400번대 코드
//       message: "날짜 형식을 확인해주세요.",
//     });
//   }

//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//       const [rows] = await indexDao.insertStudents(connection, studentName, marjor, birth, address);

//       return res.send({
//         result: rows,
//         isSuccess: true,
//         code: 200, // 요청 실패시 400번대 코드
//         message: "요청 성공",
//       });
//     } catch (err) {
//       logger.error(`readStudents Query error\n: ${JSON.stringify(err)}`);
//       return false;
//     } finally {
//       connection.release();
//     }
//   } catch (err) {
//     logger.error(`readStudents DB Connection error\n: ${JSON.stringify(err)}`);
//     return false;
//   }
// };



// // 학생 테이블 조회
// exports.readStudents = async function (rep, res) {
//   //이름 조회
//   const { studentIdx } = rep.params;
  

//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//       const [rows] = await indexDao.selectStudents(connection, studentIdx);

//       return res.send({
//         result: rows,
//         isSuccess: true,
//         code: 200, // 요청 실패시 400번대 코드
//         message: "요청 성공",
//       });
//     } catch (err) {
//       logger.error(`readStudents Query error\n: ${JSON.stringify(err)}`);
//       return false;
//     } finally {
//       connection.release();
//     }
//   } catch (err) {
//     logger.error(`readStudents DB Connection error\n: ${JSON.stringify(err)}`);
//     return false;
//   }
// };

// // 예시 코드
// exports.example = async function (req, res) {
//   // return res.send("dummy get 요청 성공");
//   try {
//     const connection = await pool.getConnection(async (conn) => conn);
//     try {
//       const [rows] = await indexDao.exampleDao(connection);

//       return res.send({
//         result: rows,
//         isSuccess: true,
//         code: 200, // 요청 실패시 400번대 코드
//         message: "요청 성공",
//       });
//     } catch (err) {
//       logger.error(`example Query error\n: ${JSON.stringify(err)}`);
//       return false;
//     } finally {
//       connection.release();
//     }
//   } catch (err) {
//     logger.error(`example DB Connection error\n: ${JSON.stringify(err)}`);
//     return false;
//   }
// };
