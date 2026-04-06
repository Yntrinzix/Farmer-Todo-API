import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createTodo, getTodos, getTodoById, updateTodo, deleteTodo, getRoute } from "../controllers/todoController";

const router = Router();

router.use(authenticate);

router.post("/", createTodo);
router.get("/", getTodos);
router.get("/route", getRoute);
router.get("/:id", getTodoById);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
