const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const DocumentDeleteRequest = require('../models/DocumentDeleteRequest');
const FacultyDocumentRequest = require('../models/FacultyDocumentRequest');
const PendingDocumentUpload = require('../models/PendingDocumentUpload');
const { protect, isAdmin, isAdminOrFaculty, isActive } = require('../middleware/auth');
const CloudinaryFileHandler = require('../utils/cloudinaryFileHandler');

const upload = multer({ storage: multer.memoryStorage() });

const fileHandler = new CloudinaryFileHandler();

// Search documents
router.get('/search_document', async (req, res) => {
  try {
    const { querry, docType, department, category, order, start_c, end_c } = req.query;
    
    let filter = {};
    
    if (docType) filter.docType = docType;
    if (department) filter.department = department;
    if (category) filter.category = category;

    let searchQuery;
    if (querry && querry.trim()) {
      filter.$text = { $search: querry };
      searchQuery = Document.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
    } else {
      searchQuery = Document.find(filter);
    }

    if (order && order !== '0') {
      searchQuery = searchQuery.sort({ createDate: parseInt(order) });
    }

    const startIndex = parseInt(start_c) || 0;
    const endIndex = parseInt(end_c) || 50;
    const results = await searchQuery.skip(startIndex).limit(endIndex - startIndex);

    if (results.length > 0) {
      const documents = results.map(doc => ({
        id: doc._id.toString(),
        title: doc.title || '',
        docType: doc.docType || '',
        owner: doc.owner || '',
        category: doc.category || '',
        department: doc.department || '',
        authors: doc.authors || '',
        isPublic: doc.isPublic || 'true',
        createDate: doc.createDate ? new Date(doc.createDate).toISOString().split('T')[0] : '',
        date: doc.createDate ? new Date(doc.createDate).toISOString().split('T')[0] : ''
      }));
      return res.json({ documents });
    }

    res.status(404).json({ message: 'No document found', documents: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document details
router.get('/get_document', async (req, res) => {
  try {
    const { doc_id } = req.query;

    const doc = await Document.findById(doc_id);
    if (!doc) {
      return res.status(400).json({ message: 'Error fetching document' });
    }

    const document = {
      id: doc._id.toString(),
      title: doc.title || '',
      docType: doc.docType || '',
      comments: doc.comments || [],
      category: doc.category || '',
      department: doc.department || '',
      authors: doc.authors || '',
      accessionNumber: doc.accessionNumber || '',
      subject: doc.subject || '',
      createDate: doc.createDate ? new Date(doc.createDate).toISOString().split('T')[0] : '',
      coverType: doc.coverType || '',
      isPublic: doc.isPublic
    };

    if (doc.coverType === 'link') {
      document.coverLink = doc.coverLink || '';
    } else {
      const coverFile = await fileHandler.getCover(doc.category, doc._id.toString());
      document.cover = coverFile;
    }

    res.json({ document });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error fetching document' });
  }
});

// Update document
router.post('/update_document', protect, isAdminOrFaculty, isActive, upload.any(), async (req, res) => {
  try {
    const { doc_id } = req.query;
    const data = req.body;
    const user = req.user;

    const existingDoc = await Document.findById(doc_id);
    if (!existingDoc) {
      return res.status(400).json({ message: 'Document not found' });
    }

    const isOwner = existingDoc.owner && existingDoc.owner.toString() === user._id.toString();
    if (!isOwner && !user.is_admin) {
      return res.status(400).json({ message: 'Document does not belong to user' });
    }

    const newData = {
      coverType: data.coverType,
      isPublic: data.isPublic,
      title: data.title
    };

    if (existingDoc.isPublic !== data.isPublic) {
      newData.allowed_users = [];
    }

    if (data.coverType === 'link') {
      newData.coverLink = data.coverLink;
      if (existingDoc.coverType !== 'link') {
        await fileHandler.deleteFiles(existingDoc.category, doc_id, 'cover');
      }
    } else {
      const coverFiles = req.files.filter(f => f.fieldname === 'cover');
      if (coverFiles.length > 0) {
        const coverResult = await fileHandler.updateFile(existingDoc.category, doc_id, 'cover', coverFiles);
        if (coverResult) {
          newData.cover_path = JSON.stringify(coverResult);
        }
      }
    }

    await Document.findByIdAndUpdate(doc_id, newData);
    res.json({ message: 'Updated document' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Cannot update document' });
  }
});

// Upload document
router.post('/upload_document', protect, isAdminOrFaculty, isActive, upload.any(), async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const userData = {
      title: data.title,
      docType: data.documentType,
      coverType: data.coverType,
      isPublic: data.isPublic,
      owner: user._id,
      comments: [],
      allowed_users: [],
      createDate: new Date().toISOString(),
      category: data.category,
      department: data.department,
      subject: data.subject,
      authors: data.authors,
      accessionNumber: data.accessionNumber
    };

    if (data.coverType === 'link') {
      userData.coverLink = data.coverLink;
    }
    if (data.documentType === 'link') {
      userData.documentLink = data.documentLink;
    }

    // Check for existing document with same Accession Number
    if (data.accessionNumber) {
      const existingAccession = await Document.findOne({ accessionNumber: data.accessionNumber });
      if (existingAccession) {
        return res.status(409).json({ message: 'Document with Accession Number already exists' });
      }
    }

    // Check for existing document with same title and author
    const existingDoc = await Document.findOne({ title: data.title, authors: data.authors });
    if (existingDoc) {
      return res.status(409).json({ message: 'Document already exists' });
    }

    const newDoc = await Document.create(userData);
    const docId = newDoc._id.toString();

    let coverPath = '';
    let documentPath = '';

    if (data.coverType !== 'link') {
      const coverFiles = req.files.filter(f => f.fieldname === 'cover');
      if (coverFiles.length > 0) {
        coverPath = await fileHandler.createFile(data.category, docId, 'cover', coverFiles);
        if (!coverPath) {
          await Document.findByIdAndDelete(docId);
          return res.status(400).json({ message: 'Cannot upload Cover file' });
        }
      }
    }

    if (data.documentType !== 'link') {
      const docFiles = req.files.filter(f => f.fieldname === 'documents');
      if (docFiles.length > 0) {
        documentPath = await fileHandler.createFile(data.category, docId, 'document', docFiles);
        if (!documentPath) {
          await Document.findByIdAndDelete(docId);
          return res.status(400).json({ message: 'Cannot upload Document file' });
        }
      }
    }

    if (coverPath || documentPath) {
      await Document.findByIdAndUpdate(docId, { cover_path: coverPath ? JSON.stringify(coverPath) : '', document_path: documentPath ? JSON.stringify(documentPath) : '' });
    }

    res.json({ message: 'Docs uploaded' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error uploading doc' });
  }
});

// Get faculty documents
router.get('/get_faculty_doc', protect, isAdminOrFaculty, async (req, res) => {
  try {
    const { fac_id } = req.query;
    const user = req.user;

    if (fac_id != user._id.toString() && !user.is_admin) {
      return res.status(400).json({ message: 'Faculty id not match' });
    }

    const results = await Document.find({ owner: fac_id });

    if (results.length > 0) {
      const documents = results.map(doc => ({
        id: doc._id.toString(),
        title: doc.title || '',
        docType: doc.docType || '',
        comments: doc.comments || [],
        category: doc.category || '',
        department: doc.department || '',
        subject: doc.subject || '',
        createDate: doc.createDate ? new Date(doc.createDate).toISOString().split('T')[0] : '',
        isPublic: doc.isPublic || 'true',
        authors: doc.authors || ''
      }));
      return res.json({ documents });
    }

    res.status(404).json({ message: 'No documents found', documents: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download document - allows public documents without login
router.get('/download_doc', async (req, res) => {
  try {
    const { doc_id } = req.query;

    const document = await Document.findById(doc_id);
    if (!document) {
      return res.status(400).json({ message: 'No document found' });
    }

    // Check if document is public - allow download without auth
    const isPublicDoc = document.isPublic === 'true' || document.isPublic === true;
    
    // If document is private, require authentication
    if (!isPublicDoc) {
      // Try to get user from token
      let user = null;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
          user = await require('../models/User').findById(decoded.id);
        } catch (err) {
          return res.status(401).json({ message: 'Please login to download private documents' });
        }
      } else {
        return res.status(401).json({ message: 'Please login to download private documents' });
      }

      if (!user || !user.is_allowed) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const isOwner = document.owner && document.owner.toString() === user._id.toString();
      const isInAllowedUsers = document.allowed_users && document.allowed_users.some(u => u.toString() === user._id.toString());
      const isAllowed = user.is_admin || isOwner || isInAllowedUsers;

      if (!isAllowed) {
        return res.status(400).json({ message: 'Document is private' });
      }
    }

    if (document.docType === 'link') {
      return res.json({ message: `Doc link : ${document.documentLink}`, link: true });
    }

    const { file, success } = await fileHandler.getZip(document.category, doc_id);
    if (success && file) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${document.title}.zip"`);
      return res.send(file);
    }

    res.status(400).json({ message: 'Error downloading file' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error downloading document' });
  }
});

// Delete document
router.delete('/delete_document', protect, isAdminOrFaculty, isActive, async (req, res) => {
  try {
    const { doc_id } = req.query;
    const { reason } = req.body;
    const user = req.user;

    const document = await Document.findById(doc_id);
    if (!document) {
      return res.status(400).json({ message: 'No document to delete' });
    }

    const isOwner = document.owner && document.owner.toString() === user._id.toString();

    if (user.is_admin) {
      // Admin can delete directly
      if (document.docType !== 'link' || document.coverType !== 'link') {
        await fileHandler.deleteFiles(document.category, doc_id);
      }
      await Document.findByIdAndDelete(doc_id);
      return res.json({ message: 'Document deleted successfully' });
    } else if (isOwner) {
      // Owner creates delete request
      await DocumentDeleteRequest.create({
        doc_id,
        fac_id: document.owner,
        reason: reason || 'No reason provided'
      });
      return res.json({ message: 'Delete document requested' });
    }

    res.status(401).json({ message: 'Unauthorized access' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting document' });
  }
});

// Get delete requests (Admin only)
router.get('/get_delete_requests', protect, isAdmin, async (req, res) => {
  try {
    const requests = await DocumentDeleteRequest.find();
    res.json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve document delete (Admin only)
router.put('/approve_document_delete', protect, isAdmin, async (req, res) => {
  try {
    const { doc_id } = req.body;

    if (!doc_id) {
      return res.status(400).json({ message: 'Bad arguments' });
    }

    const document = await Document.findById(doc_id);
    if (!document) {
      return res.status(400).json({ message: 'No document to delete' });
    }

    if (document.docType !== 'link' || document.coverType !== 'link') {
      await fileHandler.deleteFiles(document.category, doc_id);
    }

    await Document.findByIdAndDelete(doc_id);
    await DocumentDeleteRequest.findOneAndDelete({ doc_id });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting document' });
  }
});

// Reject document delete (Admin only)
router.delete('/reject_document_delete', protect, isAdmin, async (req, res) => {
  try {
    const { doc_id } = req.query;

    const deleteRequest = await DocumentDeleteRequest.findOneAndDelete({ doc_id });
    if (deleteRequest) {
      return res.json({ message: 'Request deleted successfully' });
    }

    res.status(400).json({ message: 'No document to delete' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting request' });
  }
});

// Get requests for private documents
router.get('/get_requests', protect, isActive, async (req, res) => {
  try {
    const { requester_id, fac_id } = req.query;
    const user = req.user;

    if (requester_id) {
      if (user._id.toString() !== requester_id) {
        return res.status(400).json({ message: 'Invalid request' });
      }
      const requests = await FacultyDocumentRequest.find({ requester_id: parseInt(requester_id) });
      const responseObj = requests.map(r => r.doc_id);
      return res.json({ requests: responseObj });
    }

    if (fac_id) {
      if (user._id.toString() !== fac_id && !user.is_admin) {
        return res.status(400).json({ message: 'Invalid request' });
      }
      const requests = await FacultyDocumentRequest.find({ fac_id: parseInt(fac_id) });
      return res.json({ requests });
    }

    res.status(400).json({ message: 'Invalid request' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request access to private document
router.post('/request_access', protect, isActive, async (req, res) => {
  try {
    const { doc_id } = req.body;
    const user = req.user;

    if (!doc_id) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const document = await Document.findById(doc_id);
    if (!document) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const existingRequest = await FacultyDocumentRequest.findOne({
      requester_id: user._id,
      doc_id
    });

    if (existingRequest) {
      return res.status(409).json({ message: 'Request already created' });
    }

    await FacultyDocumentRequest.create({
      doc_id,
      fac_id: document.owner,
      requester_id: user._id
    });

    res.json({ message: 'Request submitted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error submitting request' });
  }
});

// Approve document access
router.put('/approve_document', protect, isActive, async (req, res) => {
  try {
    const { doc_id, requester_id } = req.body;
    const user = req.user;

    const document = await Document.findById(doc_id);
    if (!document) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const isOwner = document.owner && document.owner.toString() === user._id.toString();
    if (!isOwner && !user.is_admin) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const allowedUsers = document.allowed_users || [];
    const requesterObjId = requester_id;
    const alreadyAllowed = allowedUsers.some(u => u.toString() === requesterObjId.toString());
    if (!alreadyAllowed) {
      allowedUsers.push(requesterObjId);
    }

    await Document.findByIdAndUpdate(doc_id, { allowed_users: allowedUsers });
    await FacultyDocumentRequest.findOneAndDelete({ doc_id, requester_id });

    res.json({ message: 'Access provided' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error approving request' });
  }
});

// Delete request
router.delete('/delete_request', protect, isActive, async (req, res) => {
  try {
    const { doc_id, requester_id } = req.query;
    const user = req.user;

    if (!doc_id || !requester_id) {
      return res.status(400).json({ message: 'Please provide valid request details' });
    }

    const existingReq = await FacultyDocumentRequest.findOne({ doc_id, requester_id: parseInt(requester_id) });
    if (!existingReq) {
      return res.status(400).json({ message: 'Please provide valid request details' });
    }

    if (existingReq.requester_id === parseInt(requester_id) || existingReq.fac_id === user._id) {
      await FacultyDocumentRequest.findOneAndDelete({ doc_id, requester_id: parseInt(requester_id) });
      return res.json({ message: 'Request deleted' });
    }

    res.status(400).json({ message: 'Request does not belong to you' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error deleting request' });
  }
});

// Faculty submit document for admin approval
router.post('/submit_document_for_approval', protect, isAdminOrFaculty, isActive, upload.any(), async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    // If user is admin, directly upload without approval
    if (user.is_admin) {
      // Redirect to normal upload logic
      const userData = {
        title: data.title,
        docType: data.documentType,
        coverType: data.coverType,
        isPublic: data.isPublic,
        owner: user._id,
        comments: [],
        allowed_users: [],
        createDate: new Date().toISOString(),
        category: data.category,
        department: data.department,
        subject: data.subject,
        authors: data.authors,
        accessionNumber: data.accessionNumber
      };

      if (data.coverType === 'link') userData.coverLink = data.coverLink;
      if (data.documentType === 'link') userData.documentLink = data.documentLink;

      const newDoc = await Document.create(userData);
      const docId = newDoc._id.toString();

      if (data.coverType !== 'link') {
        const coverFiles = req.files.filter(f => f.fieldname === 'cover');
        if (coverFiles.length > 0) {
          const coverPath = await fileHandler.createFile(data.category, docId, 'cover', coverFiles);
          if (coverPath) await Document.findByIdAndUpdate(docId, { cover_path: JSON.stringify(coverPath) });
        }
      }

      if (data.documentType !== 'link') {
        const docFiles = req.files.filter(f => f.fieldname === 'documents');
        if (docFiles.length > 0) {
          const documentPath = await fileHandler.createFile(data.category, docId, 'document', docFiles);
          if (documentPath) await Document.findByIdAndUpdate(docId, { document_path: JSON.stringify(documentPath) });
        }
      }

      return res.json({ message: 'Document uploaded successfully' });
    }

    // For faculty, create pending upload request
    const pendingData = {
      title: data.title,
      authors: data.authors || '',
      docType: data.documentType,
      coverType: data.coverType || 'none',
      department: data.department || '',
      category: data.category || '',
      subject: data.subject || '',
      accessionNumber: data.accessionNumber || '',
      isPublic: data.isPublic === 'true' || data.isPublic === true,
      faculty_id: user._id,
      faculty_name: `${user.first_name} ${user.last_name}`,
      faculty_email: user.email,
      status: 'pending'
    };

    if (data.documentType === 'link') {
      pendingData.link = data.documentLink || '';
    }

    if (data.coverType === 'link') {
      pendingData.coverLink = data.coverLink || '';
    }

    // Save files temporarily
    if (req.files && req.files.length > 0) {
      const docFiles = req.files.filter(f => f.fieldname === 'documents');
      if (docFiles.length > 0) {
        pendingData.fileName = docFiles[0].originalname;
        pendingData.filePath = docFiles[0].buffer.toString('base64');
      }

      const coverFiles = req.files.filter(f => f.fieldname === 'cover');
      if (coverFiles.length > 0) {
        pendingData.coverFileName = coverFiles[0].originalname;
        pendingData.coverPath = coverFiles[0].buffer.toString('base64');
      }
    }

    const newPending = await PendingDocumentUpload.create(pendingData);
    
    res.json({ message: 'Document submitted for admin approval' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error submitting document for approval' });
  }
});

// Get pending document uploads (Admin only)
router.get('/get_pending_uploads', protect, isAdmin, async (req, res) => {
  try {
    const pending = await PendingDocumentUpload.find({ status: 'pending' }).sort({ createdAt: -1 });
    
    const uploads = pending.map(p => ({
      id: p._id.toString(),
      title: p.title,
      authors: p.authors,
      docType: p.docType,
      department: p.department,
      category: p.category,
      subject: p.subject,
      isPublic: p.isPublic,
      faculty_name: p.faculty_name,
      faculty_email: p.faculty_email,
      faculty_id: p.faculty_id,
      status: p.status,
      createdAt: p.createdAt
    }));

    res.json({ pending_uploads: uploads });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error fetching pending uploads' });
  }
});

// Approve or reject pending upload (Admin only)
router.post('/handle_pending_upload', protect, isAdmin, async (req, res) => {
  try {
    const { upload_id, action, comment } = req.body;

    if (!upload_id || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const pending = await PendingDocumentUpload.findById(upload_id);
    if (!pending) {
      return res.status(404).json({ message: 'Pending upload not found' });
    }

    if (action === 'approve') {
      // Create the actual document
      const docData = {
        title: pending.title,
        docType: pending.docType,
        coverType: pending.coverType || 'none',
        isPublic: pending.isPublic,
        owner: pending.faculty_id,
        comments: [],
        allowed_users: [],
        createDate: new Date().toISOString(),
        category: pending.category,
        department: pending.department,
        subject: pending.subject,
        authors: pending.authors,
        accessionNumber: pending.accessionNumber
      };

      if (pending.docType === 'link') {
        docData.documentLink = pending.link;
      }

      if (pending.coverType === 'link') {
        docData.coverLink = pending.coverLink;
      }

      const newDoc = await Document.create(docData);
      const docId = newDoc._id.toString();

      // If there's a document file stored, write it
      if (pending.filePath && pending.fileName) {
        const buffer = Buffer.from(pending.filePath, 'base64');
        const files = [{ originalname: pending.fileName, buffer }];
        const documentPath = await fileHandler.createFile(pending.category, docId, 'document', files);
        if (documentPath) {
          await Document.findByIdAndUpdate(docId, { document_path: JSON.stringify(documentPath) });
        }
      }

      // If there's a cover file stored, write it
      if (pending.coverPath && pending.coverFileName) {
        const coverBuffer = Buffer.from(pending.coverPath, 'base64');
        const coverFiles = [{ originalname: pending.coverFileName, buffer: coverBuffer }];
        const coverPath = await fileHandler.createFile(pending.category, docId, 'cover', coverFiles);
        if (coverPath) {
          await Document.findByIdAndUpdate(docId, { cover_path: JSON.stringify(coverPath) });
        }
      }

      pending.status = 'approved';
      pending.admin_comment = comment || '';
      await pending.save();

      return res.json({ message: 'Document approved and published' });
    } else if (action === 'reject') {
      pending.status = 'rejected';
      pending.admin_comment = comment || '';
      await pending.save();

      return res.json({ message: 'Document rejected' });
    }

    res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error handling pending upload' });
  }
});

// Get faculty's pending uploads
router.get('/get_my_pending_uploads', protect, isAdminOrFaculty, async (req, res) => {
  try {
    const user = req.user;
    const pending = await PendingDocumentUpload.find({ faculty_id: user._id }).sort({ createdAt: -1 });
    
    const uploads = pending.map(p => ({
      id: p._id.toString(),
      title: p.title,
      authors: p.authors,
      docType: p.docType,
      department: p.department,
      category: p.category,
      status: p.status,
      admin_comment: p.admin_comment,
      createdAt: p.createdAt
    }));

    res.json({ pending_uploads: uploads });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error fetching pending uploads' });
  }
});

module.exports = router;
