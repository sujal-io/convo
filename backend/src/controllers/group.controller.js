import Group from "../models/group.model.js";

export const createGroup = async (req, res) => {
  try {
    // 1. Extract name, members, groupPic from req.body

    const { name, members, groupPic } = req.body;

    // 2. Validate that name is provided

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // 3. Add creator (req.user._id) into members

    const creatorId = req.user._id;

    const uniqueMembers = new Set([...(members || []), creatorId.toString()]);

    const groupMembers = Array.from(uniqueMembers);
    // 4. Upload groupPic to cloudinary if exists

    // 5. Create new group document

    const newGroup = new Group({
      name,
      groupPic,
      admin: creatorId,
      members: groupMembers,
    });

    // 6. Save group to DB

    await newGroup.save();

    // 7. Return group response

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Create group error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {

    // 1️⃣ Get logged-in user id from middleware
    const userId = req.user._id;

    // 2️⃣ Find all groups where this user is present in members array
    const groups = await Group.find({
      members: userId
    });

    // 3️⃣ Send response
    res.status(200).json(groups);

  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
