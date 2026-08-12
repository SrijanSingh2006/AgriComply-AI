const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// 1. Get All Documents for User
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const docs = await Document.findByUserId(userId);
        res.json(docs);
    } catch (err) {
        console.error("Get Docs Error:", err);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
};

// 2. Upload New Document
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const userId = req.user.id;
        const { tag } = req.body;
        
        // Save to DB
        // Note: Our updated Model maps this correctly to 'file_path'
        await Document.create({
            user_id: userId,
            filename: req.file.filename, 
            tag: tag || "UNCATEGORIZED", 
            type: req.file.mimetype,
            size: req.file.size
        });

        res.status(201).json({ message: "Upload successful" });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Database error during upload" });
    }
};

// 3. Delete Document
exports.deleteDocument = async (req, res) => {
    try {
        const fileId = req.params.id;
        
        // Find file in DB
        const doc = await Document.findById(fileId);
        if (!doc) return res.status(404).json({ error: "File not found" });

        // FIX: Safely get the filename (handle 'filename' OR 'file_path')
        const fileName = doc.filename || doc.file_path; 

        if (fileName) {
            // Delete actual file from 'uploads' folder
            const filePath = path.join(__dirname, '../../uploads', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } else {
            console.warn("File record found but no filename/path associated.");
        }

        // Delete entry from DB
        await Document.delete(fileId);

        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
};

// 4. Replace Document
exports.replaceDocument = async (req, res) => {
    try {
        const fileId = req.params.id;
        
        if (!req.file) return res.status(400).json({ error: "No new file uploaded" });

        // Find old file
        const oldDoc = await Document.findById(fileId);
        if (!oldDoc) return res.status(404).json({ error: "Original file not found" });

        // FIX: Safely get the old filename
        const oldFileName = oldDoc.filename || oldDoc.file_path;

        if (oldFileName) {
            // Delete old file from disk
            const oldPath = path.join(__dirname, '../../uploads', oldFileName);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update DB with new filename and date
        await Document.update(fileId, {
            filename: req.file.filename,
            type: req.file.mimetype,
            size: req.file.size,
            upload_date: new Date()
        });

        res.json({ message: "Document replaced successfully" });

    } catch (err) {
        console.error("Replace Error:", err);
        res.status(500).json({ error: "Replace failed" });
    }
};