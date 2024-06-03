const jwt = require("jsonwebtoken");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const dotenv = require("dotenv");
dotenv.config();

const addToCart = (req, res) => {
  const { book_id, quantity } = req.body;

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인하세요.",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    let sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?,?,?)`;
    let values = [book_id, quantity, authorization.id];
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      return res.status(StatusCodes.OK).json(results);
    });
  }
};

const getCartItems = (req, res) => {
  const { selected } = req.body;

  let authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "로그인 세션이 만료되었습니다. 다시 로그인하세요.",
    });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "잘못된 토큰입니다.",
    });
  } else {
    let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price 
    FROM cartItems LEFT JOIN books 
    ON cartItems.book_id = books.id
    WHERE user_id = ? AND cartItems.id IN (?)`;
    conn.query(sql, [authorization.id, selected], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      return res.status(StatusCodes.OK).json(results);
    });
  }
};

const removeCartItem = (req, res) => {
  const cartItemId = req.params.id;

  let sql = `DELETE FROM cartItems WHERE id = ?`;
  conn.query(sql, cartItemId, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.OK).json(results);
  });
};

function ensureAuthorization(req, res) {
  try {
    let receivedJwt = req.headers["authorization"];
    console.log(receivedJwt);

    let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
    console.log(decodedJwt);

    return decodedJwt;
  } catch (err) {
    console.log(err.name);
    console.log(err.message);

    return err;
  }
}

module.exports = { addToCart, getCartItems, removeCartItem };
