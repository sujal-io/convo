import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { createGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.use(arcjetProtection,protectRoute);

router.post("/create", createGroup);

// router.get("/groups", getUserGroups);

// router.post("/add-members", addMembersToGroup);

// router.post("/remove-members", removeMembersFromGroup);

export default router;