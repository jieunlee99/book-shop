const express = require("express");
const router = express.Router();
const conn = require("../mariadb");

const {
  allBooks,
  bookDetail,
  booksByCategory,
} = require("../controller/BookController");

router.use(express.json());

router.get("/", allBooks); // 전체 도서 조회 & 카테고리별 도서 조회
router.get("/:id", bookDetail); // 개별 도서 조회

module.exports = router;
