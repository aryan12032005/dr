const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect, isAdminOrFaculty, isActive } = require('../middleware/auth');

// Get groups
router.get('/get_groups', protect, isActive, async (req, res) => {
  try {
    const { group_id } = req.query;
    const user = req.user;

    if (group_id) {
      const groupDetails = await Group.findById(group_id);
      if (groupDetails) {
        return res.json({
          group_details: {
            id: groupDetails._id.toString(),
            group_name: groupDetails.group_name,
            owner: groupDetails.owner,
            members: groupDetails.members,
            documents: groupDetails.documents
          }
        });
      }
      return res.status(400).json({ message: 'No groups found' });
    }

    if (user.is_faculty) {
      const groups = await Group.find({ owner: user._id });
      if (groups.length > 0) {
        const formattedGroups = groups.map(grp => ({
          id: grp._id.toString(),
          group_name: grp.group_name,
          owner: grp.owner,
          members: grp.members,
          documents: grp.documents
        }));
        return res.json({ groups: formattedGroups });
      }
      return res.json({ groups: [] });
    }

    res.json({ groups: [] });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error fetching groups' });
  }
});

// Create group
router.post('/create_group', protect, isAdminOrFaculty, isActive, async (req, res) => {
  try {
    const user = req.user;
    const groupDetails = req.body;

    if (!groupDetails) {
      return res.status(400).json({ message: 'No group to be added' });
    }

    groupDetails.owner = user._id;
    const newGroup = await Group.create(groupDetails);
    const groupId = newGroup._id.toString();

    // Update members' groups array
    for (const member of groupDetails.members || []) {
      try {
        const memberUser = await User.findOne({ username: member.username });
        if (memberUser) {
          memberUser.groups.push(groupId);
          await memberUser.save();
        }
      } catch (err) {
        console.error('Error adding member:', err);
      }
    }

    res.json({ message: 'Group created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating group' });
  }
});

// Edit group
router.put('/edit_group', protect, isAdminOrFaculty, isActive, async (req, res) => {
  try {
    const { group_id } = req.query;
    const data = req.body;

    if (!group_id) {
      return res.status(400).json({ message: 'Please provide group Id' });
    }

    const existingGroup = await Group.findById(group_id);
    if (!existingGroup) {
      return res.status(400).json({ message: 'Group not found' });
    }

    const existingMembers = existingGroup.members || [];
    const newMembers = data.members || [];

    // Find deleted and added members
    const existingIds = new Set(existingMembers.map(m => m.id?.toString()));
    const newIds = new Set(newMembers.map(m => m.id?.toString()));

    const deletedMembers = existingMembers.filter(m => !newIds.has(m.id?.toString()));
    const addedMembers = newMembers.filter(m => !existingIds.has(m.id?.toString()));

    // Update group
    await Group.findByIdAndUpdate(group_id, data);

    // Add group to new members
    for (const member of addedMembers) {
      try {
        const memberUser = await User.findById(member.id);
        if (memberUser) {
          memberUser.groups.push(group_id);
          await memberUser.save();
        }
      } catch (err) {
        console.error('Error adding member:', err);
      }
    }

    // Remove group from deleted members
    for (const member of deletedMembers) {
      try {
        const memberUser = await User.findById(member.id);
        if (memberUser && memberUser.groups.includes(group_id)) {
          memberUser.groups = memberUser.groups.filter(g => g !== group_id);
          await memberUser.save();
        }
      } catch (err) {
        console.error('Error removing member:', err);
      }
    }

    res.json({ message: 'Group edited successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating group' });
  }
});

// Delete group
router.delete('/delete_group', protect, isAdminOrFaculty, isActive, async (req, res) => {
  try {
    const { group_id } = req.query;

    if (!group_id) {
      return res.status(400).json({ message: 'Please provide group id' });
    }

    const existingGroup = await Group.findById(group_id);
    if (!existingGroup) {
      return res.status(400).json({ message: 'Group not found' });
    }

    // Remove group from all members
    for (const member of existingGroup.members || []) {
      try {
        const memberUser = await User.findOne({ username: member.username });
        if (memberUser && memberUser.groups.includes(group_id)) {
          memberUser.groups = memberUser.groups.filter(g => g !== group_id);
          await memberUser.save();
        }
      } catch (err) {
        console.error('Error removing member from group:', err);
      }
    }

    await Group.findByIdAndDelete(group_id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting group' });
  }
});

// Search group documents
router.get('/search_group_documents', protect, isActive, async (req, res) => {
  try {
    const { group_id, query } = req.query;

    if (!group_id || !query) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const group = await Group.findById(group_id);
    if (!group) {
      return res.status(400).json({ message: 'Group not found' });
    }

    // Filter documents by query
    const documents = group.documents.filter(doc => 
      doc.title && doc.title.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ documents });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'No documents found' });
  }
});

