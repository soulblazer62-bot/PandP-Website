import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import queriesRouter from "./queries";
import documentsRouter from "./documents";
import statsRouter from "./stats";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/queries", queriesRouter);
router.use("/documents", documentsRouter);
router.use("/stats", statsRouter);
router.use("/contact", contactRouter);

export default router;
