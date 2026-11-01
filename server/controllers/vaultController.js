const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const { uploadsDir } = require('../config/storage');

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

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const userId = req.user.id;
        const { tag } = req.body;
        
        
        
        await Document.create({
            user_id: userId,
            filename: req.file.filename, 
            tag: tag || "UNCATEGORIZED", 
            type: req.file.mimetype,
            size: req.file.size
        });

        res.status(201).json({ message: "Upload successful" });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Database error during upload" });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc || String(doc.user_id) !== String(req.user.id)) {
            return res.status(404).json({ error: "File not found" });
        }

        const fileName = path.basename(doc.filename || doc.file_path || '');
        if (!fileName) return res.status(404).json({ error: "File not found" });

        const filePath = path.join(uploadsDir, fileName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File is no longer available" });

        return res.download(filePath, fileName);
    } catch (err) {
        console.error("Download Error:", err);
        return res.status(500).json({ error: "Download failed" });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const fileId = req.params.id;
        
        
        const doc = await Document.findById(fileId);
        if (!doc || String(doc.user_id) !== String(req.user.id)) return res.status(404).json({ error: "File not found" });

        
        const fileName = doc.filename || doc.file_path; 

        if (fileName) {
            
            const filePath = path.join(uploadsDir, fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } else {
            console.warn("File record found but no filename/path associated.");
        }

        
        await Document.delete(fileId);

        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ error: "Delete failed" });
    }
};

exports.replaceDocument = async (req, res) => {
    try {
        const fileId = req.params.id;
        
        if (!req.file) return res.status(400).json({ error: "No new file uploaded" });

        
        const oldDoc = await Document.findById(fileId);
        if (!oldDoc || String(oldDoc.user_id) !== String(req.user.id)) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Original file not found" });
        }

        
        const oldFileName = oldDoc.filename || oldDoc.file_path;

        if (oldFileName) {
            
            const oldPath = path.join(uploadsDir, oldFileName);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        
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