// Add documents to group
router.post('/add_group_documents', protect, isAdminOrFaculty, isActive, async (req, res) => {
  try {
    const { group_id } = req.query;
    const documents = req.body;
    const user = req.user;

    if (!group_id) {
      return res.status(400).json({ message: 'Please provide group id' });
    }

    const existingGroup = await Group.findById(group_id);
    if (!existingGroup) {
      return res.status(400).json({ message: 'Group not found' });
    }

    const isOwner = existingGroup.owner && existingGroup.owner.toString() === user._id.toString();
    if (!user.is_admin && !isOwner) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const existingDocs = (existingGroup.documents || []).map(d => d.id);
    const newDocs = documents.map(d => d.id);

    // Keep existing docs that are still in new list
    existingGroup.documents = existingGroup.documents.filter(d => newDocs.includes(d.id));

    // Add new documents
    for (const doc of documents) {
      if (!existingDocs.includes(doc.id)) {
        existingGroup.documents.push(doc);
      }
    }

    await existingGroup.save();
    res.json({ message: 'Documents added' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error adding documents' });
  }
});

// Get member groups
router.get('/get_member_group', protect, isActive, async (req, res) => {
  try {
    const { query } = req.query;
    const user = req.user;

    const userDoc = await User.findById(user._id).select('groups');
    const myGroups = userDoc?.groups || [];

    if (query) {
      const groups = await Promise.all(
        myGroups.map(async (groupId) => {
          try {
            const group = await Group.findById(groupId);
            return group;
          } catch {
            return null;
          }
        })
      );

      const validGroups = groups.filter(g => g !== null);
      const matches = validGroups
        .map(g => ({
          id: g._id.toString(),
          similarity: g.group_name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
        }))
        .filter(m => m.similarity > 0)
        .map(m => m.id);

      return res.json({ groups: matches });
    }

    res.json({ groups: myGroups });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'No groups found' });
  }
});

// Leave group
router.delete('/leave-group', protect, isActive, async (req, res) => {
  try {
    const { group_id } = req.query;
    const user = req.user;

    const existingGroup = await Group.findById(group_id);
    if (!existingGroup) {
      return res.status(400).json({ message: 'Group not found' });
    }

    // Find and remove user from group members
    const memberIndex = existingGroup.members.findIndex(m => m.id === user._id);
    if (memberIndex > -1) {
      existingGroup.members.splice(memberIndex, 1);
      await existingGroup.save();

      // Remove group from user's groups
      const currentUser = await User.findById(user._id);
      if (currentUser && currentUser.groups.includes(group_id)) {
        currentUser.groups = currentUser.groups.filter(g => g !== group_id);
        await currentUser.save();
      }

      return res.json({ message: 'Group left successfully' });
    }

    res.status(400).json({ message: 'Error leaving group' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error leaving group' });
  }
});

// Admin: Get all groups
router.get('/admin_get_all_groups', protect, isActive, async (req, res) => {
  try {
    const user = req.user;
    if (!user.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { query } = req.query;
    let groups;

    if (query) {
      groups = await Group.find({
        group_name: { $regex: query, $options: 'i' }
      });
    } else {
      groups = await Group.find({});
    }

    // Get owner details for each group
    const formattedGroups = await Promise.all(groups.map(async (grp) => {
      let ownerName = 'Unknown';
      if (grp.owner) {
        const owner = await User.findById(grp.owner).select('first_name last_name email');
        if (owner) {
          ownerName = `${owner.first_name} ${owner.last_name}`;
        }
      }
      return {
        id: grp._id.toString(),
        group_name: grp.group_name,
        owner: grp.owner,
        ownerName: ownerName,
        members: grp.members || [],
        documents: grp.documents || [],
        createdAt: grp.createdAt
      };
    }));

    res.json({ groups: formattedGroups, total: formattedGroups.length });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error fetching groups' });
  }
});

// Admin: Disband (delete) any group
router.delete('/admin_disband_group', protect, isActive, async (req, res) => {
  try {
    const user = req.user;
    if (!user.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { group_id } = req.query;
    if (!group_id) {
      return res.status(400).json({ message: 'Please provide group id' });
    }

    const existingGroup = await Group.findById(group_id);
    if (!existingGroup) {
      return res.status(400).json({ message: 'Group not found' });
    }

    // Remove group from all members
    for (const member of existingGroup.members || []) {
      try {
        const memberUser = await User.findOne({ username: member.username });
        if (memberUser && memberUser.groups.includes(group_id)) {
          memberUser.groups = memberUser.groups.filter(g => g !== group_id);
          await memberUser.save();
        }
      } catch (err) {
        console.error('Error removing member from group:', err);
      }
    }

    await Group.findByIdAndDelete(group_id);
    res.json({ message: 'Group disbanded successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error disbanding group' });
  }
});

// Admin: Remove member from any group
router.delete('/admin_remove_group_member', protect, isActive, async (req, res) => {
  try {
    const user = req.user;
    if (!user.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { group_id, member_id } = req.query;
    if (!group_id || !member_id) {
      return res.status(400).json({ message: 'Please provide group_id and member_id' });
    }

    const existingGroup = await Group.findById(group_id);
    if (!existingGroup) {
      return res.status(400).json({ message: 'Group not found' });
    }

    // Find and remove member
    existingGroup.members = existingGroup.members.filter(m => m.id !== member_id);
    await existingGroup.save();

    // Remove group from user's groups array
    const memberUser = await User.findById(member_id);
    if (memberUser && memberUser.groups.includes(group_id)) {
      memberUser.groups = memberUser.groups.filter(g => g !== group_id);
      await memberUser.save();
    }

    res.json({ message: 'Member removed from group' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error removing member' });
  }
});

module.exports = router;
