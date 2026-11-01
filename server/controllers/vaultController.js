const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const { uploadsDir } = require('../config/storage');
const { hasStoredFile } = require('../services/fileAvailability');

exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const docs = await Document.findByUserId(userId);
        res.json(docs.map(doc => ({ ...doc, available: hasStoredFile(doc) })));
    } catch (err) {
        console.error("Get Docs Error:", err);
        res.status(500).json({ error: "Failed to fetch documents" });
    }
};

exports.exportAllDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const docs = await Document.findByUserId(userId);
        if (!docs.length) return res.status(404).json({ error: "Your vault is empty" });

        const zipService = require('../services/zipService');
        await zipService.createBundle(userId, null, 'AgriComply_Vault_Export', res, { preserveNames: true });
    } catch (err) {
        console.error("Vault Export Error:", err);
        if (!res.headersSent) {
            const unavailable = err.code === 'VAULT_FILES_UNAVAILABLE';
            const count = Number(err.unavailableCount) || 0;
            res.status(unavailable ? 409 : 500).json({
                error: unavailable
                    ? count + ' saved file' + (count === 1 ? ' is' : 's are') + ' unavailable. Replace the affected file' + (count === 1 ? '' : 's') + ' before exporting.'
                    : "Could not export your vault"
            });
        }
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const userId = req.user.id;
        const { tag } = req.body;



        await Document.create({
            user_id: userId,
            originalFilename: req.file.originalname,
            storedFilename: req.file.filename,
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

        const storedFilename = path.basename(String(doc.stored_filename || doc.file_path || '').replace(/\\/g, '/'));
        const downloadName = path.basename(String(doc.filename || doc.file_name || storedFilename).replace(/\\/g, '/'));
        if (!storedFilename || !downloadName) return res.status(404).json({ error: "File not found" });

        const filePath = path.join(uploadsDir, storedFilename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File is no longer available. Replace it with a new copy to restore it." });
        }

        return res.download(filePath, downloadName);
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


        const fileName = path.basename(String(doc.stored_filename || doc.file_path || '').replace(/\\/g, '/'));

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


        const oldFileName = path.basename(String(oldDoc.stored_filename || oldDoc.file_path || '').replace(/\\/g, '/'));
        const oldPath = oldFileName ? path.join(uploadsDir, oldFileName) : null;

        await Document.update(fileId, {
            originalFilename: req.file.originalname,
            storedFilename: req.file.filename,
            type: req.file.mimetype,
            size: req.file.size,
            upload_date: new Date()
        });

        if (oldPath && oldPath !== req.file.path && fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }

        res.json({ message: "Document replaced successfully" });

    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error("Replace Error:", err);
        res.status(500).json({ error: "Replace failed" });
    }
};
