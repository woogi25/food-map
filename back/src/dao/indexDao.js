const { pool } = require("../../config/database");

// 회원가입
exports.insertUsers = async function (connection, userID, password, nickname) {
  const Query = `insert into Users(userID, password, nickname) values (?,?,?);`;
  const Params = [userID, password, nickname];

  const rows = await connection.query(Query, Params);

  return rows;
};

// 로그인 (회원검증)
exports.isValidUsers = async function (connection, userID, password) {
  const Query = `SELECT userIdx, nickname FROM Users where userID = ? and password = ? and status = 'A';`;
  const Params = [userID, password];

  const rows = await connection.query(Query, Params);

  return rows;
};


exports.selectRestaurants = async function (connection,category) {
  const selectAllRestaurantsQuery = `select title, address, category, videoUrl 
  from Restaurants where status = 'A';`;

  const selectCategorizedRestaurantsQuery = `select title, address, category, videoUrl 
  from FoodMap.Restaurants where status = 'A' and category = ?;`

  const Params = [category];

  const Query = category ? selectCategorizedRestaurantsQuery : selectAllRestaurantsQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};

// exports.deleteStudent = async function (connection,studentIdx) {
//   const Query = `update Enrolment.Students set status = "D" where studentIdx = ?;`;
//   const Params = [studentIdx];

//   const rows = await connection.query(Query, Params);

//   return rows;
// };

// exports.updateStudents = async function (connection,studentIdx, studentName, marjor, birth, address) {
//   const Query = `update Enrolment.Students set studentName = ifnull(?,studentName), 
//   marjor = ifnull(?,marjor), birth = ifnull(?,birth), address = ifnull(?,address) where studentIdx = ?;`;
//   const Params = [studentName, marjor, birth, address, studentIdx];

//   const rows = await connection.query(Query, Params);

//   return rows;
// };


// exports.isValidStudentIdx = async function (connection, studentIdx) {
//   const Query = `SELECT * FROM Enrolment.Students where studentIdx = ? and status = 'A';`;    
//   const Params = [studentIdx];   

//   const [rows] = await connection.query(Query, Params);

//   if (rows < 1) {
//     return false
//   }

//   return true;
// };


// exports.insertStudents = async function (connection, studentName, marjor, birth, address) {
//   const Query = `insert into Enrolment.Students(studentName, marjor, birth, address) values(?, ?, ?, ?);`;
//   const Params = [studentName, marjor, birth, address];

//   const rows = await connection.query(Query, Params);

//   return rows;
// };


// exports.selectStudents = async function (connection, studentIdx) {
//   const Query = `SELECT * FROM Enrolment.Students where studentIdx = ?;`;
//   const Params = [studentIdx];

//   const rows = await connection.query(Query, Params);

//   return rows;
// };

// exports.exampleDao = async function (connection) {
//   const Query = `SELECT * FROM Students;`;
//   const Params = [];

//   const rows = await connection.query(Query, Params);

//   return rows;
// };
